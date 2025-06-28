import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';
import { getRolePermissions, getRoleDisplayName, canVerifyRole } from '@/lib/rbac';
import { CheckCircle, XCircle, Trash2, UserCheck, MapPin, Settings } from 'lucide-react';

// Local cache for location data
const locationCache = {
  divisions: null as any[] | null,
  districts: null as any[] | null,
  upazilas: null as any[] | null,
  unions: null as any[] | null,
  villages: null as any[] | null,
};

// Load location data with caching
const loadLocationData = async (type: string) => {
  if (locationCache[type as keyof typeof locationCache]) {
    return locationCache[type as keyof typeof locationCache];
  }
  
  try {
    const response = await fetch(`/data/${type}.json`);
    const data = await response.json();
    locationCache[type as keyof typeof locationCache] = data;
    return data;
  } catch (error) {
    console.error(`Error loading ${type}:`, error);
    return [];
  }
};

const UserAssignmentDialog = ({ 
  user, 
  onUpdate, 
  currentUserProfile 
}: { 
  user: User; 
  onUpdate: (userId: string, updates: Partial<User>) => void;
  currentUserProfile: User;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<User['role']>(user.role);
  const [locationData, setLocationData] = useState({
    divisions: [] as any[],
    districts: [] as any[],
    upazilas: [] as any[],
    unions: [] as any[],
    villages: [] as any[]
  });
  const [selectedLocation, setSelectedLocation] = useState({
    division_id: user.accessScope.division_id || '',
    district_id: user.accessScope.district_id || '',
    upazila_id: user.accessScope.upazila_id || '',
    union_id: user.accessScope.union_id || '',
    village_id: user.accessScope.village_id || ''
  });

  const permissions = getRolePermissions(currentUserProfile.role);
  const availableRoles = permissions.canAssignRoles;

  React.useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [divisions, districts, upazilas, unions, villages] = await Promise.all([
          loadLocationData('divisions'),
          loadLocationData('districts'),
          loadLocationData('upazilas'),
          loadLocationData('unions'),
          loadLocationData('villages')
        ]);
        
        setLocationData({ divisions, districts, upazilas, unions, villages });
      };
      loadData();
    }
  }, [isOpen]);

  const filteredDistricts = locationData.districts.filter(d => 
    !selectedLocation.division_id || d.division_id === selectedLocation.division_id
  );

  const filteredUpazilas = locationData.upazilas.filter(u => 
    !selectedLocation.district_id || u.district_id === selectedLocation.district_id
  );

  const filteredUnions = locationData.unions.filter(u => 
    !selectedLocation.upazila_id || u.upazilla_id === selectedLocation.upazila_id
  );

  const filteredVillages = locationData.villages.filter(v => 
    !selectedLocation.union_id || v.union_id === selectedLocation.union_id
  );

  const handleLocationChange = (level: string, value: string) => {
    const newLocation = { ...selectedLocation, [level]: value };
    
    // Clear dependent fields
    if (level === 'division_id') {
      newLocation.district_id = '';
      newLocation.upazila_id = '';
      newLocation.union_id = '';
      newLocation.village_id = '';
    } else if (level === 'district_id') {
      newLocation.upazila_id = '';
      newLocation.union_id = '';
      newLocation.village_id = '';
    } else if (level === 'upazila_id') {
      newLocation.union_id = '';
      newLocation.village_id = '';
    } else if (level === 'union_id') {
      newLocation.village_id = '';
    }
    
    setSelectedLocation(newLocation);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as User['role']);
  };

  const handleSubmit = () => {
    const division = locationData.divisions.find(d => d.id === selectedLocation.division_id);
    const district = locationData.districts.find(d => d.id === selectedLocation.district_id);
    const upazila = locationData.upazilas.find(u => u.id === selectedLocation.upazila_id);
    const union = locationData.unions.find(u => u.id === selectedLocation.union_id);
    const village = locationData.villages.find(v => v.id === selectedLocation.village_id);

    const updates: Partial<User> = {
      role: selectedRole,
      accessScope: {
        division_id: selectedLocation.division_id || undefined,
        district_id: selectedLocation.district_id || undefined,
        upazila_id: selectedLocation.upazila_id || undefined,
        union_id: selectedLocation.union_id || undefined,
        village_id: selectedLocation.village_id || undefined,
        division_name: division?.name,
        district_name: district?.name,
        upazila_name: upazila?.name,
        union_name: union?.name,
        village_name: village?.name
      },
      assignedBy: currentUserProfile.uid
    };

    onUpdate(user.uid, updates);
    setIsOpen(false);
  };

  const getLocationRequirement = (role: string) => {
    switch (role) {
      case 'division_admin': return 'division_id';
      case 'district_admin': return 'district_id';
      case 'upazila_admin': return 'upazila_id';
      case 'union_admin': return 'union_id';
      case 'village_admin': return 'village_id';
      default: return null;
    }
  };

  const isValidAssignment = () => {
    const requiredLocation = getLocationRequirement(selectedRole);
    if (!requiredLocation) return true;
    return selectedLocation[requiredLocation as keyof typeof selectedLocation];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
          <Settings className="w-3 h-3 mr-1" />
          বরাদ্দ করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ব্যবহারকারী বরাদ্দ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>ভূমিকা নির্বাচন করুন</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole !== 'super_admin' && (
            <div className="space-y-3">
              <div>
                <Label>বিভাগ</Label>
                <Select value={selectedLocation.division_id} onValueChange={(value) => handleLocationChange('division_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.divisions.map(division => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedRole === 'district_admin' || selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>জেলা</Label>
                  <Select value={selectedLocation.district_id} onValueChange={(value) => handleLocationChange('district_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDistricts.map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>উপজেলা</Label>
                  <Select value={selectedLocation.upazila_id} onValueChange={(value) => handleLocationChange('upazila_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUpazilas.map(upazila => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>ইউনিয়ন</Label>
                  <Select value={selectedLocation.union_id} onValueChange={(value) => handleLocationChange('union_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUnions.map(union => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedRole === 'village_admin' && (
                <div>
                  <Label>গ্রাম</Label>
                  <Select value={selectedLocation.village_id} onValueChange={(value) => handleLocationChange('village_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="গ্রাম নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVillages.map(village => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              বাতিল
            </Button>
            <Button onClick={handleSubmit} disabled={!isValidAssignment()}>
              বরাদ্দ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users (for super admin) or filtered users (for other roles)
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as User));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter users based on current user's role and access scope
  const filteredUsers = React.useMemo(() => {
    if (!userProfile) return [];
    
    if (userProfile.role === 'super_admin') {
      return allUsers; // Super admin sees all users
    }

    // Other admins see users in their scope and users they can assign
    return allUsers.filter(user => {
      const userScope = userProfile.accessScope;
      const targetScope = user.accessScope;

      switch (userProfile.role) {
        case 'division_admin':
          return targetScope.division_id === userScope.division_id;
        case 'district_admin':
          return targetScope.district_id === userScope.district_id;
        case 'upazila_admin':
          return targetScope.upazila_id === userScope.upazila_id;
        case 'union_admin':
          return targetScope.union_id === userScope.union_id;
        default:
          return false;
      }
    });
  }, [allUsers, userProfile]);

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
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'যাচাই করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'সফল',
        description: 'ব্যবহারকারী আপডেট হয়েছে',
      });
    },
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'আপডেট করতে সমস্যা হয়েছে',
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
    onError: () => {
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

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    updateUserMutation.mutate({ userId, updates });
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
                      {user.accessScope && user.role !== 'super_admin' && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {user.accessScope.division_name && `${user.accessScope.division_name}`}
                            {user.accessScope.district_name && ` → ${user.accessScope.district_name}`}
                            {user.accessScope.upazila_name && ` → ${user.accessScope.upazila_name}`}
                            {user.accessScope.union_name && ` → ${user.accessScope.union_name}`}
                            {user.accessScope.village_name && ` → ${user.accessScope.village_name}`}
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
                              className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              অনুমোদন
                            </Button>
                          )}
                          
                          {user.approved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyUser(user.uid, false)}
                              disabled={verifyUserMutation.isPending}
                              className="h-7 px-2 text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              বাতিল
                            </Button>
                          )}

                          <UserAssignmentDialog
                            user={user}
                            onUpdate={handleUpdateUser}
                            currentUserProfile={userProfile}
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deleteUserMutation.isPending}
                                className="h-7 px-2 text-xs"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                মুছে ফেলুন
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
