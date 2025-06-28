
import { User } from './types';

export const getUserLocationName = (user: User): string => {
  if (user.role === 'super_admin') return 'সব এলাকা';
  
  const scope = user.accessScope;
  if (!scope) return 'অজানা এলাকা';

  switch (user.role) {
    case 'division_admin':
      return scope.division_name || 'বিভাগ';
    case 'district_admin':
      return scope.district_name || 'জেলা';
    case 'upazila_admin':
      return scope.upazila_name || 'উপজেলা';
    case 'village_admin':
      return scope.village_name || 'গ্রাম';
    default:
      return 'অজানা এলাকা';
  }
};

export const canUserAccessLocation = (user: User, locationScope: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}): boolean => {
  if (user.role === 'super_admin') return true;

  const userScope = user.accessScope;
  if (!userScope) return false;

  switch (user.role) {
    case 'division_admin':
      return locationScope.division_id === userScope.division_id;
    case 'district_admin':
      return locationScope.district_id === userScope.district_id;
    case 'upazila_admin':
      return locationScope.upazila_id === userScope.upazila_id;
    case 'village_admin':
      return locationScope.village_id === userScope.village_id;
    default:
      return false;
  }
};

export const getFilteredVotersForUser = (user: User, voters: any[]): any[] => {
  if (user.role === 'super_admin') return voters;

  return voters.filter(voter => canUserAccessLocation(user, {
    division_id: voter.division_id,
    district_id: voter.district_id,
    upazila_id: voter.upazila_id,
    union_id: voter.union_id,
    village_id: voter.village_id
  }));
};

export const canUserManageRole = (managerRole: string, targetRole: string): boolean => {
  const hierarchy: Record<string, string[]> = {
    super_admin: ['division_admin'],
    division_admin: ['district_admin'],
    district_admin: ['upazila_admin'],
    upazila_admin: ['village_admin']
  };

  return hierarchy[managerRole]?.includes(targetRole) || false;
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    super_admin: 'সুপার অ্যাডমিন',
    division_admin: 'বিভাগীয় অ্যাডমিন',
    district_admin: 'জেলা অ্যাডমিন',
    upazila_admin: 'উপজেলা অ্যাডমিন',
    village_admin: 'গ্রাম অ্যাডমিন'
  };
  return roleNames[role] || 'অজানা';
};

export const getLocationScopeForRole = (role: string, userScope: any) => {
  switch (role) {
    case 'super_admin':
      return {};
    case 'division_admin':
      return {
        division_id: userScope.division_id,
        division_name: userScope.division_name
      };
    case 'district_admin':
      return {
        division_id: userScope.division_id,
        district_id: userScope.district_id,
        division_name: userScope.division_name,
        district_name: userScope.district_name
      };
    case 'upazila_admin':
      return {
        division_id: userScope.division_id,
        district_id: userScope.district_id,
        upazila_id: userScope.upazila_id,
        division_name: userScope.division_name,
        district_name: userScope.district_name,
        upazila_name: userScope.upazila_name
      };
    case 'village_admin':
      return userScope;
    default:
      return {};
  }
};
