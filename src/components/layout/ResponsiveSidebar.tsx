
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

  // Define menu items based on role with user-friendly routes
  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'ড্যাশবোর্ড', path: '/dashboard' }
    ];

    if (permissions.canRead) {
      baseItems.push({ icon: Users, label: 'সকল ভোটার', path: '/admin/all-voters' });
    }

    if (permissions.canCreate) {
      baseItems.push({ icon: Plus, label: 'নতুন ভোটার যোগ করুন', path: '/admin/add-new-voter' });
    }

    baseItems.push(
      { icon: FileText, label: 'গুগল ফর্ম', path: '/admin/google-forms' },
      { icon: BarChart3, label: 'বিশ্লেষণ রিপোর্ট', path: '/admin/analytics-reports' }
    );

    if (userProfile.role === 'super_admin' || userProfile.role === 'division_admin') {
      baseItems.push(
        { icon: MessageSquare, label: 'SMS ক্যাম্পেইন', path: '/admin/sms-campaigns' }
      );
    }

    if (userProfile.role === 'super_admin') {
      baseItems.push(
        { icon: Database, label: 'ডেটা ব্যবস্থাপনা', path: '/admin/data-management' },
        { icon: MapPin, label: 'এলাকা ব্যবস্থাপনা', path: '/admin/location-management' },
        { icon: Settings, label: 'সিস্টেম কনফিগারেশন', path: '/admin/system-configuration' }
      );
    }

    if (permissions.canAssignRoles.length > 0) {
      baseItems.push({ icon: UserCheck, label: 'ব্যবহারকারী যাচাইকরণ', path: '/admin/user-verification' });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="bg-gray-500 text-white border-r border-gray-400 shadow-xl">
      <SidebarHeader className="bg-gray-600 p-4 border-b border-gray-400">
        <div className="flex items-center space-x-3">
          <img
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
            alt="Logo"
            className="w-8 h-8 rounded-full bg-white p-1"
          />
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="text-white font-bold text-lg">জামায়াতে ইসলামী</span>
            <p className="text-gray-200 text-xs">ভোটার ব্যবস্থাপনা</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-semibold text-sm mb-2 px-2">
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
                        text-white bg-transparent transition-all duration-200 rounded-lg
                        data-[active=true]:bg-gray-700 data-[active=true]:text-white
                        data-[active=true]:border-l-4 data-[active=true]:border-white data-[active=true]:shadow-lg
                        font-medium
                      `}
                    >
                      <Link to={item.path} className="flex items-center space-x-3 px-3 py-2 w-full text-white">
                        <Icon className="w-5 h-5 flex-shrink-0 text-white" />
                        <span className="truncate text-white">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-400">
        <div className="bg-gray-600 rounded-lg p-4 mb-4 shadow-inner border border-gray-400">
          <div className="space-y-1">
            <p className="text-white text-sm font-semibold truncate" title={userProfile?.displayName}>
              {userProfile?.displayName}
            </p>
            <p className="text-gray-200 text-xs truncate" title={userProfile?.email}>
              {userProfile?.email}
            </p>
            <p className="text-gray-200 text-xs font-medium">
              {getRoleDisplayName(userProfile?.role)}
            </p>
            {userProfile.accessScope && userProfile.role !== 'super_admin' && (
              <div className="mt-2 text-gray-200 text-xs space-y-0.5 border-t border-gray-400 pt-2">
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
          className="w-full text-gray-800 border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 transition-colors font-medium"
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
