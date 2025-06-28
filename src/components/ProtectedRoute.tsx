
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import VerificationLoading from '../authentication/VerificationLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'division_admin' | 'district_admin' | 'upazila_admin' | 'village_admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser, userProfile, loading } = useAuth();

  // ✅ 1. While loading from Firebase/Auth
  if (loading) {
    return <VerificationLoading />; // 👈 Use your custom loading screen
  }

  // ✅ 2. Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 3. Logged in but not approved
  if (!userProfile?.approved) {
    return <Navigate to="/pending-verification" replace />;
  }

  // ✅ 4. Role doesn't match
  if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ 5. All good
  return <>{children}</>;
};

export default ProtectedRoute;
