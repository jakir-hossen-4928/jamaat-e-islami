import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Plus, MapPin, Building, Users, Home, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadLocationData } from '@/lib/locationUtils';
import { Division, District, Upazila, Union, Village } from '@/lib/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';

const LocationManagement = () => {
  usePageTitle('এলাকা ব্যবস্থাপনা');
  
  const [locationData, setLocationData] = useState({
    divisions: [] as Division[],
    districts: [] as District[],
    upazilas: [] as Upazila[],
    unions: [] as Union[],
    villages: [] as Village[]
  });

  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form states for each location type
  const [newDivision, setNewDivision] = useState({ name: '', bn_name: '', url: '' });
  const [newDistrict, setNewDistrict] = useState({ name: '', bn_name: '', division_id: '', lat: '', lon: '', url: '' });
  const [newUpazila, setNewUpazila] = useState({ name: '', bn_name: '', district_id: '', url: '' });
  const [newUnion, setNewUnion] = useState({ name: '', bn_name: '', upazila_id: '', url: '' });
  const [newVillage, setNewVillage] = useState({ name: '', bn_name: '', union_id: '', upazila_id: '', district_id: '', division_id: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadLocationData();
        setLocationData({
          divisions: data.divisions || [],
          districts: data.districts || [],
          upazilas: data.upazilas || [],
          unions: data.unions || [],
          villages: []
        });
      } catch (error) {
        console.error('Error loading location data:', error);
        toast({
          title: 'ত্রুটি',
          description: 'লোকেশন ডেটা লোড করতে সমস্যা হয়েছে',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Helper functions
  const generateId = () => Date.now().toString();

  const addDivision = () => {
    if (!newDivision.name || !newDivision.bn_name) {
      toast({
        title: 'ত্রুটি',
        description: 'নাম এবং বাংলা নাম আবশ্যক',
        variant: 'destructive'
      });
      return;
    }

    const division: Division = {
      id: generateId(),
      ...newDivision
    };

    setLocationData(prev => ({
      ...prev,
      divisions: [...prev.divisions, division]
    }));

    setNewDivision({ name: '', bn_name: '', url: '' });
    toast({
      title: 'সফল', 
      description: 'নতুন বিভাগ যোগ করা হয়েছে'
    });
  };

  const addDistrict = () => {
    if (!newDistrict.name || !newDistrict.bn_name || !newDistrict.division_id) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল আবশ্যক তথ্য পূরণ করুন',
        variant: 'destructive'
      });
      return;
    }

    const district: District = {
      id: generateId(),
      ...newDistrict
    };

    setLocationData(prev => ({
      ...prev,
      districts: [...prev.districts, district]
    }));

    setNewDistrict({ name: '', bn_name: '', division_id: '', lat: '', lon: '', url: '' });
    toast({
      title: 'সফল',
      description: 'নতুন জেলা যোগ করা হয়েছে'
    });
  };

  const addUpazila = () => {
    if (!newUpazila.name || !newUpazila.bn_name || !newUpazila.district_id) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল আবশ্যক তথ্য পূরণ করুন',
        variant: 'destructive'
      });
      return;
    }

    const upazila: Upazila = {
      id: generateId(),
      ...newUpazila
    };

    setLocationData(prev => ({
      ...prev,
      upazilas: [...prev.upazilas, upazila]
    }));

    setNewUpazila({ name: '', bn_name: '', district_id: '', url: '' });
    toast({
      title: 'সফল',
      description: 'নতুন উপজেলা যোগ করা হয়েছে'
    });
  };

  const addUnion = () => {
    if (!newUnion.name || !newUnion.bn_name || !newUnion.upazila_id) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল আবশ্যক তথ্য পূরণ করুন',
        variant: 'destructive'
      });
      return;
    }

    const union: Union = {
      id: generateId(),
      upazilla_id: newUnion.upazila_id, // Fixed property name
      name: newUnion.name,
      bn_name: newUnion.bn_name,
      url: newUnion.url
    };

    setLocationData(prev => ({
      ...prev,
      unions: [...prev.unions, union]
    }));

    setNewUnion({ name: '', bn_name: '', upazila_id: '', url: '' });
    toast({
      title: 'সফল',
      description: 'নতুন ইউনিয়ন যোগ করা হয়েছে'
    });
  };

  const addVillage = () => {
    if (!newVillage.name || !newVillage.bn_name || !newVillage.union_id) {
      toast({
        title: 'ত্রুটি',
        description: 'সকল আবশ্যক তথ্য পূরণ করুন',
        variant: 'destructive'
      });
      return;
    }

    // Auto-fill hierarchical data
    const selectedUnion = locationData.unions.find(u => u.id === newVillage.union_id);
    const selectedUpazila = selectedUnion ? locationData.upazilas.find(up => up.id === selectedUnion.upazilla_id) : null;
    const selectedDistrict = selectedUpazila ? locationData.districts.find(d => d.id === selectedUpazila.district_id) : null;

    const village: Village = {
      id: generateId(),
      ...newVillage,
      upazila_id: selectedUpazila?.id || '',
      district_id: selectedDistrict?.id || '',
      division_id: selectedDistrict?.division_id || ''
    };

    setLocationData(prev => ({
      ...prev,
      villages: [...prev.villages, village]
    }));

    setNewVillage({ name: '', bn_name: '', union_id: '', upazila_id: '', district_id: '', division_id: '' });
    toast({
      title: 'সফল',
      description: 'নতুন গ্রাম যোগ করা হয়েছে'
    });
  };

  // Delete functions
  const deleteDivision = (id: string) => {
    setLocationData(prev => ({
      ...prev,
      divisions: prev.divisions.filter(d => d.id !== id)
    }));
    toast({ title: 'সফল', description: 'বিভাগ মুছে ফেলা হয়েছে' });
  };

  const deleteDistrict = (id: string) => {
    setLocationData(prev => ({
      ...prev,
      districts: prev.districts.filter(d => d.id !== id)
    }));
    toast({ title: 'সফল', description: 'জেলা মুছে ফেলা হয়েছে' });
  };

  const deleteUpazila = (id: string) => {
    setLocationData(prev => ({
      ...prev,
      upazilas: prev.upazilas.filter(u => u.id !== id)
    }));
    toast({ title: 'সফল', description: 'উপজেলা মুছে ফেলা হয়েছে' });
  };

  const deleteUnion = (id: string) => {
    setLocationData(prev => ({
      ...prev,
      unions: prev.unions.filter(u => u.id !== id)
    }));
    toast({ title: 'সফল', description: 'ইউনিয়ন মুছে ফেলা হয়েছে' });
  };

  const deleteVillage = (id: string) => {
    setLocationData(prev => ({
      ...prev,
      villages: prev.villages.filter(v => v.id !== id)
    }));
    toast({ title: 'সফল', description: 'গ্রাম মুছে ফেলা হয়েছে' });
  };

  // Download function
  const downloadJSON = (type: string, data: any[]) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${type}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({ title: 'সফল', description: `${type} ডাটা ডাউনলোড শুরু হয়েছে` });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">ডেটা লোড হচ্ছে...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">এলাকা ব্যবস্থাপনা</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              বিভাগ: {locationData.divisions.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              জেলা: {locationData.districts.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              উপজেলা: {locationData.upazilas.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              ইউনিয়ন: {locationData.unions.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              গ্রাম: {locationData.villages.length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="divisions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="divisions" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              বিভাগ
            </TabsTrigger>
            <TabsTrigger value="districts" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              জেলা
            </TabsTrigger>
            <TabsTrigger value="upazilas" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              উপজেলা
            </TabsTrigger>
            <TabsTrigger value="unions" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              ইউনিয়ন
            </TabsTrigger>
            <TabsTrigger value="villages" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              গ্রাম
            </TabsTrigger>
          </TabsList>

          {/* Divisions Tab */}
          <TabsContent value="divisions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    নতুন বিভাগ যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="div-name">ইংরেজি নাম *</Label>
                    <Input
                      id="div-name"
                      value={newDivision.name}
                      onChange={(e) => setNewDivision({...newDivision, name: e.target.value})}
                      placeholder="Division name in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="div-bn-name">বাংলা নাম *</Label>
                    <Input
                      id="div-bn-name"
                      value={newDivision.bn_name}
                      onChange={(e) => setNewDivision({...newDivision, bn_name: e.target.value})}
                      placeholder="বিভাগের বাংলা নাম"
                    />
                  </div>
                  <div>
                    <Label htmlFor="div-url">URL</Label>
                    <Input
                      id="div-url"
                      value={newDivision.url}
                      onChange={(e) => setNewDivision({...newDivision, url: e.target.value})}
                      placeholder="www.example.gov.bd"
                    />
                  </div>
                  <Button onClick={addDivision} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    বিভাগ যোগ করুন
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>বিভাগ তালিকা ({locationData.divisions.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJSON('divisions', locationData.divisions)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locationData.divisions.map((division) => (
                      <div key={division.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{division.bn_name}</p>
                          <p className="text-sm text-gray-600">{division.name}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteDivision(division.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Districts Tab */}
          <TabsContent value="districts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    নতুন জেলা যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>বিভাগ নির্বাচন করুন *</Label>
                    <Select value={newDistrict.division_id} onValueChange={(value) => setNewDistrict({...newDistrict, division_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.divisions.map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.bn_name} ({division.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dist-name">ইংরেজি নাম *</Label>
                    <Input
                      id="dist-name"
                      value={newDistrict.name}
                      onChange={(e) => setNewDistrict({...newDistrict, name: e.target.value})}
                      placeholder="District name in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dist-bn-name">বাংলা নাম *</Label>
                    <Input
                      id="dist-bn-name"
                      value={newDistrict.bn_name}
                      onChange={(e) => setNewDistrict({...newDistrict, bn_name: e.target.value})}
                      placeholder="জেলার বাংলা নাম"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="dist-lat">অক্ষাংশ</Label>
                      <Input
                        id="dist-lat"
                        value={newDistrict.lat}
                        onChange={(e) => setNewDistrict({...newDistrict, lat: e.target.value})}
                        placeholder="Latitude"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dist-lon">দ্রাঘিমাংশ</Label>
                      <Input
                        id="dist-lon"
                        value={newDistrict.lon}
                        onChange={(e) => setNewDistrict({...newDistrict, lon: e.target.value})}
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dist-url">URL</Label>
                    <Input
                      id="dist-url"
                      value={newDistrict.url}
                      onChange={(e) => setNewDistrict({...newDistrict, url: e.target.value})}
                      placeholder="www.example.gov.bd"
                    />
                  </div>
                  <Button onClick={addDistrict} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    জেলা যোগ করুন
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>জেলা তালিকা ({locationData.districts.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJSON('districts', locationData.districts)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locationData.districts.map((district) => {
                      const division = locationData.divisions.find(d => d.id === district.division_id);
                      return (
                        <div key={district.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{district.bn_name}</p>
                            <p className="text-sm text-gray-600">{district.name}</p>
                            <p className="text-xs text-gray-500">বিভাগ: {division?.bn_name}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDistrict(district.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upazilas Tab */}
          <TabsContent value="upazilas">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    নতুন উপজেলা যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>জেলা নির্বাচন করুন *</Label>
                    <Select value={newUpazila.district_id} onValueChange={(value) => setNewUpazila({...newUpazila, district_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="জেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.bn_name} ({district.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="up-name">ইংরেজি নাম *</Label>
                    <Input
                      id="up-name"
                      value={newUpazila.name}
                      onChange={(e) => setNewUpazila({...newUpazila, name: e.target.value})}
                      placeholder="Upazila name in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="up-bn-name">বাংলা নাম *</Label>
                    <Input
                      id="up-bn-name"
                      value={newUpazila.bn_name}
                      onChange={(e) => setNewUpazila({...newUpazila, bn_name: e.target.value})}
                      placeholder="উপজেলার বাংলা নাম"
                    />
                  </div>
                  <div>
                    <Label htmlFor="up-url">URL</Label>
                    <Input
                      id="up-url"
                      value={newUpazila.url}
                      onChange={(e) => setNewUpazila({...newUpazila, url: e.target.value})}
                      placeholder="www.example.gov.bd"
                    />
                  </div>
                  <Button onClick={addUpazila} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    উপজেলা যোগ করুন
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>উপজেলা তালিকা ({locationData.upazilas.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJSON('upazilas', locationData.upazilas)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locationData.upazilas.map((upazila) => {
                      const district = locationData.districts.find(d => d.id === upazila.district_id);
                      return (
                        <div key={upazila.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{upazila.bn_name}</p>
                            <p className="text-sm text-gray-600">{upazila.name}</p>
                            <p className="text-xs text-gray-500">জেলা: {district?.bn_name}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUpazila(upazila.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Unions Tab */}
          <TabsContent value="unions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    নতুন ইউনিয়ন যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>উপজেলা নির্বাচন করুন *</Label>
                    <Select value={newUnion.upazila_id} onValueChange={(value) => setNewUnion({...newUnion, upazila_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.upazilas.map((upazila) => (
                          <SelectItem key={upazila.id} value={upazila.id}>
                            {upazila.bn_name} ({upazila.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="union-name">ইংরেজি নাম *</Label>
                    <Input
                      id="union-name"
                      value={newUnion.name}
                      onChange={(e) => setNewUnion({...newUnion, name: e.target.value})}
                      placeholder="Union name in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="union-bn-name">বাংলা নাম *</Label>
                    <Input
                      id="union-bn-name"
                      value={newUnion.bn_name}
                      onChange={(e) => setNewUnion({...newUnion, bn_name: e.target.value})}
                      placeholder="ইউনিয়নের বাংলা নাম"
                    />
                  </div>
                  <div>
                    <Label htmlFor="union-url">URL</Label>
                    <Input
                      id="union-url"
                      value={newUnion.url}
                      onChange={(e) => setNewUnion({...newUnion, url: e.target.value})}
                      placeholder="www.example.gov.bd"
                    />
                  </div>
                  <Button onClick={addUnion} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    ইউনিয়ন যোগ করুন
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>ইউনিয়ন তালিকা ({locationData.unions.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJSON('unions', locationData.unions)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locationData.unions.map((union) => {
                      const upazila = locationData.upazilas.find(u => u.id === union.upazilla_id);
                      return (
                        <div key={union.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{union.bn_name}</p>
                            <p className="text-sm text-gray-600">{union.name}</p>
                            <p className="text-xs text-gray-500">উপজেলা: {upazila?.bn_name}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUnion(union.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Villages Tab */}
          <TabsContent value="villages">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    নতুন গ্রাম যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ইউনিয়ন নির্বাচন করুন *</Label>
                    <Select value={newVillage.union_id} onValueChange={(value) => setNewVillage({...newVillage, union_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.unions.map((union) => (
                          <SelectItem key={union.id} value={union.id}>
                            {union.bn_name} ({union.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="village-name">ইংরেজি নাম *</Label>
                    <Input
                      id="village-name"
                      value={newVillage.name}
                      onChange={(e) => setNewVillage({...newVillage, name: e.target.value})}
                      placeholder="Village name in English"
                    />
                  </div>
                  <div>
                    <Label htmlFor="village-bn-name">বাংলা নাম *</Label>
                    <Input
                      id="village-bn-name"
                      value={newVillage.bn_name}
                      onChange={(e) => setNewVillage({...newVillage, bn_name: e.target.value})}
                      placeholder="গ্রামের বাংলা নাম"
                    />
                  </div>
                  <Button onClick={addVillage} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    গ্রাম যোগ করুন
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>গ্রাম তালিকা ({locationData.villages.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJSON('villages', locationData.villages)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ডাউনলোড
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {locationData.villages.map((village) => {
                      const union = locationData.unions.find(u => u.id === village.union_id);
                      return (
                        <div key={village.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{village.bn_name}</p>
                            <p className="text-sm text-gray-600">{village.name}</p>
                            <p className="text-xs text-gray-500">ইউনিয়ন: {union?.bn_name}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteVillage(village.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default LocationManagement;
