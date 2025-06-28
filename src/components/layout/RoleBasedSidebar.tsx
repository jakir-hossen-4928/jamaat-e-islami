
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getRolePermissions } from '@/lib/rbac';
import {
  Users,
  BarChart3,
  MessageSquare,
  Database,
  Plus,
  Menu,
  X,
  LogOut,
  Home,
  UserCheck,
  FileText,
  Upload,
  Settings,
  MapPin,
  Shield
} from 'lucide-react';

interface RoleBasedSidebarProps {
  children: React.ReactNode;
}

const RoleBasedSidebar = ({ children }: RoleBasedSidebarProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!userProfile) return null;

  const permissions = getRolePermissions(userProfile.role);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'সুপার অ্যাডমিন';
      case 'division_admin': return 'বিভাগীয় অ্যাডমিন';
      case 'district_admin': return 'জেলা অ্যাডমিন';
      case 'upazila_admin': return 'উপজেলা অ্যাডমিন';
      case 'union_admin': return 'ইউনিয়ন অ্যাডমিন';
      case 'village_admin': return 'গ্রাম অ্যাডমিন';
      default: return 'ব্যবহারকারী';
    }
  };

  // Define menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'ড্যাশবোর্ড', path: '/dashboard' }
    ];

    if (permissions.canRead) {
      baseItems.push({ icon: Users, label: 'সকল ভোটার', path: '/admin/voters' });
    }

    if (permissions.canCreate) {
      baseItems.push({ icon: Plus, label: 'ভোটার যোগ করুন', path: '/admin/add-voter' });
    }

    baseItems.push(
      { icon: FileText, label: 'গুগল ফর্ম', path: '/admin/google-form' },
      { icon: BarChart3, label: 'বিশ্লেষণ', path: '/admin/analytics' }
    );

    if (userProfile.role === 'super_admin' || userProfile.role === 'division_admin') {
      baseItems.push(
        { icon: MessageSquare, label: 'SMS ক্যাম্পেইন', path: '/admin/sms-campaign' }
      );
    }

    if (userProfile.role === 'super_admin') {
      baseItems.push(
        { icon: Database, label: 'ডেটা হাব', path: '/admin/data-hub' },
        { icon: MapPin, label: 'এলাকা ব্যবস্থাপনা', path: '/admin/location-management' },
        { icon: Settings, label: 'সিস্টেম সেটিংস', path: '/admin/system-settings' }
      );
    }

    if (permissions.canAssignRoles.length > 0) {
      baseItems.push({ icon: UserCheck, label: 'ব্যবহারকারী ব্যবস্থাপনা', path: '/admin/verify-users' });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-green-900">
          <div className="flex items-center space-x-3">
            <img
              src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
              alt="Logo"
              className="w-8 h-8"
            />
            <span className="text-white font-bold text-sm lg:text-lg">জামায়াতে ইসলামী</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-white hover:bg-green-700 transition-colors duration-200 ${
                  isActive ? 'bg-green-700 border-r-4 border-green-400' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-green-700 rounded-lg p-4 mb-4">
            <p className="text-white text-sm font-medium">{userProfile?.displayName}</p>
            <p className="text-green-200 text-xs">{userProfile?.email}</p>
            <p className="text-green-200 text-xs">
              {getRoleDisplayName(userProfile?.role)}
            </p>
            {userProfile.accessScope && (
              <div className="mt-2 text-green-200 text-xs">
                {userProfile.role !== 'super_admin' && (
                  <div>
                    {userProfile.accessScope.division_name && <p>বিভাগ: {userProfile.accessScope.division_name}</p>}
                    {userProfile.accessScope.district_name && <p>জেলা: {userProfile.accessScope.district_name}</p>}
                    {userProfile.accessScope.upazila_name && <p>উপজেলা: {userProfile.accessScope.upazila_name}</p>}
                    {userProfile.accessScope.union_name && <p>ইউনিয়ন: {userProfile.accessScope.union_name}</p>}
                    {userProfile.accessScope.village_name && <p>গ্রাম: {userProfile.accessScope.village_name}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-black border-white hover:bg-white hover:text-green-800 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
              ভোটার ব্যবস্থাপনা সিস্টেম
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block">
                স্বাগতম, {userProfile?.displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RoleBasedSidebar;
