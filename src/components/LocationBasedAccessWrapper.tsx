import React, { createContext, useContext, ReactNode } from 'react';
import { useLocationBasedAccess } from '@/hooks/useLocationBasedAccess';
import { Navigate } from 'react-router-dom';

interface LocationAccessContextType {
  hasAccessToLocation: (targetLocation: any) => boolean;
  hasAccessToVoter: (voter: any) => boolean;
  filterVotersByAccess: (voters: any[]) => any[];
  getUserLocationScope: () => string;
  canAccessFeature: (feature: string) => boolean;
  userProfile: any;
}

const LocationAccessContext = createContext<LocationAccessContextType | null>(null);

export const useLocationAccess = () => {
  const context = useContext(LocationAccessContext);
  if (!context) {
    throw new Error('useLocationAccess must be used within a LocationBasedAccessWrapper');
  }
  return context;
};

interface LocationBasedAccessWrapperProps {
  children: ReactNode;
  requiredFeature?: string;
}

export const LocationBasedAccessWrapper: React.FC<LocationBasedAccessWrapperProps> = ({ 
  children, 
  requiredFeature 
}) => {
  const locationAccess = useLocationBasedAccess();

  // Check if user is authenticated
  if (!locationAccess.userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is approved
  if (!locationAccess.userProfile.approved) {
    return <Navigate to="/pending-verification" replace />;
  }

  // Check if user has access to the required feature
  if (requiredFeature && !locationAccess.canAccessFeature(requiredFeature)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <LocationAccessContext.Provider value={locationAccess}>
      {children}
    </LocationAccessContext.Provider>
  );
};

// Higher-order component for components that need location-based access
export const withLocationAccess = <P extends object>(
  Component: React.ComponentType<P>,
  requiredFeature?: string
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <LocationBasedAccessWrapper requiredFeature={requiredFeature}>
      <Component {...props} />
    </LocationBasedAccessWrapper>
  );
  
  WrappedComponent.displayName = `withLocationAccess(${Component.displayName || Component.name})`;
  return WrappedComponent;
}; 