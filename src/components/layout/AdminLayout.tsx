
import RoleBasedSidebar from './RoleBasedSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return <RoleBasedSidebar>{children}</RoleBasedSidebar>;
};

export default AdminLayout;
