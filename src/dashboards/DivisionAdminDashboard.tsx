
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

const DivisionAdminDashboard = () => {
  const { userProfile } = useAuth();
  const divisionId = userProfile?.division_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['division-admin-stats', divisionId],
    queryFn: async () => {
      if (!divisionId) return null;

      const votersRef = collection(db, 'voters');
      const q = query(votersRef, where('division_id', '==', divisionId));
      const snapshot = await getDocs(q);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      const divisionName = await getLocationName('division', divisionId);
      
      return {
        divisionName,
        totalVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
        withPhone: voters.filter(v => v.Phone).length,
        avgVoteProbability: voters.reduce((sum, v) => sum + (v['Vote Probability (%)'] || 0), 0) / voters.length || 0
      };
    },
    enabled: !!divisionId
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
            <h1 className="text-3xl font-bold text-gray-900">বিভাগীয় অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">
              {stats?.divisionName} বিভাগ - জামায়াতে ইসলামী
            </p>
          </div>
        </div>

        {/* Division Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বিভাগের ভোটার</CardTitle>
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
              <p className="text-xs text-green-600">ভোট দিতে প্রতিশ্রুতিবদ্ধ</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উচ্চ অগ্রাধিকার</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.highPriority || 0}</div>
              <p className="text-xs text-purple-600">গুরুত্বপূর্ণ ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">যোগাযোগ সম্ভব</CardTitle>
              <MapPin className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.withPhone || 0}</div>
              <p className="text-xs text-orange-600">ফোন নম্বর রয়েছে</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>জেলা ব্যবস্থাপনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                জেলা অ্যাডমিন নিয়োগ
              </Button>
              <Button className="w-full" variant="outline">
                জেলা ভিত্তিক রিপোর্ট
              </Button>
              <Button className="w-full" variant="outline">
                উপজেলা পরিদর্শন
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ভোটার ব্যবস্থাপনা</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/add-voter">নতুন ভোটার যোগ</a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/voters">বিভাগের সব ভোটার</a>
              </Button>
              <Button className="w-full" variant="outline">
                ভোটার যাচাইকরণ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>প্রচারণা কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/sms-campaign">SMS ক্যাম্পেইন</a>
              </Button>
              <Button className="w-full" variant="outline">
                প্রচার পরিকল্পনা
              </Button>
              <Button className="w-full" variant="outline">
                কর্মী সমন্বয়
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Vote Probability Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ভোট সম্ভাবনা সংক্ষেপ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(stats?.avgVoteProbability || 0)}%
              </div>
              <p className="text-gray-600 mt-2">গড় ভোট সম্ভাবনা</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DivisionAdminDashboard;
