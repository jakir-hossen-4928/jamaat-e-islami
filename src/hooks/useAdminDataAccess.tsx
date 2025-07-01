
import { useDataAccess } from '@/contexts/DataAccessContext';
import { useAuth } from './useAuth';
import { useMemo } from 'react';
import { VoterData, User } from '@/lib/types';

// Super Admin Hook - Full access to everything
export const useSuperAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isSuperAdmin = useMemo(() => {
    return userProfile?.role === 'super_admin';
  }, [userProfile]);

  return {
    ...dataAccess,
    isSuperAdmin,
    canAccessEverything: true,
    getAllVoters: (voters: VoterData[]) => voters, // No filtering for super admin
    getAllUsers: (users: User[]) => users, // No filtering for super admin
    canManageAllUsers: true,
    canAssignAnyRole: true,
    getAccessibleLocations: () => ({
      divisions: 'all',
      districts: 'all', 
      upazilas: 'all',
      unions: 'all',
      villages: 'all'
    })
  };
};

// Division Admin Hook - Access to division level data
export const useDivisionAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isDivisionAdmin = useMemo(() => {
    return userProfile?.role === 'division_admin';
  }, [userProfile]);

  const divisionScope = useMemo(() => {
    return userProfile?.accessScope?.division_id;
  }, [userProfile]);

  const filterDivisionData = (voters: VoterData[]) => {
    if (!divisionScope) return [];
    return voters.filter(voter => voter.division_id === divisionScope);
  };

  const filterDivisionUsers = (users: User[]) => {
    if (!divisionScope) return [];
    return users.filter(user => user.accessScope?.division_id === divisionScope);
  };

  return {
    ...dataAccess,
    isDivisionAdmin,
    divisionScope,
    getDivisionVoters: filterDivisionData,
    getDivisionUsers: filterDivisionUsers,
    canAssignRoles: ['district_admin', 'upazila_admin', 'union_admin', 'village_admin'],
    getAccessibleLocations: () => ({
      divisions: [divisionScope],
      districts: 'within_division',
      upazilas: 'within_division', 
      unions: 'within_division',
      villages: 'within_division'
    })
  };
};

// District Admin Hook - Access to district level data
export const useDistrictAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isDistrictAdmin = useMemo(() => {
    return userProfile?.role === 'district_admin';
  }, [userProfile]);

  const districtScope = useMemo(() => {
    return userProfile?.accessScope?.district_id;
  }, [userProfile]);

  const filterDistrictData = (voters: VoterData[]) => {
    if (!districtScope) return [];
    return voters.filter(voter => voter.district_id === districtScope);
  };

  const filterDistrictUsers = (users: User[]) => {
    if (!districtScope) return [];
    return users.filter(user => user.accessScope?.district_id === districtScope);
  };

  return {
    ...dataAccess,
    isDistrictAdmin,
    districtScope,
    getDistrictVoters: filterDistrictData,
    getDistrictUsers: filterDistrictUsers,
    canAssignRoles: ['upazila_admin', 'union_admin', 'village_admin'],
    getAccessibleLocations: () => ({
      divisions: [userProfile?.accessScope?.division_id],
      districts: [districtScope],
      upazilas: 'within_district',
      unions: 'within_district', 
      villages: 'within_district'
    })
  };
};

// Upazila Admin Hook - Access to upazila level data
export const useUpazilaAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isUpazilaAdmin = useMemo(() => {
    return userProfile?.role === 'upazila_admin';
  }, [userProfile]);

  const upazilaScope = useMemo(() => {
    return userProfile?.accessScope?.upazila_id;
  }, [userProfile]);

  const filterUpazilaData = (voters: VoterData[]) => {
    if (!upazilaScope) return [];
    return voters.filter(voter => voter.upazila_id === upazilaScope);
  };

  const filterUpazilaUsers = (users: User[]) => {
    if (!upazilaScope) return [];
    return users.filter(user => user.accessScope?.upazila_id === upazilaScope);
  };

  return {
    ...dataAccess,
    isUpazilaAdmin,
    upazilaScope,
    getUpazilaVoters: filterUpazilaData,
    getUpazilaUsers: filterUpazilaUsers,
    canAssignRoles: ['union_admin', 'village_admin'],
    getAccessibleLocations: () => ({
      divisions: [userProfile?.accessScope?.division_id],
      districts: [userProfile?.accessScope?.district_id],
      upazilas: [upazilaScope],
      unions: 'within_upazila',
      villages: 'within_upazila'
    })
  };
};

