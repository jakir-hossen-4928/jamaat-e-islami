
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminDashboard from '@/dashboards/SuperAdminDashboard';
import DivisionAdminDashboard from '@/dashboards/DivisionAdminDashboard';
import DistrictAdminDashboard from '@/dashboards/DistrictAdminDashboard';
import WardAdminDashboard from '@/dashboards/WardAdminDashboard';
import ModeratorDashboard from '@/dashboards/ModeratorDashboard';
import UserDashboard from '@/dashboards/UserDashboard';

const DashboardRouter: React.FC = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">ব্যবহারকারীর তথ্য লোড হচ্ছে...</div>
      </div>
    );
  }

  switch (userProfile.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'division_admin':
      return <DivisionAdminDashboard />;
    case 'district_admin':
      return <DistrictAdminDashboard />;
    case 'ward_admin':
      return <WardAdminDashboard />;
    case 'moderator':
      return <ModeratorDashboard />;
    case 'user':
      return <UserDashboard />;
    case 'admin': // Legacy admin role
      return <SuperAdminDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;
