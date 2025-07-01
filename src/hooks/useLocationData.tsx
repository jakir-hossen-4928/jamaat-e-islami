import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { loadLocationData } from '@/lib/locationUtils';
import { User, UserRole } from '@/lib/types';

interface LocationOption {
  id: string;
  name: string;
  bn_name?: string;
}

interface LocationData {
  divisions: any[];
  districts: any[];
  upazilas: any[];
  unions: any[];
  villages: any[];
}

interface LocationSelection {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

interface AvailableLocationOptions {
  showDivisionFilter: boolean;
  showDistrictFilter: boolean;
  showUpazilaFilter: boolean;
  showUnionFilter: boolean;
  showVillageFilter: boolean;
  fixedDivision?: string;
  fixedDistrict?: string;
  fixedUpazila?: string;
  fixedUnion?: string;
  fixedVillage?: string;
}

export const useLocationData = (userProfile?: User | null) => {
  const [locationData, setLocationData] = useState<LocationData>({
    divisions: [],
    districts: [],
    upazilas: [],
    unions: [],
    villages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await loadLocationData();
      setLocationData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Get filtered districts by division
  const getFilteredDistricts = (division_id?: string) => {
    if (!division_id) return [];
    return locationData.districts.filter((d) => d.division_id === division_id);
  };
  // Get filtered upazilas by district
  const getFilteredUpazilas = (district_id?: string) => {
    if (!district_id) return [];
    return locationData.upazilas.filter((u) => u.district_id === district_id);
  };
  // Get filtered unions by upazila
  const getFilteredUnions = (upazila_id?: string) => {
    if (!upazila_id) return [];
    return locationData.unions.filter((u) => u.upazilla_id === upazila_id);
  };
  // Get filtered villages by union
  const getFilteredVillages = (union_id?: string) => {
    if (!union_id) return [];
    return locationData.villages.filter((v) => v.union_id?.toString() === union_id);
  };

  // Get available location options and which dropdowns to show for a target role
  const getAvailableLocationOptions = (targetRole: UserRole) => {
    if (!userProfile) return {
      showDivisionFilter: false,
      showDistrictFilter: false,
      showUpazilaFilter: false,
      showUnionFilter: false,
      showVillageFilter: false,
    };
    const scope = userProfile.accessScope || {};
    switch (userProfile.role) {
      case 'super_admin':
        if (targetRole === 'division_admin') {
          return { showDivisionFilter: true, showDistrictFilter: false, showUpazilaFilter: false, showUnionFilter: false, showVillageFilter: false };
        }
        break;
      case 'division_admin':
        if (targetRole === 'district_admin') {
          return { showDivisionFilter: false, showDistrictFilter: true, showUpazilaFilter: false, showUnionFilter: false, showVillageFilter: false, fixedDivision: scope.division_id };
        }
        break;
      case 'district_admin':
        if (targetRole === 'upazila_admin') {
          return { showDivisionFilter: false, showDistrictFilter: false, showUpazilaFilter: true, showUnionFilter: false, showVillageFilter: false, fixedDivision: scope.division_id, fixedDistrict: scope.district_id };
        }
        break;
      case 'upazila_admin':
        if (targetRole === 'union_admin') {
          return { showDivisionFilter: false, showDistrictFilter: false, showUpazilaFilter: false, showUnionFilter: true, showVillageFilter: false, fixedDivision: scope.division_id, fixedDistrict: scope.district_id, fixedUpazila: scope.upazila_id };
        }
        break;
      case 'union_admin':
        if (targetRole === 'village_admin') {
          return { showDivisionFilter: false, showDistrictFilter: false, showUpazilaFilter: false, showUnionFilter: false, showVillageFilter: true, fixedDivision: scope.division_id, fixedDistrict: scope.district_id, fixedUpazila: scope.upazila_id, fixedUnion: scope.union_id };
        }
        break;
      default:
        return {
          showDivisionFilter: false,
          showDistrictFilter: false,
          showUpazilaFilter: false,
          showUnionFilter: false,
          showVillageFilter: false,
        };
    }
    return {
      showDivisionFilter: false,
      showDistrictFilter: false,
      showUpazilaFilter: false,
      showUnionFilter: false,
      showVillageFilter: false,
    };
  };

  // Validate that a selected location is within the allowed scope
  const validateLocationSelection = (targetRole: UserRole, selection: LocationSelection) => {
    if (!userProfile) return false;
    const scope = userProfile.accessScope || {};
    switch (userProfile.role) {
      case 'super_admin':
        return true;
      case 'division_admin':
        return selection.division_id === scope.division_id;
      case 'district_admin':
        return selection.division_id === scope.division_id && selection.district_id === scope.district_id;
      case 'upazila_admin':
        return selection.division_id === scope.division_id && selection.district_id === scope.district_id && selection.upazila_id === scope.upazila_id;
      case 'union_admin':
        return selection.division_id === scope.division_id && selection.district_id === scope.district_id && selection.upazila_id === scope.upazila_id && selection.union_id === scope.union_id;
      default:
        return false;
    }
  };

  // Get location names for display
  const getLocationNames = (selection: LocationSelection) => {
    const division = locationData.divisions.find((d) => d.id === selection.division_id);
    const district = locationData.districts.find((d) => d.id === selection.district_id);
    const upazila = locationData.upazilas.find((u) => u.id === selection.upazila_id);
    const union = locationData.unions.find((u) => u.id === selection.union_id);
    const village = locationData.villages.find((v) => v.id?.toString() === selection.village_id);
    return {
      division_name: division?.bn_name,
      district_name: district?.bn_name,
      upazila_name: upazila?.bn_name,
      union_name: union?.bn_name,
      village_name: village?.village,
    };
  };

  return {
    locationData,
    loading,
    getFilteredDistricts,
    getFilteredUpazilas,
    getFilteredUnions,
    getFilteredVillages,
    getAvailableLocationOptions,
    validateLocationSelection,
    getLocationNames,
  };
}; 