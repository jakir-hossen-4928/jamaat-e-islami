import { useAuth } from './useAuth';
import { User } from '@/lib/types';

interface LocationAccess {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

export const useLocationBasedAccess = () => {
  const { userProfile } = useAuth();

  // Check if user has access to a specific location
  const hasAccessToLocation = (targetLocation: LocationAccess): boolean => {
    if (!userProfile) return false;
    
    // Super admin has access to everything
    if (userProfile.role === 'super_admin') return true;
    
    const userScope = userProfile.accessScope || {};
    
    switch (userProfile.role) {
      case 'division_admin':
        return targetLocation.division_id === userScope.division_id;
      case 'district_admin':
        return targetLocation.division_id === userScope.division_id && 
               targetLocation.district_id === userScope.district_id;
      case 'upazila_admin':
        return targetLocation.division_id === userScope.division_id && 
               targetLocation.district_id === userScope.district_id && 
               targetLocation.upazila_id === userScope.upazila_id;
      case 'union_admin':
        return targetLocation.division_id === userScope.division_id && 
               targetLocation.district_id === userScope.district_id && 
               targetLocation.upazila_id === userScope.upazila_id && 
               targetLocation.union_id === userScope.union_id;
      case 'village_admin':
        return targetLocation.division_id === userScope.division_id && 
               targetLocation.district_id === userScope.district_id && 
               targetLocation.upazila_id === userScope.upazila_id && 
               targetLocation.union_id === userScope.union_id && 
               targetLocation.village_id === userScope.village_id;
      default:
        return false;
    }
  };

  // Check if user has access to a specific voter
  const hasAccessToVoter = (voter: any): boolean => {
    if (!userProfile) return false;
    
    // Super admin has access to all voters
    if (userProfile.role === 'super_admin') return true;
    
    const voterLocation: LocationAccess = {
      division_id: voter.division_id,
      district_id: voter.district_id,
      upazila_id: voter.upazila_id,
      union_id: voter.union_id,
      village_id: voter.village_id,
    };
    
    return hasAccessToLocation(voterLocation);
  };

  // Filter voters based on user's location access
  const filterVotersByAccess = (voters: any[]): any[] => {
    if (!userProfile) return [];
    
    // Super admin can see all voters
    if (userProfile.role === 'super_admin') return voters;
    
    return voters.filter(voter => hasAccessToVoter(voter));
  };

  // Get user's location scope for display
  const getUserLocationScope = (): string => {
    if (!userProfile?.accessScope) return 'সব জায়গা';
    
    const scope = userProfile.accessScope;
    const parts = [];
    
    if (scope.division_name) parts.push(scope.division_name);
    if (scope.district_name) parts.push(scope.district_name);
    if (scope.upazila_name) parts.push(scope.upazila_name);
    if (scope.union_name) parts.push(scope.union_name);
    if (scope.village_name) parts.push(scope.village_name);
    
    return parts.length > 0 ? parts.join(' → ') : 'সব জায়গা';
  };

  // Check if user can access a specific feature based on their role
  const canAccessFeature = (feature: string): boolean => {
    if (!userProfile) return false;
    
    switch (feature) {
      case 'voter_management':
        return ['super_admin', 'division_admin', 'district_admin', 'upazila_admin', 'union_admin', 'village_admin'].includes(userProfile.role);
      case 'analytics':
        return ['super_admin', 'division_admin', 'district_admin', 'upazila_admin'].includes(userProfile.role);
      case 'sms_campaigns':
        return ['super_admin', 'division_admin', 'district_admin'].includes(userProfile.role);
      case 'user_management':
        return ['super_admin', 'division_admin', 'district_admin', 'upazila_admin', 'union_admin'].includes(userProfile.role);
      case 'system_settings':
        return userProfile.role === 'super_admin';
      default:
        return false;
    }
  };

  return {
    userProfile,
    hasAccessToLocation,
    hasAccessToVoter,
    filterVotersByAccess,
    getUserLocationScope,
    canAccessFeature,
  };
}; 