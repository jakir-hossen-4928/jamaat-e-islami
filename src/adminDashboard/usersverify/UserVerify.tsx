
import AdminLayout from '@/components/layout/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import { usePageTitle } from '@/lib/usePageTitle';

const UserVerify = () => {
  usePageTitle('ব্যবহারকারী যাচাই - অ্যাডমিন প্যানেল');
  
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
};

export default UserVerify;
