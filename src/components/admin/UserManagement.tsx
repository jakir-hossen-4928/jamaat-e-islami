import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';
import { getRolePermissions, getRoleDisplayName } from '@/lib/rbac';
import { CheckCircle, XCircle, UserCheck, MapPin, Settings } from 'lucide-react';
import { getFullLocationHierarchy, loadLocationData, getVillagesByUnion } from '@/lib/locationUtils';

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
  const [selectedRole, setSelectedRole] = useState<User['role'] | ''>('');
  const [locationData, setLocationData] = useState({
    divisions: [] as any[],
    districts: [] as any[],
    upazilas: [] as any[],
    unions: [] as any[],
    villages: [] as any[]
  });
  const [selectedLocation, setSelectedLocation] = useState({
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    village_id: ''
  });

  const permissions = getRolePermissions(currentUserProfile.role);
  const availableRoles = permissions.canAssignRoles;

  React.useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const data = await loadLocationData();
          setLocationData({
            divisions: data.divisions,
            districts: data.districts,
            upazilas: data.upazilas,
            unions: data.unions,
            villages: data.villages
          });
        } catch (error) {
          console.error('Error loading location data:', error);
        }
      };
      loadData();
    }
  }, [isOpen]);

  // Filtered lists for dropdowns based on parent selection
  const filteredDistricts = locationData.districts.filter(
    d => selectedLocation.division_id ? d.division_id === selectedLocation.division_id : true
  );
  const filteredUpazilas = locationData.upazilas.filter(
    u => selectedLocation.district_id ? u.district_id === selectedLocation.district_id : true
  );
  const filteredUnions = locationData.unions.filter(
    u => selectedLocation.upazila_id ? u.upazilla_id === selectedLocation.upazila_id : true
  );
  const filteredVillages = locationData.villages.filter(
    v => selectedLocation.union_id ? v.union_id.toString() === selectedLocation.union_id : true
  ).map((village, index) => ({
    id: `village_${village.union_id}_${index}`,
    name: village.village,
    bn_name: village.village,
    union_id: village.union_id
  }));

  const handleLocationChange = async (level: string, value: string) => {
    const newLocation = { ...selectedLocation };

    // Set the selected value
    newLocation[level as keyof typeof selectedLocation] = value;

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
    // Reset location when role changes
    setSelectedLocation({
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: ''
    });
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    const division = locationData.divisions.find(d => d.id === selectedLocation.division_id);
    const district = locationData.districts.find(d => d.id === selectedLocation.district_id);
    const upazila = locationData.upazilas.find(d => d.id === selectedLocation.upazila_id);
    const union = locationData.unions.find(d => d.id === selectedLocation.union_id);
    const village = filteredVillages.find(v => v.id === selectedLocation.village_id);

    const accessScope = {
      ...(selectedLocation.division_id && { division_id: selectedLocation.division_id }),
      ...(selectedLocation.district_id && { district_id: selectedLocation.district_id }),
      ...(selectedLocation.upazila_id && { upazila_id: selectedLocation.upazila_id }),
      ...(selectedLocation.union_id && { union_id: selectedLocation.union_id }),
      ...(selectedLocation.village_id && { village_id: selectedLocation.village_id }),
      ...(division?.bn_name && { division_name: division.bn_name }),
      ...(district?.bn_name && { district_name: district.bn_name }),
      ...(upazila?.bn_name && { upazila_name: upazila_name }),
      ...(union?.bn_name && { union_name: union_name }),
      ...(village?.bn_name && { village_name: village.bn_name })
    };

    const updates: Partial<User> = {
      role: selectedRole,
      approved: true,
      accessScope,
      assignedBy: currentUserProfile.uid,
      verifiedBy: currentUserProfile.uid
    };

    onUpdate(user.uid, updates);
    setIsOpen(false);
    // Reset form
    setSelectedRole('');
    setSelectedLocation({
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: ''
    });
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
    if (!selectedRole) return false;

    const requiredLocation = getLocationRequirement(selectedRole);
    if (!requiredLocation) return true; // super_admin doesn't need location
    return selectedLocation[requiredLocation as keyof typeof selectedLocation];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
          <Settings className="w-3 h-3 mr-1" />
          ভূমিকা বরাদ্দ করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ব্যবহারকারী ভূমিকা বরাদ্দ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>ভূমিকা নির্বাচন করুন *</Label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
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

          {selectedRole && selectedRole !== 'super_admin' && (
            <div className="space-y-3">
              <div>
                <Label>বিভাগ {getLocationRequirement(selectedRole) === 'division_id' && '*'}</Label>
                <Select
                  value={selectedLocation.division_id}
                  onValueChange={(value) => handleLocationChange('division_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationData.divisions.map(division => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.bn_name} ({division.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedRole === 'district_admin' || selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>জেলা {getLocationRequirement(selectedRole) === 'district_id' && '*'}</Label>
                  <Select
                    value={selectedLocation.district_id}
                    onValueChange={(value) => handleLocationChange('district_id', value)}
                    disabled={!selectedLocation.division_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.division_id ? "প্রথমে বিভাগ নির্বাচন করুন" : "জেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDistricts.map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.bn_name} ({district.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>উপজেলা {getLocationRequirement(selectedRole) === 'upazila_id' && '*'}</Label>
                  <Select
                    value={selectedLocation.upazila_id}
                    onValueChange={(value) => handleLocationChange('upazila_id', value)}
                    disabled={!selectedLocation.district_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.district_id ? "প্রথমে জেলা নির্বাচন করুন" : "উপজেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUpazilas.map(upazila => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.bn_name} ({upazila.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>ইউনিয়ন {getLocationRequirement(selectedRole) === 'union_id' && '*'}</Label>
                  <Select
                    value={selectedLocation.union_id}
                    onValueChange={(value) => handleLocationChange('union_id', value)}
                    disabled={!selectedLocation.upazila_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.upazila_id ? "প্রথমে উপজেলা নির্বাচন করুন" : "ইউনিয়ন নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUnions.map(union => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.bn_name} ({union.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedRole === 'village_admin' && (
                <div>
                  <Label>গ্রাম *</Label>
                  <Select
                    value={selectedLocation.village_id}
                    onValueChange={(value) => handleLocationChange('village_id', value)}
                    disabled={!selectedLocation.union_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.union_id ? "প্রথমে ইউনিয়ন নির্বাচন করুন" : "গ্রাম নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVillages.map(village => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.bn_name}
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
              ভূমিকা বরাদ্দ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UserManagement = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users ordered by creation date (newest first)
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users', refreshKey],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
    },
    staleTime: 5 * 60 * 1000,
  });

  // For super admin, show all users. For others, filter by location scope
  const filteredUsers = React.useMemo(() => {
    if (!userProfile) return [];

    if (userProfile.role === 'super_admin') {
      return allUsers;
    }

    return allUsers.filter(user => {
      if (!user.accessScope || !userProfile.accessScope) return false;

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

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });

      if (variables.updates.role) {
        toast({
          title: 'সফল',
          description: 'ব্যবহারকারীর ভূমিকা বরাদ্দ হয়েছে এবং অনুমোদিত হয়েছে',
        });
      } else {
        toast({
          title: 'সফল',
          description: 'ব্যবহারকারী আপডেট হয়েছে',
        });
      }
    },
    onError: (error) => {
      console.error('User update error:', error);
      toast({
        title: 'ত্রুটি',
        description: 'আপডেট করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  // Simple verify user mutation for basic approval
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
      console.error('User verification error:', error);
      toast({
        title: 'ত্রুটি',
        description: 'যাচাই করতে সমস্যা হয়েছে',
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
            ব্যবহারকারী যাচাই ও ভূমিকা বরাদ্দ
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
                        {user.role && (
                          <Badge variant="outline">
                            {getRoleDisplayName(user.role)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>

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
                      {permissions.canAssignRoles.length > 0 && (
                        <UserAssignmentDialog
                          user={user}
                          onUpdate={handleUpdateUser}
                          currentUserProfile={userProfile}
                        />
                      )}

                      {!user.role && userProfile.role === 'super_admin' && (
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
