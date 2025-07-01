import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

// Context to provide location/role info
const LocationAccessContext = createContext(null);

export const useLocationAccess = () => {
  const context = useContext(LocationAccessContext);
  if (!context) throw new Error('useLocationAccess must be used within LocationBasedAccessWrapper');
  return context;
};

interface LocationBasedAccessWrapperProps {
  requiredFeature?: string;
  children: React.ReactNode;
}

/**
 * Props:
 * - requiredFeature: string (optional) - feature key to check for access
 * - children: ReactNode
 */
export const LocationBasedAccessWrapper = ({ requiredFeature, children }: LocationBasedAccessWrapperProps) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">লোড হচ্ছে...</div>;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Example: check for approval
  if (!userProfile.approved) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Provide location/role info for filtering
  const accessScope = userProfile.accessScope || {};
  const role = userProfile.role;

  return (
    <LocationAccessContext.Provider value={{ userProfile, role, accessScope }}>
      {children}
    </LocationAccessContext.Provider>
  );
}; 