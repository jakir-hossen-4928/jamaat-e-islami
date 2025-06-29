
import ResponsiveSidebar from './ResponsiveSidebar';

interface RoleBasedSidebarProps {
  children: React.ReactNode;
}

const RoleBasedSidebar = ({ children }: RoleBasedSidebarProps) => {
  return <ResponsiveSidebar>{children}</ResponsiveSidebar>;
};

export default RoleBasedSidebar;
