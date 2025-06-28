
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { VoterData } from '@/lib/types';
import { canAccessLocation } from '@/lib/rbac';
import { loadLocationData } from '@/lib/locationUtils';

interface LocationFilter {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

interface LocationData {
  divisions: any[];
  districts: any[];
  upazilas: any[];
  unions: any[];
  villages: any[];
}

export const useLocationFilter = () => {
  const { userProfile } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<LocationFilter>({});
  const [locationData, setLocationData] = useState<LocationData>({
    divisions: [],
    districts: [],
    upazilas: [],
    unions: [],
    villages: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load location data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadLocationData();
        setLocationData({
          ...data,
          villages: [] // Empty for now, will be populated from villages.json when available
        });
      } catch (error) {
        console.error('Error loading location data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Set default filter based on user's access scope
  useEffect(() => {
    if (userProfile && userProfile.role !== 'super_admin') {
      const scope = userProfile.accessScope;
      setSelectedLocation({
        division_id: scope.division_id,
        district_id: scope.district_id,
        upazila_id: scope.upazila_id,
        union_id: scope.union_id,
        village_id: scope.village_id
      });
    }
  }, [userProfile]);

  const filterVoters = (voters: VoterData[]): VoterData[] => {
    if (!userProfile) return [];

    // Super admin sees all voters if no filter is applied
    if (userProfile.role === 'super_admin' && Object.keys(selectedLocation).length === 0) {
      return voters;
    }

    return voters.filter(voter => {
      // For super admin with applied filters
      if (userProfile.role === 'super_admin') {
        return Object.entries(selectedLocation).every(([key, value]) => {
          if (!value) return true;
          return voter[key as keyof VoterData] === value;
        });
      }

      // For other roles, check access permissions
      return canAccessLocation(userProfile, {
        division_id: voter.division_id,
        district_id: voter.district_id,
        upazila_id: voter.upazila_id,
        union_id: voter.union_id,
        village_id: voter.village_id
      });
    });
  };

  const canAccessData = (targetLocation: LocationFilter): boolean => {
    if (!userProfile) return false;
    if (userProfile.role === 'super_admin') return true;
    
    return canAccessLocation(userProfile, targetLocation);
  };

  return {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading,
    filterVoters,
    canAccessData,
    userProfile
  };
};
