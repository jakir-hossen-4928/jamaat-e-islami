
import AdminLayout from '@/components/layout/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { getRolePermissions } from '@/lib/rbac';

const UserVerify = () => {
  usePageTitle('ব্যবহারকারী যাচাই - অ্যাডমিন প্যানেল');
  
  const { userProfile } = useAuth();

  // Check if user has permission to verify users
  if (!userProfile) {
    return <Navigate to="/unauthorized" replace />;
  }

  const permissions = getRolePermissions(userProfile.role);
  
  // Only users with canVerifyUsers permission can access this page
  if (!permissions.canVerifyUsers) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
};

export default UserVerify;
