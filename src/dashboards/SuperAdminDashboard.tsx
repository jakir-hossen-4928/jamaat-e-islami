import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, MapPin, BarChart3, Shield, Settings, UserCheck, Database } from 'lucide-react';
import { VoterData, User } from '@/lib/types';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const usersRef = collection(db, 'users');
      const pendingUsersQuery = query(usersRef, where('approved', '==', false));
      
      const [votersSnapshot, usersSnapshot, pendingUsersSnapshot] = await Promise.all([
        getDocs(votersRef),
        getDocs(usersRef),
        getDocs(pendingUsersQuery)
      ]);
      
      const voters = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as User));
      const pendingUsers = pendingUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as User));
      
      return {
        totalVoters: voters.length,
        totalUsers: users.length,
        totalDivisions: 8,
        totalDistricts: 64,
        totalUpazilas: 495,
        totalUnions: 4500,
        activeAdmins: users.filter(u => u.role !== 'union_admin' && u.approved).length,
        pendingApprovals: pendingUsers.length,
        highPriorityVoters: voters.filter(v => v['Priority Level'] === 'High').length,
        roleDistribution: {
          super_admin: users.filter(u => u.role === 'super_admin').length,
          division_admin: users.filter(u => u.role === 'division_admin').length,
          district_admin: users.filter(u => u.role === 'district_admin').length,
          upazila_admin: users.filter(u => u.role === 'upazila_admin').length,
          union_admin: users.filter(u => u.role === 'union_admin').length
        }
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">ডেটা লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="mt-2 text-green-100">জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা - সম্পূর্ণ নিয়ন্ত্রণ</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalVoters || 0}</div>
              <p className="text-xs text-blue-600">সারাদেশের মোট ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">প্রশাসনিক এলাকা</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.totalDivisions || 0}</div>
              <p className="text-xs text-green-600">বিভাগ • {stats?.totalDistricts || 0} জেলা</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অ্যাডমিন ইউজার</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.activeAdmins || 0}</div>
              <p className="text-xs text-purple-600">সক্রিয় অ্যাডমিনিস্ট্রেটর</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অনুমোদনের অপেক্ষায়</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-orange-600">নতুন ইউজার অনুমোদন</p>
            </CardContent>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>ভূমিকা ভিত্তিক বিতরণ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats?.roleDistribution?.super_admin || 0}</div>
                <div className="text-xs text-gray-600">সুপার অ্যাডমিন</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats?.roleDistribution?.division_admin || 0}</div>
                <div className="text-xs text-gray-600">বিভাগীয় অ্যাডমিন</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats?.roleDistribution?.district_admin || 0}</div>
                <div className="text-xs text-gray-600">জেলা অ্যাডমিন</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{stats?.roleDistribution?.upazila_admin || 0}</div>
                <div className="text-xs text-gray-600">উপজেলা অ্যাডমিন</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-600">{stats?.roleDistribution?.union_admin || 0}</div>
                <div className="text-xs text-gray-600">ইউনিয়ন অ্যাডমিন</div>
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
                <a href="/admin/verify-users">
                  ইউজার অনুমোদন ({stats?.pendingApprovals || 0})
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                রোল অ্যাসাইনমেন্ট
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>এলাকা ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                বিভাগীয় পরিসংখ্যান
              </Button>
              <Button className="w-full" variant="outline">
                জেলা ভিত্তিক ডেটা
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
                <a href="/admin/analytics">সিস্টেম অ্যানালিটিক্স</a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/data-hub">ডেটা হাব</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default SuperAdminDashboard;
