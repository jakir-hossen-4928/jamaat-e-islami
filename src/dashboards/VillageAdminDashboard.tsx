
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BarChart3 } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

const VillageAdminDashboard = () => {
  const { userProfile } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['union-admin-stats', userProfile?.accessScope?.union_id],
    queryFn: async () => {
      if (!userProfile?.accessScope?.union_id) return null;

      const votersRef = collection(db, 'voters');
      const votersQuery = query(votersRef, where('union_id', '==', userProfile.accessScope.union_id));
      
      const votersSnapshot = await getDocs(votersQuery);
      const voters = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      return {
        totalVoters: voters.length,
        highPriorityVoters: voters.filter(v => v['Priority Level'] === 'High').length,
        maleVoters: voters.filter(v => v.Gender === 'Male').length,
        femaleVoters: voters.filter(v => v.Gender === 'Female').length
      };
    },
    enabled: !!userProfile?.accessScope?.union_id
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
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">ইউনিয়ন অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="mt-2 text-teal-100">আপনার ইউনিয়নের ভোটার ব্যবস্থাপনা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভোটার</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.totalVoters || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পুরুষ ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.maleVoters || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-pink-50 border-pink-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মহিলা ভোটার</CardTitle>
              <Users className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-700">{stats?.femaleVoters || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উচ্চ অগ্রাধিকার</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.highPriorityVoters || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>দ্রুত কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/admin/add-voter">নতুন ভোটার যোগ করুন</a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/voters">ইউনিয়নের ভোটার দেখুন</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ইউনিয়ন ব্যবস্থাপনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                স্থানীয় রিপোর্ট
              </Button>
              <Button className="w-full" variant="outline">
                ভোটার যোগাযোগ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default VillageAdminDashboard;
