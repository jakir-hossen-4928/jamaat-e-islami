
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LocationBasedAccessWrapper } from './LocationBasedAccessWrapper';
import SuperAdminDashboard from '@/dashboards/SuperAdminDashboard';
import VillageAdminDashboard from '@/dashboards/VillageAdminDashboard';

const DashboardRouter: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">ব্যবহারকারীর তথ্য লোড হচ্ছে...</div>
      </div>
    );
  }

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

  // Route based on role - only two roles supported
  const getDashboardComponent = () => {
    switch (userProfile.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'village_admin':
        return <VillageAdminDashboard />;
      default:
        return <VillageAdminDashboard />;
    }
  };

  return (
    <LocationBasedAccessWrapper>
      {getDashboardComponent()}
    </LocationBasedAccessWrapper>
  );
};

export default DashboardRouter;
