
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, MapPin, BarChart3, Shield, Settings } from 'lucide-react';
import { VoterData } from '@/lib/types';

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const usersRef = collection(db, 'users');
      
      const [votersSnapshot, usersSnapshot] = await Promise.all([
        getDocs(votersRef),
        getDocs(usersRef)
      ]);
      
      const voters = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return {
        totalVoters: voters.length,
        totalUsers: users.length,
        totalDivisions: 8,
        totalDistricts: 64,
        totalUpazilas: 495,
        totalUnions: 4500,
        activeAdmins: users.filter(u => u.role !== 'user').length,
        pendingApprovals: users.filter(u => !u.approved).length,
        highPriorityVoters: voters.filter(v => v['Priority Level'] === 'High').length
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা - সম্পূর্ণ নিয়ন্ত্রণ</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              সিস্টেম সেটিংস
            </Button>
          </div>
        </div>

        {/* National Overview */}
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

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>ব্যবহারকারী ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <a href="/admin/verify-users" className="flex items-center">
                  ইউজার অনুমোদন ({stats?.pendingApprovals || 0})
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                রোল অ্যাসাইনমেন্ট
              </Button>
              <Button className="w-full" variant="outline">
                অ্যাডমিন পরিচালনা
              </Button>
            </CardContent>
          </Card>

          {/* Location Management */}
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
              <Button className="w-full" variant="outline">
                এলাকা ভিত্তিক রিপোর্ট
              </Button>
            </CardContent>
          </Card>

          {/* System Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>সিস্টেম ব্যবস্থাপনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <a href="/admin/analytics" className="flex items-center">
                  সিস্টেম অ্যানালিটিক্স
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/sms-campaign" className="flex items-center">
                  SMS ক্যাম্পেইন
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/data-hub" className="flex items-center">
                  ডেটা হাব
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>দ্রুত কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/add-voter" className="flex items-center">
                  নতুন ভোটার যোগ করুন
                </a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/voters" className="flex items-center">
                  সব ভোটার দেখুন
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>পার্টি পরিসংখ্যান</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>উচ্চ অগ্রাধিকার:</span>
                  <span className="font-semibold">{stats?.highPriorityVoters || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>মোট ইউনিয়ন:</span>
                  <span className="font-semibold">{stats?.totalUnions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>উপজেলা:</span>
                  <span className="font-semibold">{stats?.totalUpazilas || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
