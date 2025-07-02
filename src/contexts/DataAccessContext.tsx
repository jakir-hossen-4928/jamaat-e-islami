
import React, { createContext, useContext, ReactNode } from 'react';
import { useRoleBasedDataAccess } from '@/hooks/useRoleBasedDataAccess';
import { useOptimizedVoterAccess } from '@/hooks/useOptimizedVoterAccess';
import { VoterData, User } from '@/lib/types';

interface DataAccessContextType {
  // Access scope and permissions
  accessScope: any;
  canAccessAllData: boolean;
  
  // Voter data access methods
  getAccessibleVoters: (voters: VoterData[]) => VoterData[];
  createVoterQuery: (additionalFilters?: any) => any;
  canAddVoterInLocation: (voterLocation: any) => boolean;
  getDefaultVoterLocation: () => any;
  
  // User management methods
  getAccessibleUsers: (users: User[]) => User[];
  canManageUser: (targetUser: User) => boolean;
  canAssignRole: (role: string) => boolean;
  
  // Location validation
  validateLocationAccess: (location: any) => boolean;
  
  // Performance optimization methods
  getOptimizedQueryConstraints: () => any;
  shouldApplyLocationFilter: () => boolean;
}

const DataAccessContext = createContext<DataAccessContextType | undefined>(undefined);

export const useDataAccess = () => {
  const context = useContext(DataAccessContext);
  if (!context) {
    throw new Error('useDataAccess must be used within DataAccessProvider');
  }
  return context;
};

interface DataAccessProviderProps {
  children: ReactNode;
}

export const DataAccessProvider: React.FC<DataAccessProviderProps> = ({ children }) => {
  const dataAccess = useRoleBasedDataAccess();

  return (
    <DataAccessContext.Provider value={dataAccess}>
      {children}
    </DataAccessContext.Provider>
  );
};

// Re-export the optimized voter access hook for components that need it
export { useOptimizedVoterAccess };
