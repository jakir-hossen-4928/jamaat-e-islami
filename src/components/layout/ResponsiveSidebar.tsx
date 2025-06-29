import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getRolePermissions } from '@/lib/rbac';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar
} from '@/components/ui/sidebar';
import {
  Users, BarChart3, MessageSquare, Database, Plus,
  LogOut, Home, UserCheck, FileText, Settings, MapPin
} from 'lucide-react';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
}

const AppSidebar = () => {
  const { logout, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();

  if (!userProfile) return null;

  const permissions = getRolePermissions(userProfile.role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'super_admin': 'সুপার অ্যাডমিন',
      'division_admin': 'বিভাগীয় অ্যাডমিন',
      'district_admin': 'জেলা অ্যাডমিন',
      'upazila_admin': 'উপজেলা অ্যাডমিন',
      'union_admin': 'ইউনিয়ন অ্যাডমিন',
      'village_admin': 'গ্রাম অ্যাডমিন',
    };
    return roleMap[role] || 'ব্যবহারকারী';
  };

  const getMenuItems = () => {
    const baseItems = [{
      icon: Home,
      label: 'ড্যাশবোর্ড',
      path: '/dashboard',
      ariaLabel: 'ড্যাশবোর্ড পৃষ্ঠায় যান'
    }];

    if (permissions.canRead) {
      baseItems.push({
        icon: Users,
        label: 'সকল ভোটার',
        path: '/admin/all-voters',
        ariaLabel: 'সমস্ত ভোটার তালিকা দেখুন'
      });
    }

    if (permissions.canCreate) {
      baseItems.push({
        icon: Plus,
        label: 'নতুন ভোটার যোগ করুন',
        path: '/admin/add-new-voter',
        ariaLabel: 'নতুন ভোটার যোগ করুন'
      });
    }

    baseItems.push(
      {
        icon: FileText,
        label: 'গুগল ফর্ম',
        path: '/admin/google-forms',
        ariaLabel: 'গুগল ফর্ম ম্যানেজমেন্ট'
      },
      {
        icon: BarChart3,
        label: 'বিশ্লেষণ রিপোর্ট',
        path: '/admin/analytics-reports',
        ariaLabel: 'বিশ্লেষণ রিপোর্ট দেখুন'
      }
    );

    if (userProfile.role === 'super_admin' || userProfile.role === 'division_admin') {
      baseItems.push({
        icon: MessageSquare,
        label: 'SMS ক্যাম্পেইন',
        path: '/admin/sms-campaigns',
        ariaLabel: 'SMS প্রচারণা ব্যবস্থাপনা'
      });
    }

    if (userProfile.role === 'super_admin') {
      baseItems.push(
        {
          icon: Database,
          label: 'ডেটা ব্যবস্থাপনা',
          path: '/admin/data-management',
          ariaLabel: 'ডেটা ব্যবস্থাপনা'
        },
        {
          icon: MapPin,
          label: 'এলাকা ব্যবস্থাপনা',
          path: '/admin/location-management',
          ariaLabel: 'এলাকা ব্যবস্থাপনা'
        },
        {
          icon: Settings,
          label: 'সিস্টেম কনফিগারেশন',
          path: '/admin/system-configuration',
          ariaLabel: 'সিস্টেম কনফিগারেশন'
        }
      );
    }

    if (permissions.canAssignRoles.length > 0) {
      baseItems.push({
        icon: UserCheck,
        label: 'ব্যবহারকারী যাচাইকরণ',
        path: '/admin/user-verification',
        ariaLabel: 'ব্যবহারকারী যাচাইকরণ'
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar className="bg-teal-800 text-white">
      <SidebarHeader className="bg-teal-900 p-4">
        <div className="flex items-center gap-3">
          <img
            src="/bangladesh-jamaat-e-islami-seeklogo.svg"
            alt="জামায়াতে ইসলামী লোগো"
            className="w-10 h-10 bg- p-1 rounded-lg"
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">জামায়াতে ইসলামী</h1>
              <p className="text-teal-100 text-xs mt-1">ভোটার ব্যবস্থাপনা সিস্টেম</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-teal-200 font-medium text-xs uppercase tracking-wider px-4 mb-1">
              প্রধান মেনু
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        text-black hover:bg-teal-700 transition-all duration-200 rounded-lg
                        data-[active=true]:bg-teal-600 data-[active=true]:text-black
                        font-medium group
                      `}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-3 w-full"
                        aria-label={item.ariaLabel}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon
                          className="w-5 h-5 flex-shrink-0 text-teal-100 group-data-[active=true]:text-white"
                          aria-hidden="true"
                        />
                        {!isCollapsed && (
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-teal-900">
        <div className={`${isCollapsed ? 'p-2' : 'p-3'} bg-teal-800 rounded-lg mb-3`}>
          <div className={isCollapsed ? 'flex justify-center' : 'space-y-2'}>
            {!isCollapsed && (
              <>
                <p
                  className="text-white font-medium truncate text-sm"
                  title={userProfile?.displayName}
                >
                  {userProfile?.displayName}
                </p>
                <p
                  className="text-teal-200 text-xs truncate"
                  title={userProfile?.email}
                >
                  {userProfile?.email}
                </p>
                <p className="text-teal-100 text-xs font-semibold">
                  {getRoleDisplayName(userProfile?.role)}
                </p>
              </>
            )}

            {!isCollapsed && userProfile.accessScope && userProfile.role !== 'super_admin' && (
              <div className="mt-2 text-teal-200 text-xs space-y-1 border-t border-teal-700 pt-2">
                {userProfile.accessScope.division_name && <p>বিভাগ: {userProfile.accessScope.division_name}</p>}
                {userProfile.accessScope.district_name && <p>জেলা: {userProfile.accessScope.district_name}</p>}
                {userProfile.accessScope.upazila_name && <p>উপজেলা: {userProfile.accessScope.upazila_name}</p>}
                {userProfile.accessScope.union_name && <p>ইউনিয়ন: {userProfile.accessScope.union_name}</p>}
                {userProfile.accessScope.village_name && <p>গ্রাম: {userProfile.accessScope.village_name}</p>}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-white bg-teal-700 hover:bg-teal-600 transition-colors font-medium justify-start"
          aria-label="লগআউট করুন"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isCollapsed && "লগআউট"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export const ResponsiveSidebar = ({ children }: ResponsiveSidebarProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="bg-white h-16 flex items-center px-4 sticky top-0 z-40">
            <SidebarTrigger
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="মেনু টগল করুন"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-800 truncate">
                ভোটার ব্যবস্থাপনা সিস্টেম
              </h1>
              <p className="text-xs text-gray-600 truncate hidden sm:block">
                জামায়াতে ইসলামী বাংলাদেশ
              </p>
            </div>
          </header>

          {/* Main Content Area */}
          <main
            className="flex-1 p-4 lg:p-6 overflow-auto bg-gray-50"
            id="main-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ResponsiveSidebar;