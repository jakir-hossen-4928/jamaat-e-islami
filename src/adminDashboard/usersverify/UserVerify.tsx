
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
import { Search, UserCheck, UserX, Edit, Users, Shield, Clock, User } from 'lucide-react';
import { User as UserType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePageTitle } from '@/lib/usePageTitle';

const UserVerify = () => {
  usePageTitle('ব্যবহারকারী যাচাই - অ্যাডমিন প্যানেল');
  
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ ...doc.data() } as UserType));
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserType> }) => {
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

  const handleRoleChange = (userId: string, newRole: UserType['role']) => {
    updateUserMutation.mutate({
      userId,
      updates: { role: newRole }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'division_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'district_admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upazila_admin':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'village_admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalBadgeColor = (approved: boolean) => {
    return approved 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (userProfile?.role !== 'super_admin') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 p-4">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">অ্যাক্সেস অস্বীকৃত</h2>
            <p className="text-sm sm:text-base text-gray-600">এই পৃষ্ঠায় প্রবেশের জন্য আপনার সুপার অ্যাডমিন অনুমতি প্রয়োজন।</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-4 p-2 sm:p-4 lg:p-6">
        {/* Mobile-First Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">মোট ইউজার</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">অনুমোদিত</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-600">
                    {users.filter(u => u.approved).length}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-yellow-600">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">অপেক্ষমাণ</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-yellow-600">
                    {users.filter(u => !u.approved).length}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-600">
            <CardContent className="p-2 sm:p-3 lg:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">অ্যাডমিন</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold text-red-600">
                    {users.filter(u => u.role === 'super_admin').length}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Optimized Search and Controls */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="truncate">ব্যবহারকারী ব্যবস্থাপনা</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs w-fit">
                {filteredUsers.length} জন ব্যবহারকারী
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Users Display */}
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-sm font-semibold">নাম</TableHead>
                        <TableHead className="text-sm font-semibold">ইমেইল</TableHead>
                        <TableHead className="text-sm font-semibold">ভূমিকা</TableHead>
                        <TableHead className="text-sm font-semibold">অবস্থা</TableHead>
                        <TableHead className="text-sm font-semibold">যোগদান</TableHead>
                        <TableHead className="text-sm font-semibold">কার্যক্রম</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="text-sm">লোড হচ্ছে...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500">
                            {searchTerm ? `"${searchTerm}" খুঁজে পাওয়া যায়নি` : 'কোন ব্যবহারকারী পাওয়া যায়নি'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.uid} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="text-sm font-medium">
                              {user.displayName || 'নাম নেই'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={user.role} 
                                onValueChange={(value: UserType['role']) => 
                                  handleRoleChange(user.uid, value)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    <Badge className={getRoleBadgeColor(user.role)}>
                                      {user.role === 'super_admin' ? 'সুপার অ্যাডমিন' :
                                       user.role === 'division_admin' ? 'বিভাগীয় অ্যাডমিন' :
                                       user.role === 'district_admin' ? 'জেলা অ্যাডমিন' :
                                       user.role === 'upazila_admin' ? 'উপজেলা অ্যাডমিন' :
                                       user.role === 'village_admin' ? 'গ্রাম অ্যাডমিন' : 'ব্যবহারকারী'}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="village_admin">গ্রাম অ্যাডমিন</SelectItem>
                                  <SelectItem value="upazila_admin">উপজেলা অ্যাডমিন</SelectItem>
                                  <SelectItem value="district_admin">জেলা অ্যাডমিন</SelectItem>
                                  <SelectItem value="division_admin">বিভাগীয় অ্যাডমিন</SelectItem>
                                  <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge className={getApprovalBadgeColor(user.approved)}>
                                {user.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
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

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {isLoading ? (
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-sm">লোড হচ্ছে...</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredUsers.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="p-4 text-center text-sm text-gray-500">
                  {searchTerm ? `"${searchTerm}" খুঁজে পাওয়া যায়নি` : 'কোন ব্যবহারকারী পাওয়া যায়নি'}
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.uid} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                            {user.displayName || 'নাম নেই'}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Status and Role */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getApprovalBadgeColor(user.approved)}>
                          {user.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                        </Badge>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === 'super_admin' ? 'সুপার অ্যাডমিন' :
                           user.role === 'division_admin' ? 'বিভাগীয় অ্যাডমিন' :
                           user.role === 'district_admin' ? 'জেলা অ্যাডমিন' :
                           user.role === 'upazila_admin' ? 'উপজেলা অ্যাডমিন' :
                           user.role === 'village_admin' ? 'গ্রাম অ্যাডমিন' : 'ব্যবহারকারী'}
                        </Badge>
                      </div>

                      {/* Role Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">ভূমিকা পরিবর্তন:</label>
                        <Select 
                          value={user.role} 
                          onValueChange={(value: UserType['role']) => 
                            handleRoleChange(user.uid, value)
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="village_admin">গ্রাম অ্যাডমিন</SelectItem>
                            <SelectItem value="upazila_admin">উপজেলা অ্যাডমিন</SelectItem>
                            <SelectItem value="district_admin">জেলা অ্যাডমিন</SelectItem>
                            <SelectItem value="division_admin">বিভাগীয় অ্যাডমিন</SelectItem>
                            <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {!user.approved ? (
                          <Button
                            size="sm"
                            onClick={() => handleApproveUser(user.uid)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            অনুমোদন করুন
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectUser(user.uid)}
                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 h-8 text-xs"
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            অনুমোদন বাতিল
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserVerify;
