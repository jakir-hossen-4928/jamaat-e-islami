
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Home, Phone, MessageSquare } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { getLocationName } from '@/lib/locationUtils';

const WardAdminDashboard = () => {
  const { userProfile } = useAuth();
  const wardId = userProfile?.ward_id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['ward-admin-stats', wardId],
    queryFn: async () => {
      if (!wardId) return null;

      const votersRef = collection(db, 'voters');
      const q = query(votersRef, where('ward_id', '==', wardId));
      const snapshot = await getDocs(q);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      const wardName = await getLocationName('ward', wardId);
      
      return {
        wardName,
        totalVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        withPhone: voters.filter(v => v.Phone).length,
        withWhatsApp: voters.filter(v => v.WhatsApp === 'Yes').length,
        youngVoters: voters.filter(v => (v.Age || 0) < 35).length,
        elderlyVoters: voters.filter(v => (v.Age || 0) >= 60).length,
        householdCount: new Set(voters.map(v => v['House Name'])).size
      };
    },
    enabled: !!wardId
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
            <h1 className="text-3xl font-bold text-gray-900">ওয়ার্ড অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">
              {stats?.wardName} ওয়ার্ড - জামায়াতে ইসলামী
            </p>
          </div>
        </div>

        {/* Ward Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ওয়ার্ডের ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalVoters || 0}</div>
              <p className="text-xs text-blue-600">মোট ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পরিবার</CardTitle>
              <Home className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.householdCount || 0}</div>
              <p className="text-xs text-green-600">আলাদা পরিবার</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ফোন যোগাযোগ</CardTitle>
              <Phone className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.withPhone || 0}</div>
              <p className="text-xs text-purple-600">WhatsApp: {stats?.withWhatsApp || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ভোট দেবেন</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.willVote || 0}</div>
              <p className="text-xs text-orange-600">নিশ্চিত ভোটার</p>
            </CardContent>
          </Card>
        </div>

        {/* Local Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>স্থানীয় কার্যক্রম</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/add-voter">নতুন ভোটার যোগ</a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/voters">ওয়ার্ডের ভোটার</a>
              </Button>
              <Button className="w-full" variant="outline">
                পরিবার ভিত্তিক তালিকা
              </Button>
              <Button className="w-full" variant="outline">
                ভোটার যাচাইকরণ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>প্রচারণা কাজ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/sms-campaign">SMS পাঠান</a>
              </Button>
              <Button className="w-full" variant="outline">
                দরজায় দরজায় প্রচার
              </Button>
              <Button className="w-full" variant="outline">
                WhatsApp গ্রুপ
              </Button>
              <Button className="w-full" variant="outline">
                স্থানীয় সভা
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Age Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>বয়স ভিত্তিক বিভাজন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>তরুণ ভোটার (৩৫ এর কম):</span>
                  <span className="font-bold text-blue-600">{stats?.youngVoters || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>বয়স্ক ভোটার (৬০+):</span>
                  <span className="font-bold text-green-600">{stats?.elderlyVoters || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>মধ্যবয়সী ভোটার:</span>
                  <span className="font-bold text-purple-600">
                    {(stats?.totalVoters || 0) - (stats?.youngVoters || 0) - (stats?.elderlyVoters || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>যোগাযোগ পরিসংখ্যান</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>ফোন আছে:</span>
                  <span className="font-bold text-blue-600">{stats?.withPhone || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>WhatsApp ব্যবহার:</span>
                  <span className="font-bold text-green-600">{stats?.withWhatsApp || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>যোগাযোগ সম্ভব:</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(((stats?.withPhone || 0) / (stats?.totalVoters || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WardAdminDashboard;