// Union Admin Hook - Access to union level data
export const useUnionAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isUnionAdmin = useMemo(() => {
    return userProfile?.role === 'union_admin';
  }, [userProfile]);

  const unionScope = useMemo(() => {
    return userProfile?.accessScope?.union_id;
  }, [userProfile]);

  const filterUnionData = (voters: VoterData[]) => {
    if (!unionScope) return [];
    return voters.filter(voter => voter.union_id === unionScope);
  };

  const filterUnionUsers = (users: User[]) => {
    if (!unionScope) return [];
    return users.filter(user => user.accessScope?.union_id === unionScope);
  };

  return {
    ...dataAccess,
    isUnionAdmin,
    unionScope,
    getUnionVoters: filterUnionData,
    getUnionUsers: filterUnionUsers,
    canAssignRoles: ['village_admin'],
    getAccessibleLocations: () => ({
      divisions: [userProfile?.accessScope?.division_id],
      districts: [userProfile?.accessScope?.district_id], 
      upazilas: [userProfile?.accessScope?.upazila_id],
      unions: [unionScope],
      villages: 'within_union'
    })
  };
};

// Village Admin Hook - Access to village level data only
export const useVillageAdminAccess = () => {
  const { userProfile } = useAuth();
  const dataAccess = useDataAccess();

  const isVillageAdmin = useMemo(() => {
    return userProfile?.role === 'village_admin';
  }, [userProfile]);

  const villageScope = useMemo(() => {
    return userProfile?.accessScope?.village_id;
  }, [userProfile]);

  const filterVillageData = (voters: VoterData[]) => {
    if (!villageScope) return [];
    return voters.filter(voter => voter.village_id === villageScope);
  };

  // Village admin gets auto-location for voter entry
  const getAutoVoterLocation = () => {
    if (!userProfile?.accessScope) return {};
    return {
      division_id: userProfile.accessScope.division_id,
      district_id: userProfile.accessScope.district_id,
      upazila_id: userProfile.accessScope.upazila_id,
      union_id: userProfile.accessScope.union_id,
      village_id: userProfile.accessScope.village_id
    };
  };

  return {
    ...dataAccess,
    isVillageAdmin,
    villageScope,
    getVillageVoters: filterVillageData,
    getAutoVoterLocation,
    canAssignRoles: [], // Village admin cannot assign roles
    autoLocationEnabled: true,
    getAccessibleLocations: () => ({
      divisions: [userProfile?.accessScope?.division_id],
      districts: [userProfile?.accessScope?.district_id],
      upazilas: [userProfile?.accessScope?.upazila_id], 
      unions: [userProfile?.accessScope?.union_id],
      villages: [villageScope]
    })
  };
};

// Main hook that returns appropriate access based on user role
export const useRoleBasedAccess = () => {
  const { userProfile } = useAuth();
  
  const superAdminAccess = useSuperAdminAccess();
  const divisionAdminAccess = useDivisionAdminAccess();
  const districtAdminAccess = useDistrictAdminAccess();
  const upazilaAdminAccess = useUpazilaAdminAccess();
  const unionAdminAccess = useUnionAdminAccess();
  const villageAdminAccess = useVillageAdminAccess();

  switch (userProfile?.role) {
    case 'super_admin':
      return superAdminAccess;
    case 'division_admin':
      return divisionAdminAccess;
    case 'district_admin':
      return districtAdminAccess;
    case 'upazila_admin':
      return upazilaAdminAccess;
    case 'union_admin':
      return unionAdminAccess;
    case 'village_admin':
      return villageAdminAccess;
    default:
      return villageAdminAccess; // Default to most restricted access
  }
};
