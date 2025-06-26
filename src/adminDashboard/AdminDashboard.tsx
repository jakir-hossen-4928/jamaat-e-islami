
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, MessageSquare, BarChart3 } from 'lucide-react';
import { VoterData } from '@/lib/types';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      return {
        totalVoters: voters.length,
        willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
        highPriority: voters.filter(v => v['Priority Level'] === 'High').length,
        withPhone: voters.filter(v => v.Phone).length,
        avgVoteProbability: voters.reduce((sum, v) => sum + (v['Vote Probability (%)'] || 0), 0) / voters.length
      };
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">ডেটা লোড হচ্ছে...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভোটার</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVoters || 0}</div>
              <p className="text-xs text-muted-foreground">ডেটাবেসে মোট ভোটার</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ভোট দেবেন</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.willVote || 0}</div>
              <p className="text-xs text-muted-foreground">ভোট দিতে ইচ্ছুক</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উচ্চ অগ্রাধিকার</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.highPriority || 0}</div>
              <p className="text-xs text-muted-foreground">যোগাযোগের জন্য গুরুত্বপূর্ণ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ফোন নম্বর আছে</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.withPhone || 0}</div>
              <p className="text-xs text-muted-foreground">SMS পাঠানো যাবে</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS ক্যাম্পেইন শুরু করুন</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                SMS ক্যাম্পেইন তৈরি করে ভোটারদের সাথে সরাসরি যোগাযোগ করুন।
              </p>
              <Button asChild>
                <a href="/admin/sms">SMS ক্যাম্পেইন</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>নতুন ভোটার যোগ করুন</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                নতুন ভোটার যোগ করে डेटाবেস প্রসারিত করুন এবং আরো মানুষের কাছে পৌঁছান।
              </p>
              <Button asChild>
                <a href="/admin/add-voters">ভোটার যোগ করুন</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
