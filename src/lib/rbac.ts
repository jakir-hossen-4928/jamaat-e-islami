
import { User, RolePermissions } from './types';

export const getRolePermissions = (role: User['role']): RolePermissions => {
  switch (role) {
    case 'super_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['super_admin', 'division_admin', 'district_admin', 'ward_admin', 'moderator', 'user'],
        locationScope: 'all'
      };
    case 'division_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['district_admin', 'ward_admin', 'moderator', 'user'],
        locationScope: 'division'
      };
    case 'district_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['ward_admin', 'moderator', 'user'],
        locationScope: 'district'
      };
    case 'ward_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssignRoles: ['moderator', 'user'],
        locationScope: 'ward'
      };
    case 'moderator':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssignRoles: [],
        locationScope: 'ward'
      };
    case 'user':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canAssignRoles: [],
        locationScope: 'ward'
      };
    default:
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canAssignRoles: [],
        locationScope: 'ward'
      };
  }
};

export const canAccessLocation = (user: User, targetLocation: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  ward_id?: string;
}): boolean => {
  if (user.role === 'super_admin') return true;

  const userScope = user.accessScope;
  
  switch (user.role) {
    case 'division_admin':
      return targetLocation.division_id === userScope.division_id;
    case 'district_admin':
      return targetLocation.district_id === userScope.district_id;
    case 'ward_admin':
    case 'moderator':
    case 'user':
      return targetLocation.ward_id === userScope.ward_id;
    default:
      return false;
  }
};

export const getAccessibleVoters = async (user: User, allVoters: any[]) => {
  if (user.role === 'super_admin') return allVoters;

  return allVoters.filter(voter => canAccessLocation(user, {
    division_id: voter.division_id,
    district_id: voter.district_id,
    upazila_id: voter.upazila_id,
    union_id: voter.union_id,
    ward_id: voter.ward_id
  }));
};
