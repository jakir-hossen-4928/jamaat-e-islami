
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserManagementProps {
  refreshKey: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ refreshKey }) => {
  const { userProfile } = useAuth();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['pending-users', refreshKey],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('approved', '==', false));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    },
    enabled: userProfile?.role === 'super_admin'
  });

  const handleApproveUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        verifiedBy: userProfile?.uid,
        verifiedAt: new Date()
      });
      toast.success('ব্যবহারকারী অনুমোদিত হয়েছে');
      refetch();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('অনুমোদনে ত্রুটি হয়েছে');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: false,
        rejected: true,
        rejectedBy: userProfile?.uid,
        rejectedAt: new Date()
      });
      toast.success('ব্যবহারকারী প্রত্যাখ্যান করা হয়েছে');
      refetch();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('প্রত্যাখ্যানে ত্রুটি হয়েছে');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">ব্যবহারকারী তথ্য লোড হচ্ছে...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">কোন অনুমোদনের অপেক্ষায় থাকা ব্যবহারকারী নেই</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{user.displayName || user.email}</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                অপেক্ষমাণ
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>ইমেইল:</strong> {user.email}</p>
                <p><strong>ফোন:</strong> {user.phone || 'N/A'}</p>
                <p><strong>ভূমিকা:</strong> {user.role === 'village_admin' ? 'গ্রাম অ্যাডমিন' : user.role}</p>
              </div>
              <div>
                <p><strong>বিভাগ:</strong> {user.accessScope?.division_name || 'N/A'}</p>
                <p><strong>জেলা:</strong> {user.accessScope?.district_name || 'N/A'}</p>
                <p><strong>উপজেলা:</strong> {user.accessScope?.upazila_name || 'N/A'}</p>
                <p><strong>ইউনিয়ন:</strong> {user.accessScope?.union_name || 'N/A'}</p>
                <p><strong>গ্রাম:</strong> {user.accessScope?.village_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleApproveUser(user.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                অনুমোদন করুন
              </Button>
              <Button
                onClick={() => handleRejectUser(user.id)}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                প্রত্যাখ্যান করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserManagement;
