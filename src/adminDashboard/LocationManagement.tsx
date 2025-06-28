
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building, Users, BarChart3, Plus, Download } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';
import { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Location cache
const locationCache = {
  divisions: null as any[] | null,
  districts: null as any[] | null,
  upazilas: null as any[] | null,
  unions: null as any[] | null,
  villages: null as any[] | null,
};

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

const VillageBuilderDialog = ({ locationData }: { locationData: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newVillage, setNewVillage] = useState({
    name: '',
    bn_name: '',
    union_id: '',
    upazila_id: '',
    district_id: '',
    division_id: ''
  });
  const { toast } = useToast();

  const handleLocationChange = (level: string, value: string) => {
    const updated = { ...newVillage, [level]: value };
    
    // Auto-fill parent locations
    if (level === 'union_id') {
      const union = locationData.unions.find((u: any) => u.id === value);
      if (union) {
        updated.upazila_id = union.upazilla_id;
        const upazila = locationData.upazilas.find((u: any) => u.id === union.upazilla_id);
        if (upazila) {
          updated.district_id = upazila.district_id;
          const district = locationData.districts.find((d: any) => d.id === upazila.district_id);
          if (district) {
            updated.division_id = district.division_id;
          }
        }
      }
    }
    
    setNewVillage(updated);
  };

  const handleAddVillage = () => {
    if (!newVillage.name || !newVillage.bn_name || !newVillage.union_id) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল প্রয়োজনীয় তথ্য পূরণ করুন',
        variant: 'destructive',
      });
      return;
    }

    // Add to local cache
    const newVillageData = {
      id: `village_${Date.now()}`,
      ...newVillage
    };

    if (locationCache.villages) {
      locationCache.villages.push(newVillageData);
    }

    toast({
      title: 'সফল',
      description: 'নতুন গ্রাম যোগ করা হয়েছে',
    });

    // Reset form
    setNewVillage({
      name: '',
      bn_name: '',
      union_id: '',
      upazila_id: '',
      district_id: '',
      division_id: ''
    });
    setIsOpen(false);
  };

  const downloadVillagesJSON = () => {
    const dataStr = JSON.stringify(locationCache.villages || [], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'villages.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredUnions = locationData.unions.filter((u: any) => 
    !newVillage.upazila_id || u.upazilla_id === newVillage.upazila_id
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          নতুন গ্রাম যোগ করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন গ্রাম তৈরি করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>গ্রামের নাম (ইংরেজি) *</Label>
            <Input
              value={newVillage.name}
              onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
              placeholder="Village name in English"
            />
          </div>
          <div>
            <Label>গ্রামের নাম (বাংলা) *</Label>
            <Input
              value={newVillage.bn_name}
              onChange={(e) => setNewVillage({ ...newVillage, bn_name: e.target.value })}
              placeholder="গ্রামের নাম বাংলায়"
            />
          </div>
          <div>
            <Label>ইউনিয়ন *</Label>
            <Select value={newVillage.union_id} onValueChange={(value) => handleLocationChange('union_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {filteredUnions.map((union: any) => (
                  <SelectItem key={union.id} value={union.id}>
                    {union.name} ({union.bn_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={downloadVillagesJSON}>
              <Download className="w-4 h-4 mr-2" />
              villages.json ডাউনলোড
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleAddVillage}>
                যোগ করুন
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LocationManagement = () => {
  usePageTitle('এলাকা ব্যবস্থাপনা - অ্যাডমিন প্যানেল');
  
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
    union_id: ''
  });

  // Load all location data
  React.useEffect(() => {
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
  }, []);

  // Fetch users to show location assignments
  const { data: users = [] } = useQuery({
    queryKey: ['users-location'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as User));
    }
  });

  const getLocationStats = () => {
    const stats = {
      totalDivisions: locationData.divisions.length,
      totalDistricts: locationData.districts.length,
      totalUpazilas: locationData.upazilas.length,
      totalUnions: locationData.unions.length,
      totalVillages: locationData.villages.length,
      assignedDivisions: new Set(users.map(u => u.accessScope?.division_id).filter(Boolean)).size,
      assignedDistricts: new Set(users.map(u => u.accessScope?.district_id).filter(Boolean)).size,
      assignedUpazilas: new Set(users.map(u => u.accessScope?.upazila_id).filter(Boolean)).size,
      assignedUnions: new Set(users.map(u => u.accessScope?.union_id).filter(Boolean)).size,
      assignedVillages: new Set(users.map(u => u.accessScope?.village_id).filter(Boolean)).size
    };
    return stats;
  };

  const stats = getLocationStats();

  // Filter data based on selection
  const getFilteredData = () => {
    let filteredDistricts = locationData.districts;
    let filteredUpazilas = locationData.upazilas;
    let filteredUnions = locationData.unions;
    let filteredVillages = locationData.villages;

    if (selectedLocation.division_id) {
      filteredDistricts = locationData.districts.filter(d => d.division_id === selectedLocation.division_id);
    }
    if (selectedLocation.district_id) {
      filteredUpazilas = locationData.upazilas.filter(u => u.district_id === selectedLocation.district_id);
    }
    if (selectedLocation.upazila_id) {
      filteredUnions = locationData.unions.filter(u => u.upazilla_id === selectedLocation.upazila_id);
    }
    if (selectedLocation.union_id) {
      filteredVillages = locationData.villages.filter(v => v.union_id === selectedLocation.union_id);
    }

    return { filteredDistricts, filteredUpazilas, filteredUnions, filteredVillages };
  };

  const { filteredDistricts, filteredUpazilas, filteredUnions, filteredVillages } = getFilteredData();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">এলাকা ব্যবস্থাপনা</h1>
              <p className="mt-2 text-blue-100">প্রশাসনিক এলাকা ও ব্যবহারকারী বরাদ্দ</p>
            </div>
            <VillageBuilderDialog locationData={locationData} />
          </div>
        </div>

        {/* Location Filter */}
        <Card>
          <CardHeader>
            <CardTitle>এলাকা ফিল্টার</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>বিভাগ</Label>
                <Select value={selectedLocation.division_id} onValueChange={(value) => setSelectedLocation({ division_id: value, district_id: '', upazila_id: '', union_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব বিভাগ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব বিভাগ</SelectItem>
                    {locationData.divisions.map(division => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>জেলা</Label>
                <Select value={selectedLocation.district_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, district_id: value, upazila_id: '', union_id: '' })} disabled={!selectedLocation.division_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব জেলা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব জেলা</SelectItem>
                    {filteredDistricts.map(district => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>উপজেলা</Label>
                <Select value={selectedLocation.upazila_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, upazila_id: value, union_id: '' })} disabled={!selectedLocation.district_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব উপজেলা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব উপজেলা</SelectItem>
                    {filteredUpazilas.map(upazila => (
                      <SelectItem key={upazila.id} value={upazila.id}>
                        {upazila.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ইউনিয়ন</Label>
                <Select value={selectedLocation.union_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, union_id: value })} disabled={!selectedLocation.upazila_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব ইউনিয়ন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব ইউনিয়ন</SelectItem>
                    {filteredUnions.map(union => (
                      <SelectItem key={union.id} value={union.id}>
                        {union.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-blue-700">{selectedLocation.division_id ? filteredDistricts.length : stats.totalDivisions}</div>
              <div className="text-xs text-blue-600">{selectedLocation.division_id ? 'ফিল্টার করা বিভাগ' : 'মোট বিভাগ'}</div>
              <div className="text-xs text-green-600">{stats.assignedDivisions} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-700">{selectedLocation.division_id ? filteredDistricts.length : stats.totalDistricts}</div>
              <div className="text-xs text-green-600">{selectedLocation.division_id ? 'ফিল্টার করা জেলা' : 'মোট জেলা'}</div>
              <div className="text-xs text-blue-600">{stats.assignedDistricts} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-purple-700">{selectedLocation.district_id ? filteredUpazilas.length : stats.totalUpazilas}</div>
              <div className="text-xs text-purple-600">{selectedLocation.district_id ? 'ফিল্টার করা উপজেলা' : 'মোট উপজেলা'}</div>
              <div className="text-xs text-blue-600">{stats.assignedUpazilas} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-orange-700">{selectedLocation.upazila_id ? filteredUnions.length : stats.totalUnions}</div>
              <div className="text-xs text-orange-600">{selectedLocation.upazila_id ? 'ফিল্টার করা ইউনিয়ন' : 'মোট ইউনিয়ন'}</div>
              <div className="text-xs text-blue-600">{stats.assignedUnions} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-700">{selectedLocation.union_id ? filteredVillages.length : stats.totalVillages}</div>
              <div className="text-xs text-red-600">{selectedLocation.union_id ? 'ফিল্টার করা গ্রাম' : 'মোট গ্রাম'}</div>
              <div className="text-xs text-blue-600">{stats.assignedVillages} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-gray-700">{users.length}</div>
              <div className="text-xs text-gray-600">মোট ব্যবহারকারী</div>
              <div className="text-xs text-green-600">{users.filter(u => u.approved).length} সক্রিয়</div>
            </CardContent>
          </Card>
        </div>

        {/* Location Details */}
        <Tabs defaultValue="divisions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="divisions">বিভাগ</TabsTrigger>
            <TabsTrigger value="districts">জেলা</TabsTrigger>
            <TabsTrigger value="upazilas">উপজেলা</TabsTrigger>
            <TabsTrigger value="unions">ইউনিয়ন</TabsTrigger>
            <TabsTrigger value="villages">গ্রাম</TabsTrigger>
          </TabsList>

          <TabsContent value="divisions">
            <Card>
              <CardHeader>
                <CardTitle>বিভাগ তালিকা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.divisions.map(division => {
                    const assignedUser = users.find(u => u.accessScope?.division_id === division.id);
                    return (
                      <div key={division.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{division.name}</h3>
                        <p className="text-sm text-gray-600">{division.bn_name}</p>
                        <p className="text-xs text-gray-500">ID: {division.id}</p>
                        {assignedUser ? (
                          <Badge variant="default" className="mt-2">
                            বরাদ্দকৃত: {assignedUser.displayName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">অবরাদ্দকৃত</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="districts">
            <Card>
              <CardHeader>
                <CardTitle>জেলা তালিকা ({filteredDistricts.length}টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredDistricts.map(district => {
                    const assignedUser = users.find(u => u.accessScope?.district_id === district.id);
                    return (
                      <div key={district.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{district.name}</h3>
                        <p className="text-sm text-gray-600">{district.bn_name}</p>
                        <p className="text-xs text-gray-500">ID: {district.id}</p>
                        {assignedUser ? (
                          <Badge variant="default" className="mt-2">
                            বরাদ্দকৃত: {assignedUser.displayName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">অবরাদ্দকৃত</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upazilas">
            <Card>
              <CardHeader>
                <CardTitle>উপজেলা তালিকা ({filteredUpazilas.length}টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredUpazilas.map(upazila => {
                    const assignedUser = users.find(u => u.accessScope?.upazila_id === upazila.id);
                    return (
                      <div key={upazila.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{upazila.name}</h3>
                        <p className="text-sm text-gray-600">{upazila.bn_name}</p>
                        <p className="text-xs text-gray-500">ID: {upazila.id}</p>
                        {assignedUser ? (
                          <Badge variant="default" className="mt-2">
                            বরাদ্দকৃত: {assignedUser.displayName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">অবরাদ্দকৃত</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unions">
            <Card>
              <CardHeader>
                <CardTitle>ইউনিয়ন তালিকা ({filteredUnions.length}টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredUnions.map(union => {
                    const assignedUser = users.find(u => u.accessScope?.union_id === union.id);
                    return (
                      <div key={union.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{union.name}</h3>
                        <p className="text-sm text-gray-600">{union.bn_name}</p>
                        <p className="text-xs text-gray-500">ID: {union.id}</p>
                        {assignedUser ? (
                          <Badge variant="default" className="mt-2">
                            বরাদ্দকৃত: {assignedUser.displayName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">অবরাদ্দকৃত</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="villages">
            <Card>
              <CardHeader>
                <CardTitle>গ্রাম তালিকা ({filteredVillages.length}টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredVillages.map(village => {
                    const assignedUser = users.find(u => u.accessScope?.village_id === village.id);
                    return (
                      <div key={village.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{village.name}</h3>
                        <p className="text-sm text-gray-600">{village.bn_name}</p>
                        <p className="text-xs text-gray-500">ID: {village.id}</p>
                        {assignedUser ? (
                          <Badge variant="default" className="mt-2">
                            বরাদ্দকৃত: {assignedUser.displayName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-2">অবরাদ্দকৃত</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default LocationManagement;
