
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getRolePermissions } from '@/lib/rbac';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Users,
  BarChart3,
  MessageSquare,
  Database,
  Plus,
  LogOut,
  Home,
  UserCheck,
  FileText,
  Settings,
  MapPin
} from 'lucide-react';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
}

const AppSidebar = () => {
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
    <Sidebar className="bg-gradient-to-b from-green-700 to-green-900 text-white border-r border-green-600 shadow-xl">
      <SidebarHeader className="bg-gradient-to-r from-green-800 to-green-700 p-4 border-b border-green-600">
        <div className="flex items-center space-x-3">
          <img
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
            alt="Logo"
            className="w-8 h-8 rounded-full bg-white p-1"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-white font-bold text-lg">জামায়াতে ইসলামী</span>
            <p className="text-green-200 text-xs">ভোটার ব্যবস্থাপনা</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-200 font-semibold text-sm mb-2 px-2">
            প্রধান মেনু
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        text-white hover:bg-green-600 hover:text-white transition-all duration-200 rounded-lg
                        data-[active=true]:bg-gradient-to-r data-[active=true]:from-green-500 data-[active=true]:to-green-600 
                        data-[active=true]:border-l-4 data-[active=true]:border-green-200 data-[active=true]:shadow-lg
                        data-[active=true]:text-white font-medium
                      `}
                    >
                      <Link to={item.path} className="flex items-center space-x-3 px-3 py-2">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-green-600">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 mb-4 shadow-inner border border-green-500">
          <div className="space-y-1">
            <p className="text-white text-sm font-semibold truncate" title={userProfile?.displayName}>
              {userProfile?.displayName}
            </p>
            <p className="text-green-200 text-xs truncate" title={userProfile?.email}>
              {userProfile?.email}
            </p>
            <p className="text-green-300 text-xs font-medium">
              {getRoleDisplayName(userProfile?.role)}
            </p>
            {userProfile.accessScope && userProfile.role !== 'super_admin' && (
              <div className="mt-2 text-green-200 text-xs space-y-0.5 border-t border-green-500 pt-2">
                {userProfile.accessScope.division_name && (
                  <p className="truncate">বিভাগ: {userProfile.accessScope.division_name}</p>
                )}
                {userProfile.accessScope.district_name && (
                  <p className="truncate">জেলা: {userProfile.accessScope.district_name}</p>
                )}
                {userProfile.accessScope.upazila_name && (
                  <p className="truncate">উপজেলা: {userProfile.accessScope.upazila_name}</p>
                )}
                {userProfile.accessScope.union_name && (
                  <p className="truncate">ইউনিয়ন: {userProfile.accessScope.union_name}</p>
                )}
                {userProfile.accessScope.village_name && (
                  <p className="truncate">গ্রাম: {userProfile.accessScope.village_name}</p>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-green-800 border-green-200 bg-white hover:bg-green-50 hover:border-green-300 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          লগআউট
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export const ResponsiveSidebar = ({ children }: ResponsiveSidebarProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar with trigger */}
          <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" />
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                ভোটার ব্যবস্থাপনা সিস্টেম
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                জামায়াতে ইসলামী বাংলাদেশ
              </p>
            </div>
          </div>
          
          {/* Main content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ResponsiveSidebar;
