
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserManagementProps {
  refreshKey: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ refreshKey }) => {
  const { userProfile } = useAuth();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['all-users', refreshKey],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as User));
    },
    enabled: userProfile?.role === 'super_admin'
  });

  const handleApproveUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        rejected: false,
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        roleUpdatedBy: userProfile?.uid,
        roleUpdatedAt: new Date()
      });
      toast.success('ভূমিকা আপডেট করা হয়েছে');
      refetch();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('ভূমিকা আপডেটে ত্রুটি হয়েছে');
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.approved) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3" />
          অনুমোদিত
        </Badge>
      );
    } else if (user.rejected) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3" />
          প্রত্যাখ্যাত
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3" />
          অপেক্ষমাণ
        </Badge>
      );
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
          <p className="text-gray-500">কোন ব্যবহারকারী পাওয়া যায়নি</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.uid}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                {user.displayName || user.email}
              </CardTitle>
              {getStatusBadge(user)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>ইমেইল:</strong> {user.email}</p>
                <p><strong>বর্তমান ভূমিকা:</strong> {user.role === 'village_admin' ? 'গ্রাম অ্যাডমিন' : user.role === 'super_admin' ? 'সুপার অ্যাডমিন' : user.role}</p>
                {user.phone && <p><strong>ফোন:</strong> {user.phone}</p>}
              </div>
              <div>
                <p><strong>বিভাগ:</strong> {user.accessScope?.division_name || 'N/A'}</p>
                <p><strong>জেলা:</strong> {user.accessScope?.district_name || 'N/A'}</p>
                <p><strong>উপজেলা:</strong> {user.accessScope?.upazila_name || 'N/A'}</p>
                <p><strong>ইউনিয়ন:</strong> {user.accessScope?.union_name || 'N/A'}</p>
                <p><strong>গ্রাম:</strong> {user.accessScope?.village_name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2">
                {!user.approved && !user.rejected && (
                  <Button
                    onClick={() => handleApproveUser(user.uid)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    অনুমোদন করুন
                  </Button>
                )}
                {!user.approved && !user.rejected && (
                  <Button
                    onClick={() => handleRejectUser(user.uid)}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    প্রত্যাখ্যান করুন
                  </Button>
                )}
                {user.approved && (
                  <Button
                    onClick={() => handleRejectUser(user.uid)}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    প্রত্যাখ্যান করুন
                  </Button>
                )}
                {user.rejected && (
                  <Button
                    onClick={() => handleApproveUser(user.uid)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    অনুমোদন করুন
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <Select value={user.role} onValueChange={(value) => handleRoleChange(user.uid, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                    <SelectItem value="village_admin">গ্রাম অ্যাডমিন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserManagement;
