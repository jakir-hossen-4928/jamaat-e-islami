import { User } from './types';

export const ROLE_HIERARCHY = {
  super_admin: 0,
  division_admin: 1,
  district_admin: 2,
  ward_admin: 3,
  moderator: 4,
  user: 5,
  admin: 0 // Legacy support
};

export const ROLE_PERMISSIONS = {
  super_admin: {
    canManageUsers: true,
    canManageRoles: true,
    canAccessAllData: true,
    canDeleteData: true,
    canEditData: true,
    canViewReports: true,
    canManageCampaigns: true,
    scope: 'all'
  },
  division_admin: {
    canManageUsers: true,
    canManageRoles: true,
    canAccessAllData: false,
    canDeleteData: true,
    canEditData: true,
    canViewReports: true,
    canManageCampaigns: true,
    scope: 'division'
  },
  district_admin: {
    canManageUsers: true,
    canManageRoles: false,
    canAccessAllData: false,
    canDeleteData: true,
    canEditData: true,
    canViewReports: true,
    canManageCampaigns: true,
    scope: 'district'
  },
  ward_admin: {
    canManageUsers: false,
    canManageRoles: false,
    canAccessAllData: false,
    canDeleteData: false,
    canEditData: true,
    canViewReports: true,
    canManageCampaigns: false,
    scope: 'ward'
  },
  moderator: {
    canManageUsers: false,
    canManageRoles: false,
    canAccessAllData: false,
    canDeleteData: false,
    canEditData: true,
    canViewReports: false,
    canManageCampaigns: false,
    scope: 'assigned'
  },
  user: {
    canManageUsers: false,
    canManageRoles: false,
    canAccessAllData: false,
    canDeleteData: false,
    canEditData: false,
    canViewReports: false,
    canManageCampaigns: false,
    scope: 'own'
  },
  admin: { // Legacy support
    canManageUsers: true,
    canManageRoles: true,
    canAccessAllData: true,
    canDeleteData: true,
    canEditData: true,
    canViewReports: true,
    canManageCampaigns: true,
    scope: 'all'
  }
};

type PermissionKey = 'canManageUsers' | 'canManageRoles' | 'canAccessAllData' | 'canDeleteData' | 'canEditData' | 'canViewReports' | 'canManageCampaigns';

export const hasPermission = (user: User, permission: PermissionKey): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions) return false;
  
  const permissionValue = rolePermissions[permission];
  return typeof permissionValue === 'boolean' ? permissionValue : false;
};

export const canAccessLocation = (user: User, locationIds: {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  ward_id?: string;
}): boolean => {
  // Super admin and legacy admin can access everything
  if (user.role === 'super_admin' || user.role === 'admin') {
    return true;
  }

  // Check role-based location access
  switch (user.role) {
    case 'division_admin':
      return user.division_id === locationIds.division_id;
    
    case 'district_admin':
      return user.district_id === locationIds.district_id;
    
    case 'ward_admin':
      return user.ward_id === locationIds.ward_id;
    
    case 'moderator':
      // Moderators can access data within their assigned area
      return (
        (user.division_id === locationIds.division_id) ||
        (user.district_id === locationIds.district_id) ||
        (user.ward_id === locationIds.ward_id)
      );
    
    case 'user':
      // Users can only access their own data
      return false;
    
    default:
      return false;
  }
};

export const getAccessibleLocationFilter = (user: User) => {
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      return {}; // No filter, can access all
    
    case 'division_admin':
      return { division_id: user.division_id };
    
    case 'district_admin':
      return { district_id: user.district_id };
    
    case 'ward_admin':
      return { ward_id: user.ward_id };
    
    case 'moderator':
      const filter: any = {};
      if (user.division_id) filter.division_id = user.division_id;
      if (user.district_id) filter.district_id = user.district_id;
      if (user.ward_id) filter.ward_id = user.ward_id;
      return filter;
    
    case 'user':
      return { collector: user.uid }; // Only their own data
    
    default:
      return { collector: user.uid };
  }
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    super_admin: 'সুপার অ্যাডমিন',
    division_admin: 'বিভাগীয় অ্যাডমিন',
    district_admin: 'জেলা অ্যাডমিন',
    ward_admin: 'ওয়ার্ড অ্যাডমিন',
    moderator: 'মডারেটর',
    user: 'ব্যবহারকারী',
    admin: 'অ্যাডমিন'
  };
  return roleNames[role as keyof typeof roleNames] || 'অজানা';
};

export const getAssignableRoles = (currentUserRole: string): string[] => {
  switch (currentUserRole) {
    case 'super_admin':
    case 'admin':
      return ['division_admin', 'district_admin', 'ward_admin', 'moderator', 'user'];
    
    case 'division_admin':
      return ['district_admin', 'ward_admin', 'moderator', 'user'];
    
    case 'district_admin':
      return ['ward_admin', 'moderator', 'user'];
    
    case 'ward_admin':
      return ['moderator', 'user'];
    
    default:
      return [];
  }
};
