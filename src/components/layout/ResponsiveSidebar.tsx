
import React, { useState } from 'react';
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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: 'সব ভোটার', path: '/admin/voters', icon: Users },
    { name: 'ভোটার যোগ করুন', path: '/admin/add-voter', icon: Plus },
    { name: 'SMS ক্যাম্পেইন', path: '/admin/sms-campaign', icon: MessageSquare },
    { name: 'রিপোর্ট', path: '/admin/analytics-reports', icon: BarChart3 },
  ];

  const menuItems = userProfile?.role === 'super_admin' ? superAdminMenuItems : villageAdminMenuItems;

  const SidebarContent = () => (
    <>
      <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
        <img className="h-8 w-auto" src="/bangladesh-jamaat-e-islami-seeklogo.svg" alt="Logo" />
        <span className="ml-2 text-lg font-semibold text-gray-900">জামায়াত</span>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {userProfile?.displayName || userProfile?.email}
              </p>
              <p className="text-xs text-gray-500">
                {userProfile?.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'গ্রাম অ্যাডমিন'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">লগআউট</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img className="h-6 w-auto" src="/bangladesh-jamaat-e-islami-seeklogo.svg" alt="Logo" />
          <span className="text-lg font-semibold text-gray-900">জামায়াত</span>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">মেনু খুলুন</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <VisuallyHidden>
              <SheetTitle>নেভিগেশন মেনু</SheetTitle>
              <SheetDescription>অ্যাপ্লিকেশনের মূল মেনু</SheetDescription>
            </VisuallyHidden>
            <div className="flex flex-col h-full bg-white">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
          <SidebarContent />
        </div>

        {/* Main content */}
        <div className="flex-1 lg:pl-64">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveSidebar;
