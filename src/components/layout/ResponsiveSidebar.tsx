
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Plus, 
  BarChart3, 
  Database, 
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const superAdminMenuItems = [
    { name: 'ড্যাশবোর্ড', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'সব ভোটার', path: '/admin/all-voters', icon: Users },
    { name: 'ভোটার যোগ করুন', path: '/admin/add-new-voter', icon: Plus },
    { name: 'ব্যবহারকারী যাচাই', path: '/admin/user-verification', icon: UserCheck },
    { name: 'SMS ক্যাম্পেইন', path: '/admin/sms-campaign', icon: MessageSquare },
    { name: 'অ্যানালিটিক্স', path: '/admin/analytics-reports', icon: BarChart3 },
    { name: 'ডেটা হাব', path: '/admin/data-management', icon: Database },
    { name: 'সিস্টেম সেটিংস', path: '/admin/system-settings', icon: Settings },
  ];

  const villageAdminMenuItems = [
    { name: 'ড্যাশবোর্ড', path: '/dashboard', icon: LayoutDashboard },
    { name: 'ভোটার দেখুন', path: '/admin/voters', icon: Users },
    { name: 'ভোটার যোগ করুন', path: '/admin/add-voter', icon: Plus },
    { name: 'SMS ক্যাম্পেইন', path: '/admin/sms-campaign', icon: MessageSquare },
    { name: 'রিপোর্ট', path: '/admin/analytics-reports', icon: BarChart3 },
  ];

  const menuItems = userProfile?.role === 'super_admin' ? superAdminMenuItems : villageAdminMenuItems;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" src="/bangladesh-jamaat-e-islami-seeklogo.svg" alt="Logo" />
            <span className="ml-2 text-lg font-semibold text-gray-900">জামায়াত</span>
          </div>
          
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive(item.path) ? 'text-green-500' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userProfile?.displayName || userProfile?.email}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {userProfile?.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'গ্রাম অ্যাডমিন'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    className="mt-2 text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    লগআউট
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar - simplified */}
      <div className="lg:hidden">
        <Card className="m-2 p-2">
          <div className="flex items-center justify-between">
            <img className="h-6 w-auto" src="/bangladesh-jamaat-e-islami-seeklogo.svg" alt="Logo" />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveSidebar;
