
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VoterData, User } from '@/lib/types';
import { canAccessLocation } from '@/lib/rbac';

interface DataAccessScope {
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

interface UseRoleBasedDataAccessReturn {
  // Data access scope
  accessScope: DataAccessScope;
  canAccessAllData: boolean;
  
  // Voter data access
  getAccessibleVoters: (voters: VoterData[]) => VoterData[];
  createVoterQuery: (additionalFilters?: any) => any;
  canAddVoterInLocation: (voterLocation: DataAccessScope) => boolean;
  
  // User management access
  getAccessibleUsers: (users: User[]) => User[];
  canManageUser: (targetUser: User) => boolean;
  canAssignRole: (role: string) => boolean;
  
  // Location validation
  validateLocationAccess: (location: DataAccessScope) => boolean;
  getDefaultVoterLocation: () => DataAccessScope;
}

export const useRoleBasedDataAccess = (): UseRoleBasedDataAccessReturn => {
  const { userProfile } = useAuth();

  // Get user's access scope
  const accessScope = useMemo(() => {
    if (!userProfile?.accessScope) return {};
    return userProfile.accessScope;
  }, [userProfile]);

  // Check if user can access all data (super admin)
  const canAccessAllData = useMemo(() => {
    return userProfile?.role === 'super_admin';
  }, [userProfile]);

  // Filter voters based on user's role and location scope
  const getAccessibleVoters = (voters: VoterData[]): VoterData[] => {
    if (!userProfile || !Array.isArray(voters)) return [];
    
    if (canAccessAllData) return voters;

    return voters.filter(voter => {
      return canAccessLocation(userProfile, {
        division_id: voter.division_id,
        district_id: voter.district_id,
        upazila_id: voter.upazila_id,
        union_id: voter.union_id,
        village_id: voter.village_id
      });
    });
  };

  // Create Firestore query based on user's access scope
  const createVoterQuery = (additionalFilters: any = {}) => {
    if (!userProfile) return null;

    const votersRef = collection(db, 'voters');
    let constraints = [];

    // Add role-based location filters
    if (userProfile.role !== 'super_admin') {
      const scope = userProfile.accessScope;
      
      if (scope.village_id) {
        constraints.push(where('village_id', '==', scope.village_id));
      } else if (scope.union_id) {
        constraints.push(where('union_id', '==', scope.union_id));
      } else if (scope.upazila_id) {
        constraints.push(where('upazila_id', '==', scope.upazila_id));
      } else if (scope.district_id) {
        constraints.push(where('district_id', '==', scope.district_id));
      } else if (scope.division_id) {
        constraints.push(where('division_id', '==', scope.division_id));
      }
    }

    // Add additional filters
    Object.entries(additionalFilters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, '==', value));
      }
    });

    // Add default ordering
    constraints.push(orderBy('Last Updated', 'desc'));

    return query(votersRef, ...constraints);
  };

  // Check if user can add voter in specific location
  const canAddVoterInLocation = (voterLocation: DataAccessScope): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    return canAccessLocation(userProfile, voterLocation);
  };

  // Filter users based on role hierarchy and location scope
  const getAccessibleUsers = (users: User[]): User[] => {
    if (!userProfile || !Array.isArray(users)) return [];
    
    if (canAccessAllData) return users;

    return users.filter(user => {
      // Check if user is in the same location hierarchy
      const userScope = userProfile.accessScope;
      const targetScope = user.accessScope;

      if (!targetScope) return false;

      switch (userProfile.role) {
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

  // Check if user can manage another user
  const canManageUser = (targetUser: User): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    // Check role hierarchy
    const roleHierarchy = {
      division_admin: ['district_admin', 'upazila_admin', 'union_admin', 'village_admin'],
      district_admin: ['upazila_admin', 'union_admin', 'village_admin'],
      upazila_admin: ['union_admin', 'village_admin'],
      union_admin: ['village_admin']
    };

    const canAssignRoles = roleHierarchy[userProfile.role as keyof typeof roleHierarchy] || [];
    if (!canAssignRoles.includes(targetUser.role)) return false;

    // Check location scope
    return canAccessLocation(userProfile, targetUser.accessScope);
  };

  // Check if user can assign specific role
  const canAssignRole = (role: string): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    const roleHierarchy = {
      division_admin: ['district_admin', 'upazila_admin', 'union_admin', 'village_admin'],
      district_admin: ['upazila_admin', 'union_admin', 'village_admin'],
      upazila_admin: ['union_admin', 'village_admin'],
      union_admin: ['village_admin']
    };

    const canAssignRoles = roleHierarchy[userProfile.role as keyof typeof roleHierarchy] || [];
    return canAssignRoles.includes(role);
  };

  // Validate if user can access specific location
  const validateLocationAccess = (location: DataAccessScope): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    return canAccessLocation(userProfile, location);
  };

  // Get default location for adding voters (auto-fill for village admin)
  const getDefaultVoterLocation = (): DataAccessScope => {
    if (!userProfile?.accessScope) return {};
    
    // For village admin, automatically use their location
    if (userProfile.role === 'village_admin') {
      return {
        division_id: userProfile.accessScope.division_id,
        district_id: userProfile.accessScope.district_id,
        upazila_id: userProfile.accessScope.upazila_id,
        union_id: userProfile.accessScope.union_id,
        village_id: userProfile.accessScope.village_id
      };
    }

    // For union admin, auto-fill up to union level
    if (userProfile.role === 'union_admin') {
      return {
        division_id: userProfile.accessScope.division_id,
        district_id: userProfile.accessScope.district_id,
        upazila_id: userProfile.accessScope.upazila_id,
        union_id: userProfile.accessScope.union_id
      };
    }

    // For other roles, return partial auto-fill based on their scope
    const scope: DataAccessScope = {};
    if (userProfile.accessScope.division_id) scope.division_id = userProfile.accessScope.division_id;
    if (userProfile.accessScope.district_id) scope.district_id = userProfile.accessScope.district_id;
    if (userProfile.accessScope.upazila_id) scope.upazila_id = userProfile.accessScope.upazila_id;
    
    return scope;
  };

  return {
    accessScope,
    canAccessAllData,
    getAccessibleVoters,
    createVoterQuery,
    canAddVoterInLocation,
    getAccessibleUsers,
    canManageUser,
    canAssignRole,
    validateLocationAccess,
    getDefaultVoterLocation
  };
};
