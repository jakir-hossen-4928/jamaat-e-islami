
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, TrendingUp, MessageSquare } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { getLocationName } from '@/lib/locationUtils';

const DistrictAdminDashboard = () => {
  const { userProfile } = useAuth();
  const districtId = userProfile?.district_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['district-admin-stats', districtId],
    queryFn: async () => {
      if (!districtId) return null;

      const votersRef = collection(db, 'voters');
      const q = query(votersRef, where('district_id', '==', districtId));
      const snapshot = await getDocs(q);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      const districtName = await getLocationName('district', districtId);
      
      return {
        districtName,
        totalVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
        withPhone: voters.filter(v => v.Phone).length,
        maleVoters: voters.filter(v => v.Gender === 'Male').length,
        femaleVoters: voters.filter(v => v.Gender === 'Female').length
      };
    },
    enabled: !!districtId
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
            <h1 className="text-3xl font-bold text-gray-900">জেলা অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">
              {stats?.districtName} জেলা - জামায়াতে ইসলামী
            </p>
          </div>
        </div>

        {/* District Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">জেলার ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalVoters || 0}</div>
              <p className="text-xs text-blue-600">মোট নিবন্ধিত ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ভোট দেবেন</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.willVote || 0}</div>
              <p className="text-xs text-green-600">নিশ্চিত ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পুরুষ ভোটার</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.maleVoters || 0}</div>
              <p className="text-xs text-purple-600">মহিলা: {stats?.femaleVoters || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">যোগাযোগ</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.withPhone || 0}</div>
              <p className="text-xs text-orange-600">ফোন নম্বর আছে</p>
            </CardContent>
          </Card>
        </div>

        {/* District Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>উপজেলা ব্যবস্থাপনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                উপজেলা অ্যাডমিন নিয়োগ
              </Button>
              <Button className="w-full" variant="outline">
                উপজেলা ভিত্তিক রিপোর্ট
              </Button>
              <Button className="w-full" variant="outline">
                ইউনিয়ন তদারকি
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ভোটার কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/add-voter">ভোটার নিবন্ধন</a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/voters">জেলার সব ভোটার</a>
              </Button>
              <Button className="w-full" variant="outline">
                ভোটার তালিকা যাচাই
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>নির্বাচনী প্রস্তুতি</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/sms-campaign">SMS প্রচার</a>
              </Button>
              <Button className="w-full" variant="outline">
                কেন্দ্র ভিত্তিক পরিকল্পনা
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/analytics">জেলা রিপোর্ট</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Priority Voters */}
        <Card>
          <CardHeader>
            <CardTitle>অগ্রাধিকার ভোটার</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-red-600">
                {stats?.highPriority || 0}
              </div>
              <p className="text-gray-600 mt-2">উচ্চ অগ্রাধিকার ভোটার</p>
              <p className="text-sm text-gray-500 mt-1">
                এই ভোটারদের বিশেষ নজরদারি প্রয়োজন
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DistrictAdminDashboard;
