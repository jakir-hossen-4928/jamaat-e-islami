
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VoterData, User } from '@/lib/types';
import { canAccessLocation, validateVoterLocationAccess } from '@/lib/rbac';

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
  
  // Performance optimized methods
  getOptimizedQueryConstraints: () => any;
  shouldApplyLocationFilter: () => boolean;
}

export const useRoleBasedDataAccess = (): UseRoleBasedDataAccessReturn => {
  const { userProfile } = useAuth();

  // Get user's access scope with memoization
  const accessScope = useMemo(() => {
    if (!userProfile?.accessScope) return {};
    return userProfile.accessScope;
  }, [userProfile?.accessScope]);

  // Check if user can access all data (super admin only)
  const canAccessAllData = useMemo(() => {
    return userProfile?.role === 'super_admin';
  }, [userProfile?.role]);

  // Optimized voter filtering
  const getAccessibleVoters = useMemo(() => {
    return (voters: VoterData[]): VoterData[] => {
      if (!userProfile || !Array.isArray(voters)) return [];
      
      if (canAccessAllData) return voters;

      // For village admin, filter by village_id only
      if (userProfile.role === 'village_admin') {
        return voters.filter(voter => voter.village_id === userProfile.accessScope.village_id);
      }

      return [];
    };
  }, [userProfile, canAccessAllData]);

  // Optimized Firestore query creation
  const createVoterQuery = (additionalFilters: any = {}) => {
    if (!userProfile) return null;

    const votersRef = collection(db, 'voters');
    let constraints = [];

    // Apply role-based location filters for optimization
    if (userProfile.role === 'village_admin' && userProfile.accessScope?.village_id) {
      constraints.push(where('village_id', '==', userProfile.accessScope.village_id));
    }

    // Add additional filters
    Object.entries(additionalFilters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, '==', value));
      }
    });

    // Add optimized ordering
    constraints.push(orderBy('Last Updated', 'desc'));
    
    // Add limit for better performance
    constraints.push(limit(100));

    return query(votersRef, ...constraints);
  };

  // Check if user can add voter in specific location
  const canAddVoterInLocation = (voterLocation: DataAccessScope): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    return canAccessLocation(userProfile, voterLocation);
  };

  // Optimized user filtering
  const getAccessibleUsers = (users: User[]): User[] => {
    if (!userProfile || !Array.isArray(users)) return [];
    
    if (canAccessAllData) return users;

    // Village admin can only see users in their village
    if (userProfile.role === 'village_admin') {
      return users.filter(user => 
        user.accessScope?.village_id === userProfile.accessScope.village_id
      );
    }

    return [];
  };

  // Check if user can manage another user
  const canManageUser = (targetUser: User): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return true;

    // Only super admin can manage users in this simplified structure
    return false;
  };

  // Check if user can assign specific role
  const canAssignRole = (role: string): boolean => {
    if (!userProfile) return false;
    if (canAccessAllData) return role === 'village_admin';

    return false;
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
    
    // For village admin, automatically use their complete location
    if (userProfile.role === 'village_admin') {
      return {
        division_id: userProfile.accessScope.division_id,
        district_id: userProfile.accessScope.district_id,
        upazila_id: userProfile.accessScope.upazila_id,
        union_id: userProfile.accessScope.union_id,
        village_id: userProfile.accessScope.village_id
      };
    }

    return {};
  };

  // Performance optimization methods
  const getOptimizedQueryConstraints = () => {
    if (userProfile?.role === 'village_admin' && userProfile.accessScope?.village_id) {
      return {
        field: 'village_id',
        operator: '==',
        value: userProfile.accessScope.village_id
      };
    }
    return null;
  };

  const shouldApplyLocationFilter = () => {
    return userProfile?.role === 'village_admin';
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
    getDefaultVoterLocation,
    getOptimizedQueryConstraints,
    shouldApplyLocationFilter
  };
};
