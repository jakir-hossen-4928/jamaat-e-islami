
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building, Users, BarChart3, Plus, Download, Trash2 } from 'lucide-react';
import ResponsiveSidebar from '@/components/layout/ResponsiveSidebar';
import { usePageTitle } from '@/lib/usePageTitle';
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
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}`);
    }
    const data = await response.json();
    locationCache[type as keyof typeof locationCache] = data;
    return data;
  } catch (error) {
    console.error(`Error loading ${type}:`, error);
    return [];
  }
};

// Generic Location Builder Dialog
const LocationBuilderDialog = ({ 
  type, 
  locationData, 
  onLocationAdded 
}: { 
  type: 'division' | 'district' | 'upazila' | 'union' | 'village';
  locationData: any;
  onLocationAdded: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    bn_name: '',
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    url: ''
  });
  const { toast } = useToast();

  const getTypeConfig = () => {
    switch (type) {
      case 'division':
        return {
          title: 'নতুন বিভাগ তৈরি করুন',
          fields: ['name', 'bn_name', 'url'],
          requiredFields: ['name', 'bn_name']
        };
      case 'district':
        return {
          title: 'নতুন জেলা তৈরি করুন',
          fields: ['name', 'bn_name', 'division_id', 'url'],
          requiredFields: ['name', 'bn_name', 'division_id']
        };
      case 'upazila':
        return {
          title: 'নতুন উপজেলা তৈরি করুন',
          fields: ['name', 'bn_name', 'district_id', 'url'],
          requiredFields: ['name', 'bn_name', 'district_id']
        };
      case 'union':
        return {
          title: 'নতুন ইউনিয়ন তৈরি করুন',
          fields: ['name', 'bn_name', 'upazila_id', 'url'],
          requiredFields: ['name', 'bn_name', 'upazila_id']
        };
      case 'village':
        return {
          title: 'নতুন গ্রাম তৈরি করুন',
          fields: ['name', 'bn_name', 'union_id'],
          requiredFields: ['name', 'bn_name', 'union_id']
        };
      default:
        return { title: '', fields: [], requiredFields: [] };
    }
  };

  const config = getTypeConfig();

  const handleLocationChange = (field: string, value: string) => {
    const updated = { ...newLocation, [field]: value };
    
    // Auto-fill parent locations for hierarchical data
    if (field === 'union_id' && value) {
      const union = locationData.unions?.find((u: any) => u.id === value);
      if (union) {
        updated.upazila_id = union.upazilla_id;
        const upazila = locationData.upazilas?.find((u: any) => u.id === union.upazilla_id);
        if (upazila) {
          updated.district_id = upazila.district_id;
          const district = locationData.districts?.find((d: any) => d.id === upazila.district_id);
          if (district) {
            updated.division_id = district.division_id;
          }
        }
      }
    } else if (field === 'upazila_id' && value) {
      const upazila = locationData.upazilas?.find((u: any) => u.id === value);
      if (upazila) {
        updated.district_id = upazila.district_id;
        const district = locationData.districts?.find((d: any) => d.id === upazila.district_id);
        if (district) {
          updated.division_id = district.division_id;
        }
      }
    } else if (field === 'district_id' && value) {
      const district = locationData.districts?.find((d: any) => d.id === value);
      if (district) {
        updated.division_id = district.division_id;
      }
    }
    
    setNewLocation(updated);
  };

  const handleAddLocation = () => {
    const missingFields = config.requiredFields.filter(field => !newLocation[field as keyof typeof newLocation]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল প্রয়োজনীয় তথ্য পূরণ করুন',
        variant: 'destructive',
      });
      return;
    }

    // Add to local cache
    const newLocationData = {
      id: `${type}_${Date.now()}`,
      ...newLocation
    };

    // Special handling for union (uses upazilla_id instead of upazila_id)
    if (type === 'union') {
      newLocationData.upazilla_id = newLocation.upazila_id;
      delete newLocationData.upazila_id;
    }

    const cacheKey = `${type}s` as keyof typeof locationCache;
    if (locationCache[cacheKey]) {
      locationCache[cacheKey]!.push(newLocationData);
    } else {
      locationCache[cacheKey] = [newLocationData];
    }

    toast({
      title: 'সফল',
      description: `নতুন ${type === 'division' ? 'বিভাগ' : type === 'district' ? 'জেলা' : type === 'upazila' ? 'উপজেলা' : type === 'union' ? 'ইউনিয়ন' : 'গ্রাম'} যোগ করা হয়েছে`,
    });

    // Reset form
    setNewLocation({
      name: '',
      bn_name: '',
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      url: ''
    });
    setIsOpen(false);
    onLocationAdded();
  };

  const downloadJSON = () => {
    const cacheKey = `${type}s` as keyof typeof locationCache;
    const dataStr = JSON.stringify(locationCache[cacheKey] || [], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${type}s.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getFilteredOptions = (optionType: string) => {
    switch (optionType) {
      case 'divisions':
        return locationData.divisions || [];
      case 'districts':
        return newLocation.division_id 
          ? (locationData.districts || []).filter((d: any) => d.division_id === newLocation.division_id)
          : locationData.districts || [];
      case 'upazilas':
        return newLocation.district_id 
          ? (locationData.upazilas || []).filter((u: any) => u.district_id === newLocation.district_id)
          : locationData.upazilas || [];
      case 'unions':
        return newLocation.upazila_id 
          ? (locationData.unions || []).filter((u: any) => u.upazilla_id === newLocation.upazila_id)
          : locationData.unions || [];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          নতুন {type === 'division' ? 'বিভাগ' : type === 'district' ? 'জেলা' : type === 'upazila' ? 'উপজেলা' : type === 'union' ? 'ইউনিয়ন' : 'গ্রাম'} যোগ করুন
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {config.fields.includes('name') && (
            <div>
              <Label>নাম (ইংরেজি) *</Label>
              <Input
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="Name in English"
              />
            </div>
          )}
          
          {config.fields.includes('bn_name') && (
            <div>
              <Label>নাম (বাংলা) *</Label>
              <Input
                value={newLocation.bn_name}
                onChange={(e) => setNewLocation({ ...newLocation, bn_name: e.target.value })}
                placeholder="নাম বাংলায়"
              />
            </div>
          )}

          {config.fields.includes('division_id') && (
            <div>
              <Label>বিভাগ *</Label>
              <Select value={newLocation.division_id} onValueChange={(value) => handleLocationChange('division_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredOptions('divisions').map((division: any) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name} ({division.bn_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.fields.includes('district_id') && (
            <div>
              <Label>জেলা *</Label>
              <Select value={newLocation.district_id} onValueChange={(value) => handleLocationChange('district_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredOptions('districts').map((district: any) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name} ({district.bn_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.fields.includes('upazila_id') && (
            <div>
              <Label>উপজেলা *</Label>
              <Select value={newLocation.upazila_id} onValueChange={(value) => handleLocationChange('upazila_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredOptions('upazilas').map((upazila: any) => (
                    <SelectItem key={upazila.id} value={upazila.id}>
                      {upazila.name} ({upazila.bn_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.fields.includes('union_id') && (
            <div>
              <Label>ইউনিয়ন *</Label>
              <Select value={newLocation.union_id} onValueChange={(value) => handleLocationChange('union_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredOptions('unions').map((union: any) => (
                    <SelectItem key={union.id} value={union.id}>
                      {union.name} ({union.bn_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {config.fields.includes('url') && (
            <div>
              <Label>ওয়েবসাইট URL</Label>
              <Input
                value={newLocation.url}
                onChange={(e) => setNewLocation({ ...newLocation, url: e.target.value })}
                placeholder="www.example.gov.bd"
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={downloadJSON}>
              <Download className="w-4 h-4 mr-2" />
              JSON ডাউনলোড
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleAddLocation}>
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

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load all location data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading location data...');
        const [divisions, districts, upazilas, unions, villages] = await Promise.all([
          loadLocationData('divisions'),
          loadLocationData('districts'),
          loadLocationData('upazilas'),
          loadLocationData('unions'),
          loadLocationData('villages')
        ]);
        
        console.log('Location data loaded:', { divisions: divisions.length, districts: districts.length });
        
        setLocationData({ divisions, districts, upazilas, unions, villages });
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading location data:', error);
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  const refreshData = () => {
    setLocationData({
      divisions: locationCache.divisions || [],
      districts: locationCache.districts || [],
      upazilas: locationCache.upazilas || [],
      unions: locationCache.unions || [],
      villages: locationCache.villages || []
    });
  };

  const getLocationStats = () => {
    const stats = {
      totalDivisions: locationData.divisions.length,
      totalDistricts: locationData.districts.length,
      totalUpazilas: locationData.upazilas.length,
      totalUnions: locationData.unions.length,
      totalVillages: locationData.villages.length
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

  if (!isDataLoaded) {
    return (
      <ResponsiveSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">লোডিং হচ্ছে...</div>
        </div>
      </ResponsiveSidebar>
    );
  }

  return (
    <ResponsiveSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">এলাকা ব্যবস্থাপনা</h1>
              <p className="mt-2 text-blue-100">প্রশাসনিক এলাকা তৈরি ও ব্যবস্থাপনা</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <LocationBuilderDialog type="division" locationData={locationData} onLocationAdded={refreshData} />
              <LocationBuilderDialog type="district" locationData={locationData} onLocationAdded={refreshData} />
              <LocationBuilderDialog type="upazila" locationData={locationData} onLocationAdded={refreshData} />
              <LocationBuilderDialog type="union" locationData={locationData} onLocationAdded={refreshData} />
              <LocationBuilderDialog type="village" locationData={locationData} onLocationAdded={refreshData} />
            </div>
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
                <Select value={selectedLocation.division_id} onValueChange={(value) => setSelectedLocation({ division_id: value === 'all' ? '' : value, district_id: '', upazila_id: '', union_id: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব বিভাগ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব বিভাগ</SelectItem>
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
                <Select value={selectedLocation.district_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, district_id: value === 'all' ? '' : value, upazila_id: '', union_id: '' })} disabled={!selectedLocation.division_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব জেলা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব জেলা</SelectItem>
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
                <Select value={selectedLocation.upazila_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, upazila_id: value === 'all' ? '' : value, union_id: '' })} disabled={!selectedLocation.district_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব উপজেলা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব উপজেলা</SelectItem>
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
                <Select value={selectedLocation.union_id} onValueChange={(value) => setSelectedLocation({ ...selectedLocation, union_id: value === 'all' ? '' : value })} disabled={!selectedLocation.upazila_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব ইউনিয়ন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ইউনিয়ন</SelectItem>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-blue-700">{stats.totalDivisions}</div>
              <div className="text-xs text-blue-600">মোট বিভাগ</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-700">{selectedLocation.division_id ? filteredDistricts.length : stats.totalDistricts}</div>
              <div className="text-xs text-green-600">{selectedLocation.division_id ? 'ফিল্টার করা জেলা' : 'মোট জেলা'}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-purple-700">{selectedLocation.district_id ? filteredUpazilas.length : stats.totalUpazilas}</div>
              <div className="text-xs text-purple-600">{selectedLocation.district_id ? 'ফিল্টার করা উপজেলা' : 'মোট উপজেলা'}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-orange-700">{selectedLocation.upazila_id ? filteredUnions.length : stats.totalUnions}</div>
              <div className="text-xs text-orange-600">{selectedLocation.upazila_id ? 'ফিল্টার করা ইউনিয়ন' : 'মোট ইউনিয়ন'}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-700">{selectedLocation.union_id ? filteredVillages.length : stats.totalVillages}</div>
              <div className="text-xs text-red-600">{selectedLocation.union_id ? 'ফিল্টার করা গ্রাম' : 'মোট গ্রাম'}</div>
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
                  {locationData.divisions.map(division => (
                    <div key={division.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{division.name}</h3>
                      <p className="text-sm text-gray-600">{division.bn_name}</p>
                      <p className="text-xs text-gray-500">ID: {division.id}</p>
                      {division.url && (
                        <p className="text-xs text-blue-500 truncate">{division.url}</p>
                      )}
                    </div>
                  ))}
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
                  {filteredDistricts.map(district => (
                    <div key={district.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{district.name}</h3>
                      <p className="text-sm text-gray-600">{district.bn_name}</p>
                      <p className="text-xs text-gray-500">ID: {district.id}</p>
                      {district.url && (
                        <p className="text-xs text-blue-500 truncate">{district.url}</p>
                      )}
                    </div>
                  ))}
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
                  {filteredUpazilas.map(upazila => (
                    <div key={upazila.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{upazila.name}</h3>
                      <p className="text-sm text-gray-600">{upazila.bn_name}</p>
                      <p className="text-xs text-gray-500">ID: {upazila.id}</p>
                      {upazila.url && (
                        <p className="text-xs text-blue-500 truncate">{upazila.url}</p>
                      )}
                    </div>
                  ))}
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
                  {filteredUnions.map(union => (
                    <div key={union.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{union.name}</h3>
                      <p className="text-sm text-gray-600">{union.bn_name}</p>
                      <p className="text-xs text-gray-500">ID: {union.id}</p>
                      {union.url && (
                        <p className="text-xs text-blue-500 truncate">{union.url}</p>
                      )}
                    </div>
                  ))}
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
                  {filteredVillages.map(village => (
                    <div key={village.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{village.name}</h3>
                      <p className="text-sm text-gray-600">{village.bn_name}</p>
                      <p className="text-xs text-gray-500">ID: {village.id}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveSidebar>
  );
};

export default LocationManagement;
