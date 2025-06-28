
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';
import { getRolePermissions, getRoleDisplayName, canVerifyRole, getLocationBasedUsers } from '@/lib/rbac';
import { getFullLocationHierarchy } from '@/lib/locationUtils';
import { CheckCircle, XCircle, Trash2, UserCheck, MapPin } from 'lucide-react';

const UserManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as User));
      
      // Add location hierarchy information
      const usersWithLocation = await Promise.all(
        users.map(async (user) => {
          const hierarchy = await getFullLocationHierarchy(user.accessScope);
          return {
            ...user,
            locationHierarchy: hierarchy
          };
        })
      );
      
      return usersWithLocation;
    },
  });

  // Filter users based on current user's permissions
  const filteredUsers = userProfile ? getLocationBasedUsers(userProfile, allUsers) : [];
  const permissions = userProfile ? getRolePermissions(userProfile.role) : null;

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        approved,
        verifiedBy: userProfile?.uid,
        lastUpdated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'সফল',
        description: 'ব্যবহারকারী যাচাই সম্পন্ন হয়েছে',
      });
    },
    onError: (error) => {
      toast({
        title: 'ত্রুটি',
        description: 'যাচাই করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await deleteDoc(doc(db, 'users', userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'সফল',
        description: 'ব্যবহারকারী মুছে ফেলা হয়েছে',
      });
    },
    onError: (error) => {
      toast({
        title: 'ত্রুটি',
        description: 'মুছে ফেলতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  const handleVerifyUser = (userId: string, approved: boolean) => {
    verifyUserMutation.mutate({ userId, approved });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (!userProfile || !permissions?.canVerifyUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">আপনার ব্যবহারকারী যাচাই করার অনুমতি নেই</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">লোড হচ্ছে...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            ব্যবহারকারী যাচাই ও ব্যবস্থাপনা
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.uid} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.displayName || user.email}</h3>
                        <Badge variant={user.approved ? 'default' : 'secondary'}>
                          {user.approved ? 'যাচাইকৃত' : 'অযাচাইকৃত'}
                        </Badge>
                        <Badge variant="outline">
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      
                      {/* Location Information */}
                      {(user as any).locationHierarchy && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {(user as any).locationHierarchy.division && `${(user as any).locationHierarchy.division}`}
                            {(user as any).locationHierarchy.district && ` → ${(user as any).locationHierarchy.district}`}
                            {(user as any).locationHierarchy.upazila && ` → ${(user as any).locationHierarchy.upazila}`}
                            {(user as any).locationHierarchy.union && ` → ${(user as any).locationHierarchy.union}`}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        <p>যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}</p>
                        {user.lastLogin && (
                          <p>শেষ লগইন: {new Date(user.lastLogin).toLocaleDateString('bn-BD')}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canVerifyRole(userProfile.role, user.role) && (
                        <>
                          {!user.approved && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyUser(user.uid, true)}
                              disabled={verifyUserMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              অনুমোদন
                            </Button>
                          )}
                          
                          {user.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user.uid, false)}
                              disabled={verifyUserMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              বাতিল
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                মুছুন
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ব্যবহারকারী মুছে ফেলুন</AlertDialogTitle>
                                <AlertDialogDescription>
                                  আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.uid)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  মুছে ফেলুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
