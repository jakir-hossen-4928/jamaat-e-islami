
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, MapPin, BarChart3, Shield, Settings, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import { useLocationAccess } from '@/components/LocationBasedAccessWrapper';

const SuperAdminDashboard = () => {
  const { userProfile } = useLocationAccess();
  const { data: stats, isLoading, refetch, isRefetching } = useRealTimeStats({
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
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
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="mt-2 text-green-100">জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা - সম্পূর্ণ নিয়ন্ত্রণ</p>
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

        {/* Stats Overview with Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="মোট ভোটার"
            value={stats?.totalVoters || 0}
            subtitle="সারাদেশের মোট ভোটার"
            icon={Users}
            color="blue"
            link="/admin/all-voters"
          />

          <StatsCard
            title="প্রশাসনিক এলাকা"
            value={stats?.locationStats?.totalDivisions || 0}
            subtitle={`বিভাগ • ${stats?.locationStats?.totalDistricts || 0} জেলা`}
            icon={Building}
            color="green"
            link="/admin/user-verification"
          />

          <StatsCard
            title="অ্যাডমিন ইউজার"
            value={stats?.activeAdmins || 0}
            subtitle="সক্রিয় অ্যাডমিনিস্ট্রেটর"
            icon={Shield}
            color="purple"
            link="/admin/user-verification"
          />

          <StatsCard
            title="অনুমোদনের অপেক্ষায়"
            value={stats?.pendingApprovals || 0}
            subtitle="নতুন ইউজার অনুমোদন"
            icon={AlertCircle}
            color="orange"
            link="/admin/user-verification"
          />
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="উচ্চ অগ্রাধিকার ভোটার"
            value={stats?.highPriorityVoters || 0}
            subtitle="অতি গুরুত্বপূর্ণ ভোটার"
            icon={BarChart3}
            color="red"
            link="/admin/all-voters"
          />

          <StatsCard
            title="পুরুষ ভোটার"
            value={stats?.maleVoters || 0}
            subtitle="মোট পুরুষ ভোটার"
            icon={Users}
            color="indigo"
            link="/admin/all-voters"
          />

          <StatsCard
            title="মহিলা ভোটার"
            value={stats?.femaleVoters || 0}
            subtitle="মোট মহিলা ভোটার"
            icon={Users}
            color="pink"
            link="/admin/all-voters"
          />
        </div>

        {/* Role Distribution - Updated for two-role system */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>ভূমিকা ভিত্তিক বিতরণ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats?.roleDistribution?.super_admin || 0}</div>
                <div className="text-sm text-gray-600">সুপার অ্যাডমিন</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.roleDistribution?.village_admin || 0}</div>
                <div className="text-sm text-gray-600">গ্রাম অ্যাডমিন</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>ব্যবহারকারী ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/user-verification">
                  ইউজার অনুমোদন ({stats?.pendingApprovals || 0})
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/user-verification">
                  রোল অ্যাসাইনমেন্ট
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>ভোটার ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/all-voters">
                  সব ভোটার দেখুন ({stats?.totalVoters || 0})
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/add-new-voter">
                  নতুন ভোটার যোগ করুন
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>সিস্টেম ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/analytics-reports">সিস্টেম অ্যানালিটিক্স</Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/admin/data-management">ডেটা হাব</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default SuperAdminDashboard;
