import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDataAccess } from '@/contexts/DataAccessContext';
import { User } from '@/lib/types';
import { getRolePermissions, getRoleDisplayName } from '@/lib/rbac';
import { CheckCircle, XCircle, UserCheck, MapPin, Settings, Eye, EyeOff } from 'lucide-react';
import { getFullLocationHierarchy, loadLocationData, getVillagesByUnion } from '@/lib/locationUtils';
import { useLocationData } from '@/hooks/useLocationData';
import { UserRole } from '@/lib/types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { setDoc } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const PAGE_SIZE = 30;

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
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [selectedLocation, setSelectedLocation] = useState({
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    village_id: ''
  });

  const permissions = getRolePermissions(currentUserProfile.role);
  const availableRoles = permissions.canAssignRoles as UserRole[];
  const {
    locationData,
    loading,
    getFilteredDistricts,
    getFilteredUpazilas,
    getFilteredUnions,
    getFilteredVillages,
    getLocationNames,
  } = useLocationData();

  // Reset location when dialog opens/closes or role changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRole('');
      setSelectedLocation({
        division_id: '',
        district_id: '',
        upazila_id: '',
        union_id: '',
        village_id: ''
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRole) {
      setSelectedLocation({
        division_id: '',
        district_id: '',
        upazila_id: '',
        union_id: '',
        village_id: ''
      });
    }
  }, [selectedRole]);

  // Handle location change and reset dependent fields
  const handleLocationChange = (field: keyof typeof selectedLocation, value: string) => {
    setSelectedLocation(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'division_id') {
        updated.district_id = '';
        updated.upazila_id = '';
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'district_id') {
        updated.upazila_id = '';
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'upazila_id') {
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'union_id') {
        updated.village_id = '';
      }
      return updated;
    });
  };

  // Validate before submit based on role requirements
  const isValid = () => {
    if (!selectedRole) return false;
    
    // All roles except super_admin require location scope
    if (selectedRole === 'super_admin') return true;
    
    // Check required fields based on role
    const hasRequiredDivision = !!selectedLocation.division_id;
    const hasRequiredDistrict = !!selectedLocation.district_id;
    const hasRequiredUpazila = !!selectedLocation.upazila_id;
    const hasRequiredUnion = !!selectedLocation.union_id;
    const hasRequiredVillage = !!selectedLocation.village_id;

    switch (selectedRole) {
      case 'division_admin':
        return hasRequiredDivision;
      case 'district_admin':
        return hasRequiredDivision && hasRequiredDistrict;
      case 'upazila_admin':
        return hasRequiredDivision && hasRequiredDistrict && hasRequiredUpazila;
      case 'union_admin':
        return hasRequiredDivision && hasRequiredDistrict && hasRequiredUpazila && hasRequiredUnion;
      case 'village_admin':
        return hasRequiredDivision && hasRequiredDistrict && hasRequiredUpazila && hasRequiredUnion && hasRequiredVillage;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedRole || !isValid()) {
      toast.error('সব প্রয়োজনীয় ফিল্ড পূরণ করুন');
      return;
    }

    const locationNames = getLocationNames(selectedLocation);
    const accessScope = {
      ...selectedLocation,
      ...locationNames,
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
    setSelectedRole('');
    setSelectedLocation({
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: ''
    });
  };

  // Get current selection preview
  const getSelectionPreview = () => {
    if (!selectedRole) return null;

    const locationNames = getLocationNames(selectedLocation);
    const location = Object.values(locationNames).join(' → ') || 'কোনো অবস্থান নির্বাচিত নয়';
    const isComplete = isValid();

    return {
      role: getRoleDisplayName(selectedRole),
      location,
      isComplete
    };
  };

  const preview = getSelectionPreview();

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
          <Alert>
            <AlertDescription>
              <strong>গুরুত্বপূর্ণ:</strong> সব অ্যাডমিনের জন্য লোকেশন স্কোপ আবশ্যক। লোকেশন ছাড়া কোনো ভূমিকা বরাদ্দ করা যাবে না।
            </AlertDescription>
          </Alert>

          <div>
            <Label>ভূমিকা নির্বাচন করুন *</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
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

          {/* Location Selection - Required for all roles except super_admin */}
          {selectedRole && selectedRole !== 'super_admin' && (
            <div className="space-y-3">
              <div>
                <Label>বিভাগ *</Label>
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
                        {division.bn_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(selectedRole === 'district_admin' || selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>জেলা *</Label>
                  <Select
                    value={selectedLocation.district_id}
                    onValueChange={(value) => handleLocationChange('district_id', value)}
                    disabled={!selectedLocation.division_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.division_id ? "প্রথমে বিভাগ নির্বাচন করুন" : "জেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredDistricts(selectedLocation.division_id).map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'upazila_admin' || selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>উপজেলা *</Label>
                  <Select
                    value={selectedLocation.upazila_id}
                    onValueChange={(value) => handleLocationChange('upazila_id', value)}
                    disabled={!selectedLocation.district_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.district_id ? "প্রথমে জেলা নির্বাচন করুন" : "উপজেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredUpazilas(selectedLocation.district_id).map(upazila => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedRole === 'union_admin' || selectedRole === 'village_admin') && (
                <div>
                  <Label>ইউনিয়ন *</Label>
                  <Select
                    value={selectedLocation.union_id}
                    onValueChange={(value) => handleLocationChange('union_id', value)}
                    disabled={!selectedLocation.upazila_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedLocation.upazila_id ? "প্রথমে উপজেলা নির্বাচন করুন" : "ইউনিয়ন নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredUnions(selectedLocation.upazila_id).map(union => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.bn_name}
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
                      {getFilteredVillages(selectedLocation.union_id).map(village => (
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

          {/* Preview */}
          {preview && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">নির্বাচন প্রিভিউ:</h4>
              <p className="text-sm text-gray-600 mb-1">
                <strong>ভূমিকা:</strong> {preview.role}
              </p>
              <p className="text-sm text-gray-600">
                <strong>অবস্থান:</strong> {preview.location}
              </p>
              {!preview.isComplete && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ সব প্রয়োজনীয় ফিল্ড পূরণ করুন
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              বাতিল
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid() || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper to get location names from IDs using location data
function getLocationNamesFromIds({ division_id, district_id, upazila_id, union_id, village_id }, locationData) {
  const division = locationData.divisions.find(d => d.id === division_id);
  const district = locationData.districts.find(d => d.id === district_id);
  const upazila = locationData.upazilas.find(u => u.id === upazila_id);
  const union = locationData.unions.find(u => u.id === union_id);
  const village = locationData.villages.find(v => v.id === village_id);
  return {
    division_name: division?.name || '',
    district_name: district?.name || '',
    upazila_name: upazila?.name || '',
    union_name: union?.name || '',
    village_name: village?.name || '',
  };
}

const UserRow = React.memo(({ index, style, data }: ListChildComponentProps) => {
  const { users, permissions, handleUpdateUser, handleVerifyUser, userProfile } = data;
  const user = users[index];
  return (
    <div style={style}>
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
            {!user.approved && permissions.canVerifyUsers && (
              <Button
                size="sm"
                onClick={() => handleVerifyUser(user.uid, true)}
                className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                যাচাই করুন
              </Button>
            )}
            {user.approved && permissions.canVerifyUsers && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVerifyUser(user.uid, false)}
                className="h-7 px-2 text-xs border-red-500 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-3 h-3 mr-1" />
                বাতিল করুন
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const UserManagement = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const { 
    getAccessibleUsers, 
    canManageUser, 
    canAssignRole,
    accessScope,
    canAccessAllData 
  } = useDataAccess();
  
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [users, setUsers] = useState<User[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users with role-based filtering
  const fetchUsers = useCallback(async (afterDoc?: QueryDocumentSnapshot<DocumentData> | null, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
      if (afterDoc) {
        q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(afterDoc), limit(PAGE_SIZE));
      }
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
      
      // Apply role-based filtering
      const accessibleUsers = getAccessibleUsers(docs);
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setUsers(prev => append ? [...prev, ...accessibleUsers] : accessibleUsers);
    } catch (err: any) {
      setError('ব্যবহারকারী ডেটা আনতে সমস্যা হয়েছে।');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessibleUsers]);

  useEffect(() => {
    fetchUsers();
  }, [refreshKey, fetchUsers]);

  // Debounced search filter
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    let filtered = users;
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [users, debouncedSearchTerm]);

  // Batch update mutation for multi-user actions
  const batchUpdateUsers = useMutation({
    mutationFn: async (updates: { userId: string; updates: Partial<User> }[]) => {
      const batch = writeBatch(db);
      updates.forEach(({ userId, updates }) => {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { ...updates, lastUpdated: new Date().toISOString() });
      });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'সফল', description: 'একাধিক ব্যবহারকারী আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: 'ব্যাচ আপডেট করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  // Single user update mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<User> }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { ...updates, lastUpdated: new Date().toISOString() });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'সফল', description: 'ব্যবহারকারী আপডেট হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: 'আপডেট করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { approved, verifiedBy: userProfile?.uid, lastUpdated: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'সফল', description: 'ব্যবহারকারী যাচাই সম্পন্ন হয়েছে' });
    },
    onError: (error) => {
      toast({ title: 'ত্রুটি', description: 'যাচাই করতে সমস্যা হয়েছে', variant: 'destructive' });
    },
  });

  const handleVerifyUser = (userId: string, approved: boolean) => {
    verifyUserMutation.mutate({ userId, approved });
  };

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    updateUserMutation.mutate({ userId, updates });
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && lastDoc) {
      fetchUsers(lastDoc, true);
    }
  }, [hasMore, lastDoc, fetchUsers]);

  const permissions = useMemo(() => {
    if (!userProfile?.role) return { canAssignRoles: [], canVerifyUsers: false };
    return getRolePermissions(userProfile.role);
  }, [userProfile]);

  // Enhanced validation for user assignment
  const canAssignToUser = useCallback((targetUser: User) => {
    if (!userProfile) return false;
    
    // Check if user has location scope (required for all assignments)
    if (!targetUser.accessScope || Object.keys(targetUser.accessScope).length === 0) {
      return false;
    }

    return canManageUser(targetUser);
  }, [userProfile]);

  if (!canAccessAllData && !canAssignRole('village_admin')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500 mb-2">আপনার ব্যবহারকারী যাচাই করার অনুমতি নেই</p>
            <div className="text-sm text-gray-400">
              <p>আপনার এক্সেস স্কোপ: {accessScope.division_name || accessScope.district_name || accessScope.upazila_name || accessScope.union_name || accessScope.village_name || 'সীমিত'}</p>
            </div>
          </div>
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            ব্যবহারকারী যাচাই ও ভূমিকা বরাদ্দ
          </CardTitle>
          <div className="flex items-center gap-4">
            <Input
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            {!canAccessAllData && (
              <Badge variant="outline" className="text-xs">
                {accessScope.division_name && `বিভাগ: ${accessScope.division_name}`}
                {accessScope.district_name && `জেলা: ${accessScope.district_name}`}
                {accessScope.upazila_name && `উপজেলা: ${accessScope.upazila_name}`}
                {accessScope.union_name && `ইউনিয়ন: ${accessScope.union_name}`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              <strong>নিয়ম:</strong> সব ব্যবহারকারীর অবশ্যই লোকেশন স্কোপ থাকতে হবে। লোকেশন স্কোপ ছাড়া কোনো ভূমিকা বরাদ্দ করা যাবে না।
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                আপনার এক্সেস স্কোপে কোনো ব্যবহারকারী পাওয়া যায়নি
              </p>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  মোট ব্যবহারকারী: {filteredUsers.length}
                </div>
                <List
                  height={600}
                  itemCount={filteredUsers.length}
                  itemSize={140}
                  width="100%"
                  itemData={{ 
                    users: filteredUsers, 
                    permissions, 
                    handleUpdateUser, 
                    handleVerifyUser, 
                    userProfile 
                  }}
                >
                  {UserRow}
                </List>
              </>
            )}
            {hasMore && !isLoading && (
              <div className="flex justify-center mt-4">
                <Button onClick={handleLoadMore} variant="outline">আরো লোড করুন</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
