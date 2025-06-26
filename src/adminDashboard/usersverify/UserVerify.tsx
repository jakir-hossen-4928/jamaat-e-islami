
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, UserX, Edit } from 'lucide-react';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserVerify = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ ...doc.data() } as User));
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      await updateDoc(doc(db, 'users', userId), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "সফল",
        description: "ব্যবহারকারীর তথ্য আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারীর তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveUser = (userId: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { approved: true }
    });
  };

  const handleRejectUser = (userId: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { approved: false }
    });
  };

  const handleRoleChange = (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    updateUserMutation.mutate({
      userId,
      updates: { role: newRole }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalBadgeColor = (approved: boolean) => {
    return approved 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (userProfile?.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">অ্যাক্সেস অস্বীকৃত</h2>
            <p className="text-gray-600">এই পৃষ্ঠায় প্রবেশের জন্য আপনার অ্যাডমিন অনুমতি প্রয়োজন।</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="shadow-lg border-l-4 border-l-blue-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">মোট ইউজার</h3>
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-l-green-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">অনুমোদিত</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.approved).length}
                  </p>
                </div>
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-l-yellow-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">অপেক্ষমাণ</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter(u => !u.approved).length}
                  </p>
                </div>
                <UserX className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-l-4 border-l-red-600">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">অ্যাডমিন</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <UserCheck className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <span>ব্যবহারকারী ব্যবস্থাপনা</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredUsers.length} জন ব্যবহারকারী
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="text-xs sm:text-sm font-semibold">নাম</TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold">ইমেইল</TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold">ভূমিকা</TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold">অবস্থা</TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold">যোগদান</TableHead>
                    <TableHead className="text-xs sm:text-sm font-semibold">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span>লোড হচ্ছে...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                        কোন ব্যবহারকারী পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.uid} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-xs sm:text-sm font-medium">
                          {user.displayName || 'নাম নেই'}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value: 'admin' | 'moderator' | 'user') => 
                              handleRoleChange(user.uid, value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {user.role === 'admin' ? 'অ্যাডমিন' : 
                                   user.role === 'moderator' ? 'মডারেটর' : 'ব্যবহারকারী'}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">ব্যবহারকারী</SelectItem>
                              <SelectItem value="moderator">মডারেটর</SelectItem>
                              <SelectItem value="admin">অ্যাডমিন</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge className={getApprovalBadgeColor(user.approved)}>
                            {user.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!user.approved && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveUser(user.uid)}
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                title="অনুমোদন করুন"
                              >
                                <UserCheck className="w-3 h-3" />
                              </Button>
                            )}
                            {user.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectUser(user.uid)}
                                className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                title="অনুমোদন বাতিল করুন"
                              >
                                <UserX className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserVerify;
