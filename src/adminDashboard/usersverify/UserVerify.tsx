import AdminLayout from '@/components/layout/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { getRolePermissions } from '@/lib/rbac';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const UserVerify = () => {
  usePageTitle('ব্যবহারকারী যাচাই - অ্যাডমিন প্যানেল');

  const { userProfile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">ব্যবহারকারী যাচাই ও ভূমিকা বরাদ্দ</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          রিফ্রেশ
        </Button>
      </div>
      <UserManagement refreshKey={refreshKey} />
    </AdminLayout>
  );
};

export default UserVerify;
