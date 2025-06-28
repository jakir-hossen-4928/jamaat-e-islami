
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Eye, Edit } from 'lucide-react';
import { VoterData } from '@/lib/types';

const UserDashboard = () => {
  const { userProfile } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', userProfile?.uid],
    queryFn: async () => {
      if (!userProfile?.uid) return null;

      const votersRef = collection(db, 'voters');
      const q = query(votersRef, where('Collector', '==', userProfile.uid));
      const snapshot = await getDocs(q);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      return {
        myVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
        recentlyAdded: voters.filter(v => {
          const collectionDate = new Date(v['Collection Date'] || '');
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return collectionDate > oneMonthAgo;
        }).length
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
            <h1 className="text-3xl font-bold text-gray-900">আমার ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">
              আপনার অবদান - জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আমার যোগ করা ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.myVoters || 0}</div>
              <p className="text-xs text-blue-600">মোট অবদান</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ভোট দেবেন</CardTitle>
              <Plus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.willVote || 0}</div>
              <p className="text-xs text-green-600">নিশ্চিত ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উচ্চ অগ্রাধিকার</CardTitle>
              <Edit className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.highPriority || 0}</div>
              <p className="text-xs text-purple-600">গুরুত্বপূর্ণ ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সাম্প্রতিক</CardTitle>
              <Eye className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.recentlyAdded || 0}</div>
              <p className="text-xs text-orange-600">গত মাসে যোগ</p>
            </CardContent>
          </Card>
        </div>

        {/* User Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>আমার কাজ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/add-voter">নতুন ভোটার যোগ করুন</a>
              </Button>
              <Button className="w-full" variant="outline">
                <a href="/admin/voters">আমার যোগ করা ভোটার</a>
              </Button>
              <Button className="w-full" variant="outline">
                তথ্য আপডেট করুন
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>পারফরম্যান্স</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>মোট অবদান:</span>
                  <span className="font-bold text-blue-600">{stats?.myVoters || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>ভোট দেবেন:</span>
                  <span className="font-bold text-green-600">
                    {stats?.myVoters ? Math.round(((stats?.willVote || 0) / stats.myVoters) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>মানসম্পন্ন ডেটা:</span>
                  <span className="font-bold text-purple-600">
                    {stats?.myVoters ? Math.round(((stats?.highPriority || 0) / stats.myVoters) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>অবদানের নির্দেশনা</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">করণীয়:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• সঠিক ও সম্পূর্ণ তথ্য প্রদান করুন</li>
                  <li>• ভোটারের অনুমতি নিয়ে তথ্য সংগ্রহ করুন</li>
                  <li>• নিয়মিত তথ্য আপডেট করুন</li>
                  <li>• অগ্রাধিকার সঠিকভাবে নির্ধারণ করুন</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">বর্জনীয়:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• ভুল বা অনুমান ভিত্তিক তথ্য</li>
                  <li>• ডুপ্লিকেট এন্ট্রি</li>
                  <li>• ব্যক্তিগত গোপনীয়তা লঙ্ঘন</li>
                  <li>• অনুমতি ছাড়া তথ্য ব্যবহার</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
