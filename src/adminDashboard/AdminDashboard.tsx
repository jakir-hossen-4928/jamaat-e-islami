
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Vote, TrendingUp, MessageSquare } from 'lucide-react';
import { VoterData } from '@/lib/types';

const AdminDashboard = () => {
  const { data: voterStats, isLoading } = useQuery({
    queryKey: ['voterStats'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
      
      const totalVoters = voters.length;
      const willVote = voters.filter(v => v['Will Vote'] === 'Yes').length;
      const highPriority = voters.filter(v => v['Priority Level'] === 'High').length;
      const avgProbability = voters.reduce((sum, v) => sum + (v['Vote Probability (%)'] || 0), 0) / totalVoters;
      
      return {
        totalVoters,
        willVote,
        highPriority,
        avgProbability: Math.round(avgProbability)
      };
    }
  });

  const statsCards = [
    {
      title: 'মোট ভোটার',
      value: voterStats?.totalVoters || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'ভোট দেবেন',
      value: voterStats?.willVote || 0,
      icon: Vote,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'উচ্চ অগ্রাধিকার',
      value: voterStats?.highPriority || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'গড় সম্ভাবনা',
      value: `${voterStats?.avgProbability || 0}%`,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-600 mt-2 md:mt-0">জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>নতুন ভোটার যোগ করুন</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                একক বা বাল্ক আপলোডের মাধ্যমে নতুন ভোটার তথ্য যোগ করুন
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span>SMS ক্যাম্পেইন</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                টার্গেটেড SMS পাঠান এবং ক্যাম্পেইন ম্যানেজ করুন
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>রিপোর্ট তৈরি করুন</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                বিস্তারিত রিপোর্ট এবং বিশ্লেষণ দেখুন
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
