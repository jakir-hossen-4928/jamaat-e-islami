
import { User, RolePermissions } from './types';

export const getRolePermissions = (role: User['role']): RolePermissions => {
  switch (role) {
    case 'super_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canAssignRoles: ['village_admin'],
        canVerifyUsers: true,
        canAccessDataHub: true,
        canAccessAllVoters: true,
        locationScope: 'all'
      };
    case 'village_admin':
      return {
        canCreate: true,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canAssignRoles: [],
        canVerifyUsers: false,
        canAccessDataHub: false,
        canAccessAllVoters: false,
        locationScope: 'village'
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
        locationScope: 'village'
      };
  }
};

export const canAccessLocation = (user: User, targetLocation: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}): boolean => {
  if (user.role === 'super_admin') return true;

  const userScope = user.accessScope;
  
  switch (user.role) {
    case 'village_admin':
      return targetLocation.village_id === userScope.village_id;
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
    village_id: voter.village_id
  }));
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    super_admin: 'সুপার অ্যাডমিন',
    village_admin: 'গ্রাম অ্যাডমিন'
  };
  return roleNames[role as keyof typeof roleNames] || 'অজানা';
};

export const canVerifyRole = (verifierRole: string, roleToVerify: string): boolean => {
  const hierarchy = {
    super_admin: ['village_admin']
  };
  
  return hierarchy[verifierRole as keyof typeof hierarchy]?.includes(roleToVerify) || false;
};

export const getLocationBasedUsers = (currentUser: User, allUsers: User[]): User[] => {
  if (currentUser.role === 'super_admin') {
    return allUsers;
  }

  return allUsers.filter(user => {
    // Village admin can only see users in their village
    const userScope = currentUser.accessScope;
    const targetScope = user.accessScope;

    switch (currentUser.role) {
      case 'village_admin':
        return targetScope.village_id === userScope.village_id;
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
