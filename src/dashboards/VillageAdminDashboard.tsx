
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

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['village-admin-stats', userProfile?.accessScope?.village_id],
    queryFn: async () => {
      if (!userProfile?.accessScope?.village_id) {
        console.log('No village_id found for user:', userProfile);
        return null;
      }

      console.log('Fetching stats for village:', userProfile.accessScope.village_id);

      const votersRef = collection(db, 'voters');
      const votersQuery = query(votersRef, where('village_id', '==', userProfile.accessScope.village_id));
      
      try {
        const votersSnapshot = await getDocs(votersQuery);
        const voters = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
        
        console.log('Found voters:', voters.length);
        
        const stats = {
          totalVoters: voters.length,
          maleVoters: voters.filter(v => v.Gender === 'Male' || v.Gender === 'পুরুষ').length,
          femaleVoters: voters.filter(v => v.Gender === 'Female' || v.Gender === 'মহিলা').length,
          highProbabilityVoters: voters.filter(v => (v['Vote Probability (%)'] || 0) >= 80).length
        };
        
        console.log('Calculated stats:', stats);
        return stats;
        
      } catch (error) {
        console.error('Error fetching village admin stats:', error);
        throw error;
      }
    },
    enabled: !!userProfile?.accessScope?.village_id
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

  if (error) {
    console.error('Village Admin Dashboard error:', error);
    return (
      <RoleBasedSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg text-red-600">ডেটা লোড করতে সমস্যা হয়েছে</div>
            <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
          </div>
        </div>
      </RoleBasedSidebar>
    );
  }

  if (!userProfile?.accessScope?.village_id) {
    return (
      <RoleBasedSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg text-orange-600">গ্রামের তথ্য পাওয়া যায়নি</div>
            <p className="text-sm text-gray-500 mt-2">আপনার গ্রামের তথ্য সিস্টেমে নেই</p>
          </div>
        </div>
      </RoleBasedSidebar>
    );
  }

  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">গ্রাম অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="mt-2 text-purple-100">আপনার গ্রামের ভোটার ব্যবস্থাপনা</p>
          {userProfile?.accessScope?.village_name && (
            <p className="text-sm text-purple-200 mt-1">
              গ্রাম: {userProfile.accessScope.village_name}
            </p>
          )}
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
              <CardTitle className="text-sm font-medium">উচ্চ সম্ভাবনা</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.highProbabilityVoters || 0}</div>
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
                <a href="/admin/all-voters">গ্রামের ভোটার দেখুন</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>গ্রাম ব্যবস্থাপনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/sms-campaign">SMS ক্যাম্পেইন</a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/analytics-reports">রিপোর্ট দেখুন</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default VillageAdminDashboard;
