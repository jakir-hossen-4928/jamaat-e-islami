
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, BarChart3, MapPin, TrendingUp } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';
import { useAuth } from '@/hooks/useAuth';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

const DivisionAdminDashboard = () => {
  const { userProfile } = useAuth();
  const { data: stats, isLoading, refetch, isRefetching } = useRealTimeStats({
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    enabled: !!userProfile?.accessScope?.division_id
  });

  if (isLoading) {
    return (
      <RoleBasedSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">ডেটা লোড হচ্ছে...</div>
        </div>
      </RoleBasedSidebar>
    );
  }

  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">বিভাগীয় অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="mt-2 text-blue-100">আপনার বিভাগের ভোটার ব্যবস্থাপনা</p>
              {userProfile?.accessScope?.division_name && (
                <p className="mt-1 text-blue-200">বিভাগ: {userProfile.accessScope.division_name}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {isRefetching ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="মোট ভোটার"
            value={stats?.totalVoters || 0}
            subtitle="বিভাগের মোট ভোটার"
            icon={Users}
            color="green"
            link="/admin/all-voters"
          />

          <StatsCard
            title="পুরুষ ভোটার"
            value={stats?.maleVoters || 0}
            subtitle="পুরুষ ভোটার"
            icon={Users}
            color="blue"
            link="/admin/all-voters"
          />

          <StatsCard
            title="মহিলা ভোটার"
            value={stats?.femaleVoters || 0}
            subtitle="মহিলা ভোটার"
            icon={Users}
            color="pink"
            link="/admin/all-voters"
          />

          <StatsCard
            title="উচ্চ অগ্রাধিকার"
            value={stats?.highPriorityVoters || 0}
            subtitle="গুরুত্বপূর্ণ ভোটার"
            icon={BarChart3}
            color="orange"
            link="/admin/all-voters"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>দ্রুত কার্যক্রম</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link to="/admin/add-new-voter">নতুন ভোটার যোগ করুন</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/all-voters">সব ভোটার দেখুন ({stats?.totalVoters || 0})</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>বিভাগীয় ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/user-verification">জেলা অ্যাডমিন নিয়োগ</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/analytics-reports">রিপোর্ট দেখুন</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default DivisionAdminDashboard;
