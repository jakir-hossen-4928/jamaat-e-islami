
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, Users, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';
import { User } from '@/lib/types';

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

const LocationManagement = () => {
  usePageTitle('এলাকা ব্যবস্থাপনা - অ্যাডমিন প্যানেল');
  
  const [locationData, setLocationData] = useState({
    divisions: [] as any[],
    districts: [] as any[],
    upazilas: [] as any[],
    unions: [] as any[],
    villages: [] as any[]
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">এলাকা ব্যবস্থাপনা</h1>
          <p className="mt-2 text-blue-100">প্রশাসনিক এলাকা ও ব্যবহারকারী বরাদ্দ</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-blue-700">{stats.totalDivisions}</div>
              <div className="text-xs text-blue-600">মোট বিভাগ</div>
              <div className="text-xs text-green-600">{stats.assignedDivisions} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-700">{stats.totalDistricts}</div>
              <div className="text-xs text-green-600">মোট জেলা</div>
              <div className="text-xs text-blue-600">{stats.assignedDistricts} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-purple-700">{stats.totalUpazilas}</div>
              <div className="text-xs text-purple-600">মোট উপজেলা</div>
              <div className="text-xs text-blue-600">{stats.assignedUpazilas} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-orange-700">{stats.totalUnions}</div>
              <div className="text-xs text-orange-600">মোট ইউনিয়ন</div>
              <div className="text-xs text-blue-600">{stats.assignedUnions} বরাদ্দকৃত</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-700">{stats.totalVillages}</div>
              <div className="text-xs text-red-600">মোট গ্রাম</div>
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
                <CardTitle>জেলা তালিকা</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.districts.slice(0, 20).map(district => {
                    const assignedUser = users.find(u => u.accessScope?.district_id === district.id);
                    return (
                      <div key={district.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{district.name}</h3>
                        <p className="text-sm text-gray-600">{district.bn_name}</p>
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
                {locationData.districts.length > 20 && (
                  <p className="text-center text-gray-500 mt-4">আরও {locationData.districts.length - 20}টি জেলা...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upazilas">
            <Card>
              <CardHeader>
                <CardTitle>উপজেলা তালিকা (প্রথম ২০টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.upazilas.slice(0, 20).map(upazila => {
                    const assignedUser = users.find(u => u.accessScope?.upazila_id === upazila.id);
                    return (
                      <div key={upazila.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{upazila.name}</h3>
                        <p className="text-sm text-gray-600">{upazila.bn_name}</p>
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
                <p className="text-center text-gray-500 mt-4">মোট {locationData.upazilas.length}টি উপজেলা</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unions">
            <Card>
              <CardHeader>
                <CardTitle>ইউনিয়ন তালিকা (প্রথম ২০টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.unions.slice(0, 20).map(union => {
                    const assignedUser = users.find(u => u.accessScope?.union_id === union.id);
                    return (
                      <div key={union.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{union.name}</h3>
                        <p className="text-sm text-gray-600">{union.bn_name}</p>
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
                <p className="text-center text-gray-500 mt-4">মোট {locationData.unions.length}টি ইউনিয়ন</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="villages">
            <Card>
              <CardHeader>
                <CardTitle>গ্রাম তালিকা (প্রথম ২০টি)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locationData.villages.slice(0, 20).map(village => {
                    const assignedUser = users.find(u => u.accessScope?.village_id === village.id);
                    return (
                      <div key={village.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{village.name}</h3>
                        <p className="text-sm text-gray-600">{village.bn_name}</p>
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
                <p className="text-center text-gray-500 mt-4">মোট {locationData.villages.length}টি গ্রাম</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default LocationManagement;
