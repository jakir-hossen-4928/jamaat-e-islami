
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCheck, UserX, Users, Shield, Clock, User, MapPin } from 'lucide-react';
import { User as UserType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getRolePermissions, canVerifyRole } from '@/lib/rbac';
import { getLocationNameById } from '@/lib/locationUtils';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const permissions = getRolePermissions(userProfile?.role || 'union_admin');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', userProfile?.role],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      let usersQuery = usersRef;

      // Filter users based on current user's role
      if (userProfile?.role !== 'super_admin') {
        // Non-super admins can only see users in their hierarchy
        const allowedRoles = permissions.canAssignRoles;
        if (allowedRoles.length > 0) {
          usersQuery = query(usersRef, where('role', 'in', allowedRoles));
        }
      }

      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({ ...doc.data() } as UserType));
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserType> }) => {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        verifiedBy: userProfile?.uid,
        lastUpdated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "সফল",
        description: "ব্যবহারকারীর তথ্য আপডেট হয়েছে",
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারীর তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'approved' && user.approved) ||
                         (selectedStatus === 'pending' && !user.approved);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
    // Check if current user can assign this role
    if (!permissions.canAssignRoles.includes(newRole)) {
      toast({
        title: "অনুমতি নেই",
        description: "আপনার এই ভূমিকা নির্ধারণের অনুমতি নেই",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate({
      userId,
      updates: { 
        role: newRole,
        assignedBy: userProfile?.uid
      }
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
      case 'union_admin':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'সুপার অ্যাডমিন';
      case 'division_admin': return 'বিভাগীয় অ্যাডমিন';
      case 'district_admin': return 'জেলা অ্যাডমিন';
      case 'upazila_admin': return 'উপজেলা অ্যাডমিন';
      case 'union_admin': return 'ইউনিয়ন অ্যাডমিন';
      default: return 'অজানা';
    }
  };

  const getApprovalBadgeColor = (approved: boolean) => {
    return approved 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (!permissions.canVerifyUsers) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">অ্যাক্সেস অস্বীকৃত</h2>
          <p className="text-sm sm:text-base text-gray-600">আপনার ব্যবহারকারী যাচাইয়ের অনুমতি নেই।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট ব্যবহারকারী</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অনুমোদিত</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {users.filter(u => u.approved).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমাণ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {users.filter(u => !u.approved).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">অ্যাডমিন</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {users.filter(u => u.role !== 'union_admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ব্যবহারকারী ব্যবস্থাপনা</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredUsers.length} জন
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="ভূমিকা নির্বাচন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ভূমিকা</SelectItem>
                <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem>
                <SelectItem value="division_admin">বিভাগীয় অ্যাডমিন</SelectItem>
                <SelectItem value="district_admin">জেলা অ্যাডমিন</SelectItem>
                <SelectItem value="upazila_admin">উপজেলা অ্যাডমিন</SelectItem>
                <SelectItem value="union_admin">ইউনিয়ন অ্যাডমিন</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="অবস্থা নির্বাচন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব অবস্থা</SelectItem>
                <SelectItem value="approved">অনুমোদিত</SelectItem>
                <SelectItem value="pending">অপেক্ষমাণ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ব্যবহারকারী</TableHead>
                  <TableHead>ভূমিকা</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead>এলাকা</TableHead>
                  <TableHead>যোগদান</TableHead>
                  <TableHead>কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>লোড হচ্ছে...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? `"${searchTerm}" খুঁজে পাওয়া যায়নি` : 'কোন ব্যবহারকারী পাওয়া যায়নি'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.uid} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.displayName || 'নাম নেই'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {permissions.canAssignRoles.includes(user.role) ? (
                          <Select 
                            value={user.role} 
                            onValueChange={(value: UserType['role']) => 
                              handleRoleChange(user.uid, value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  {getRoleDisplayName(user.role)}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {permissions.canAssignRoles.map(role => (
                                <SelectItem key={role} value={role}>
                                  {getRoleDisplayName(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getApprovalBadgeColor(user.approved)}>
                          {user.approved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {user.accessScope?.division_name || 
                             user.accessScope?.district_name ||
                             user.accessScope?.upazila_name ||
                             user.accessScope?.union_name ||
                             'সব এলাকা'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {!user.approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveUser(user.uid)}
                              className="h-8 px-3 bg-green-600 hover:bg-green-700"
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
                              className="h-8 px-3 text-red-600 hover:bg-red-50"
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
  );
};

export default UserManagement;
