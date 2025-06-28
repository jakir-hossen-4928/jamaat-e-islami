
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

  // Check if user is approved
  if (!userProfile.approved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">অনুমোদনের অপেক্ষায়</h2>
          <p className="text-gray-600">আপনার অ্যাকাউন্ট এখনও অনুমোদিত হয়নি। অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।</p>
        </div>
      </div>
    );
  }

  // Route based on role
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
    case 'admin': // Legacy admin role - treat as super admin
      return <SuperAdminDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;
