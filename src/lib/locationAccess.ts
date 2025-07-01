import { User, UserRole, VoterData } from './types';

export interface LocationScope {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

export interface LocationAccessOptions {
  showDivisionFilter: boolean;
  showDistrictFilter: boolean;
  showUpazilaFilter: boolean;
  showUnionFilter: boolean;
  showVillageFilter: boolean;
  fixedDivision: string;
  fixedDistrict: string;
  fixedUpazila: string;
  fixedUnion: string;
  fixedVillage: string;
}

/**
 * Check if a user can access data from a specific location
 */
export const canAccessLocation = (user: User, targetLocation: LocationScope): boolean => {
  if (user.role === 'super_admin') {
    return true;
  }

  const { accessScope } = user;
  
  switch (user.role) {
    case 'division_admin':
      return targetLocation.division_id === accessScope.division_id;
    
    case 'district_admin':
      return targetLocation.division_id === accessScope.division_id && 
             targetLocation.district_id === accessScope.district_id;
    
    case 'upazila_admin':
      return targetLocation.division_id === accessScope.division_id && 
             targetLocation.district_id === accessScope.district_id && 
             targetLocation.upazila_id === accessScope.upazila_id;
    
    case 'union_admin':
      return targetLocation.division_id === accessScope.division_id && 
             targetLocation.district_id === accessScope.district_id && 
             targetLocation.upazila_id === accessScope.upazila_id && 
             targetLocation.union_id === accessScope.union_id;
    
    case 'village_admin':
      return targetLocation.division_id === accessScope.division_id && 
             targetLocation.district_id === accessScope.district_id && 
             targetLocation.upazila_id === accessScope.upazila_id && 
             targetLocation.union_id === accessScope.union_id && 
             targetLocation.village_id === accessScope.village_id;
    
    default:
      return false;
  }
};

/**
 * Filter voters based on user's location access scope
 */
export const filterVotersByAccess = (voters: VoterData[], user: User): VoterData[] => {
  if (user.role === 'super_admin') {
    return voters;
  }

  return voters.filter(voter => canAccessLocation(user, {
    division_id: voter.division_id,
    district_id: voter.district_id,
    upazila_id: voter.upazila_id,
    union_id: voter.union_id,
    village_id: voter.village_id,
  }));
};

/**
 * Get location access options for user creation based on current user's role
 */
export const getLocationAccessOptions = (currentUser: User, targetRole: UserRole): LocationAccessOptions => {
  const { role, accessScope } = currentUser;
  
  const options: LocationAccessOptions = {
    showDivisionFilter: false,
    showDistrictFilter: false,
    showUpazilaFilter: false,
    showUnionFilter: false,
    showVillageFilter: false,
    fixedDivision: '',
    fixedDistrict: '',
    fixedUpazila: '',
    fixedUnion: '',
    fixedVillage: '',
  };

  // Determine what location fields should be shown/fixed based on role hierarchy
  switch (role) {
    case 'super_admin':
      // Super admin can assign any location for any role
      switch (targetRole) {
        case 'division_admin':
          options.showDivisionFilter = true;
          break;
        case 'district_admin':
          options.showDivisionFilter = true;
          options.showDistrictFilter = true;
          break;
        case 'upazila_admin':
          options.showDivisionFilter = true;
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          break;
        case 'union_admin':
          options.showDivisionFilter = true;
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          break;
        case 'village_admin':
          options.showDivisionFilter = true;
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          options.showVillageFilter = true;
          break;
      }
      break;

    case 'division_admin':
      // Division admin can only assign within their division
      options.fixedDivision = accessScope.division_id || '';
      switch (targetRole) {
        case 'district_admin':
          options.showDistrictFilter = true;
          break;
        case 'upazila_admin':
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          break;
        case 'union_admin':
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          break;
        case 'village_admin':
          options.showDistrictFilter = true;
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          options.showVillageFilter = true;
          break;
      }
      break;

    case 'district_admin':
      // District admin can only assign within their district
      options.fixedDivision = accessScope.division_id || '';
      options.fixedDistrict = accessScope.district_id || '';
      switch (targetRole) {
        case 'upazila_admin':
          options.showUpazilaFilter = true;
          break;
        case 'union_admin':
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          break;
        case 'village_admin':
          options.showUpazilaFilter = true;
          options.showUnionFilter = true;
          options.showVillageFilter = true;
          break;
      }
      break;

    case 'upazila_admin':
      // Upazila admin can only assign within their upazila
      options.fixedDivision = accessScope.division_id || '';
      options.fixedDistrict = accessScope.district_id || '';
      options.fixedUpazila = accessScope.upazila_id || '';
      switch (targetRole) {
        case 'union_admin':
          options.showUnionFilter = true;
          break;
        case 'village_admin':
          options.showUnionFilter = true;
          options.showVillageFilter = true;
          break;
      }
      break;

    case 'union_admin':
      // Union admin can only assign within their union
      options.fixedDivision = accessScope.division_id || '';
      options.fixedDistrict = accessScope.district_id || '';
      options.fixedUpazila = accessScope.upazila_id || '';
      options.fixedUnion = accessScope.union_id || '';
      if (targetRole === 'village_admin') {
        options.showVillageFilter = true;
      }
      break;
  }

  return options;
};

/**
 * Get required location fields for a specific role
 */
export const getRequiredLocationFields = (role: UserRole): string[] => {
  switch (role) {
    case 'super_admin':
      return [];
    case 'division_admin':
      return ['division_id'];
    case 'district_admin':
      return ['division_id', 'district_id'];
    case 'upazila_admin':
      return ['division_id', 'district_id', 'upazila_id'];
    case 'union_admin':
      return ['division_id', 'district_id', 'upazila_id', 'union_id'];
    case 'village_admin':
      return ['division_id', 'district_id', 'upazila_id', 'union_id', 'village_id'];
    default:
      return [];
  }
};

/**
 * Validate location hierarchy (ensure child locations belong to parent locations)
 */
export const validateLocationHierarchy = (
  divisionId: string,
  districtId: string,
  upazilaId: string,
  unionId: string,
  villageId: string,
  locationData: {
    divisions: any[];
    districts: any[];
    upazilas: any[];
    unions: any[];
    villages: any[];
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate district belongs to division
  if (divisionId && districtId) {
    const district = locationData.districts.find(d => d.id === districtId);
    if (district && district.division_id !== divisionId) {
      errors.push('Selected district does not belong to the selected division');
    }
  }

  // Validate upazila belongs to district
  if (districtId && upazilaId) {
    const upazila = locationData.upazilas.find(u => u.id === upazilaId);
    if (upazila && upazila.district_id !== districtId) {
      errors.push('Selected upazila does not belong to the selected district');
    }
  }

  // Validate union belongs to upazila
  if (upazilaId && unionId) {
    const union = locationData.unions.find(u => u.id === unionId);
    if (union && union.upazilla_id !== upazilaId) {
      errors.push('Selected union does not belong to the selected upazila');
    }
  }

  // Validate village belongs to union
  if (unionId && villageId) {
    const village = locationData.villages.find(v => v.id.toString() === villageId);
    if (village && village.union_id.toString() !== unionId) {
      errors.push('Selected village does not belong to the selected union');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get location scope for a user based on their role and selected locations
 */
export const getLocationScope = (
  role: UserRole,
  divisionId: string,
  districtId: string,
  upazilaId: string,
  unionId: string,
  villageId: string
): LocationScope => {
  switch (role) {
    case 'super_admin':
      return {};
    case 'division_admin':
      return { division_id: divisionId };
    case 'district_admin':
      return { division_id: divisionId, district_id: districtId };
    case 'upazila_admin':
      return { division_id: divisionId, district_id: districtId, upazila_id: upazilaId };
    case 'union_admin':
      return { division_id: divisionId, district_id: districtId, upazila_id: upazilaId, union_id: unionId };
    case 'village_admin':
      return { division_id: divisionId, district_id: districtId, upazila_id: upazilaId, union_id: unionId, village_id: villageId };
    default:
      return {};
  }
};

/**
 * Check if a user can create another user with a specific role
 */
export const canCreateUserWithRole = (currentUser: User, targetRole: UserRole): boolean => {
  // Super admin can create any role
  if (currentUser.role === 'super_admin') {
    return true;
  }

  // Check role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 0,
    division_admin: 1,
    district_admin: 2,
    upazila_admin: 3,
    union_admin: 4,
    village_admin: 5,
  };

  const currentUserLevel = roleHierarchy[currentUser.role];
  const targetRoleLevel = roleHierarchy[targetRole];

  // Can only create users with higher level (lower number = higher authority)
  return targetRoleLevel > currentUserLevel;
};

/**
 * Get available roles that a user can create
 */
export const getAvailableRolesForCreation = (currentUser: User): UserRole[] => {
  const allRoles: UserRole[] = ['super_admin', 'division_admin', 'district_admin', 'upazila_admin', 'union_admin', 'village_admin'];
  
  return allRoles.filter(role => canCreateUserWithRole(currentUser, role));
};

/**
 * Format location display string
 */
export const formatLocationDisplay = (
  divisionName?: string,
  districtName?: string,
  upazilaName?: string,
  unionName?: string,
  villageName?: string
): string => {
  const parts = [villageName, unionName, upazilaName, districtName, divisionName].filter(Boolean);
  return parts.join(' > ');
}; 