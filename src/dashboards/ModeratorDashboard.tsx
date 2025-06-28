
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Eye, MessageSquare } from 'lucide-react';
import { VoterData } from '@/lib/types';

const ModeratorDashboard = () => {
  const { userProfile } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['moderator-stats'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      let q = query(votersRef);
      
      // Apply location-based filtering based on moderator's scope
      if (userProfile?.division_id) {
        q = query(votersRef, where('division_id', '==', userProfile.division_id));
      }
      if (userProfile?.district_id) {
        q = query(votersRef, where('district_id', '==', userProfile.district_id));
      }
      if (userProfile?.ward_id) {
        q = query(votersRef, where('ward_id', '==', userProfile.ward_id));
      }
      
      const snapshot = await getDocs(q);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      return {
        totalVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        needsReview: voters.filter(v => !v['Last Updated'] || v['Last Updated'] < '2024-01-01').length,
        withPhone: voters.filter(v => v.Phone).length
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
            <h1 className="text-3xl font-bold text-gray-900">মডারেটর ড্যাশবোর্ড</h1>
            <p className="text-gray-600 mt-1">
              ডেটা পর্যালোচনা ও সম্পাদনা - জামায়াতে ইসলামী
            </p>
          </div>
        </div>

        {/* Moderator Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">আপনার এলাকার ভোটার</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalVoters || 0}</div>
              <p className="text-xs text-blue-600">দায়িত্বে থাকা ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ভোট দেবেন</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats?.willVote || 0}</div>
              <p className="text-xs text-green-600">নিশ্চিত ভোটার</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পর্যালোচনা প্রয়োজন</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.needsReview || 0}</div>
              <p className="text-xs text-orange-600">আপডেট করা দরকার</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">যোগাযোগ সম্ভব</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.withPhone || 0}</div>
              <p className="text-xs text-purple-600">ফোন নম্বর আছে</p>
            </CardContent>
          </Card>
        </div>

        {/* Moderator Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ডেটা পর্যালোচনা কাজ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/voters">ভোটার তালিকা দেখুন</a>
              </Button>
              <Button className="w-full" variant="outline">
                তথ্য সম্পাদনা করুন
              </Button>
              <Button className="w-full" variant="outline">
                অসম্পূর্ণ প্রোফাইল
              </Button>
              <Button className="w-full" variant="outline">
                ডুপ্লিকেট চেক করুন
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>রিপোর্ট ও বিশ্লেষণ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <a href="/admin/analytics">ডেটা বিশ্লেষণ</a>
              </Button>
              <Button className="w-full" variant="outline">
                মাসিক রিপোর্ট
              </Button>
              <Button className="w-full" variant="outline">
                ভোটার ট্রেন্ড
              </Button>
              <Button className="w-full" variant="outline">
                কর্মক্ষমতা রিপোর্ট
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Review Priority */}
        <Card>
          <CardHeader>
            <CardTitle>পর্যালোচনা অগ্রাধিকার</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium">জরুরি: অসম্পূর্ণ তথ্য</span>
                <span className="text-red-600 font-bold">
                  {Math.round(((stats?.needsReview || 0) / (stats?.totalVoters || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-700 font-medium">মাঝারি: যাচাইকরণ</span>
                <span className="text-yellow-600 font-bold">
                  {Math.round(((stats?.withPhone || 0) / (stats?.totalVoters || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">ভাল: সম্পূর্ণ প্রোফাইল</span>
                <span className="text-green-600 font-bold">
                  {Math.round((((stats?.totalVoters || 0) - (stats?.needsReview || 0)) / (stats?.totalVoters || 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
