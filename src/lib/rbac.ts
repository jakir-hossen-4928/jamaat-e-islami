
import { User, RolePermissions } from './types';

export const getRolePermissions = (role: User['role']): RolePermissions => {
  switch (role) {
    case 'super_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['division_admin', 'district_admin', 'upazila_admin', 'union_admin'],
        canVerifyUsers: true,
        canAccessDataHub: true,
        canAccessAllVoters: true,
        locationScope: 'all'
      };
    case 'division_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['district_admin', 'upazila_admin', 'union_admin'],
        canVerifyUsers: true,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'division'
      };
    case 'district_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['upazila_admin', 'union_admin'],
        canVerifyUsers: true,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'district'
      };
    case 'upazila_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canAssignRoles: ['union_admin'],
        canVerifyUsers: true,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'upazila'
      };
    case 'union_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canAssignRoles: [],
        canVerifyUsers: false,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'union'
      };
    default:
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canAssignRoles: [],
        canVerifyUsers: false,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'union'
      };
  }
};

export const canAccessLocation = (user: User, targetLocation: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
}): boolean => {
  if (user.role === 'super_admin') return true;

  const userScope = user.accessScope;
  
  switch (user.role) {
    case 'division_admin':
      return targetLocation.division_id === userScope.division_id;
    case 'district_admin':
      return targetLocation.district_id === userScope.district_id;
    case 'upazila_admin':
      return targetLocation.upazila_id === userScope.upazila_id;
    case 'union_admin':
      return targetLocation.union_id === userScope.union_id;
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
    union_id: voter.union_id
  }));
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    super_admin: 'সুপার অ্যাডমিন',
    division_admin: 'বিভাগীয় অ্যাডমিন',
    district_admin: 'জেলা অ্যাডমিন',
    upazila_admin: 'উপজেলা অ্যাডমিন',
    union_admin: 'ইউনিয়ন অ্যাডমিন'
  };
  return roleNames[role as keyof typeof roleNames] || 'অজানা';
};

export const canVerifyRole = (verifierRole: string, roleToVerify: string): boolean => {
  const hierarchy = {
    super_admin: ['division_admin', 'district_admin', 'upazila_admin', 'union_admin'],
    division_admin: ['district_admin', 'upazila_admin', 'union_admin'],
    district_admin: ['upazila_admin', 'union_admin'],
    upazila_admin: ['union_admin']
  };
  
  return hierarchy[verifierRole as keyof typeof hierarchy]?.includes(roleToVerify) || false;
};

export const getLocationBasedUsers = (currentUser: User, allUsers: User[]): User[] => {
  if (currentUser.role === 'super_admin') {
    return allUsers;
  }

  return allUsers.filter(user => {
    // Users can manage users in their location scope
    const userScope = currentUser.accessScope;
    const targetScope = user.accessScope;

    switch (currentUser.role) {
      case 'division_admin':
        return targetScope.division_id === userScope.division_id;
      case 'district_admin':
        return targetScope.district_id === userScope.district_id;
      case 'upazila_admin':
        return targetScope.upazila_id === userScope.upazila_id;
      case 'union_admin':
        return targetScope.union_id === userScope.union_id;
      default:
        return false;
    }
  });
};

export const canManageUser = (managerUser: User, targetUser: User): boolean => {
  // Super admin can manage all users
  if (managerUser.role === 'super_admin') return true;

  // Check if manager can assign the target user's role
  const permissions = getRolePermissions(managerUser.role);
  if (!permissions.canAssignRoles.includes(targetUser.role)) return false;

  // Check location scope
  return canAccessLocation(managerUser, targetUser.accessScope);
};
