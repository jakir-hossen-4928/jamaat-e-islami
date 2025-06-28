import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  FileText, 
  Users, 
  Filter,
  Eye,
  Phone,
  MapPin
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';
import { VoterData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import VoterLocationFilter from '@/components/admin/VoterLocationFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';

const AllVoters = () => {
  usePageTitle('সকল ভোটার - অ্যাডমিন প্যানেল');
  
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  
  const {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading: locationLoading
  } = useLocationFilter();

  // Fetch voters with location-based filtering
  const { data: allVoters = [], isLoading, error } = useQuery({
    queryKey: ['voters', userProfile?.uid, selectedLocation],
    queryFn: async () => {
      if (!userProfile) return [];
      
      let votersQuery;
      const votersCollection = collection(db, 'voters');
      
      // Apply location-based filtering based on user role and selected location
      if (userProfile.role !== 'super_admin') {
        const userScope = userProfile.accessScope;
        if (userScope.village_id) {
          votersQuery = query(votersCollection, where('village_id', '==', userScope.village_id));
        } else if (userScope.union_id) {
          votersQuery = query(votersCollection, where('union_id', '==', userScope.union_id));
        } else if (userScope.upazila_id) {
          votersQuery = query(votersCollection, where('upazila_id', '==', userScope.upazila_id));
        } else if (userScope.district_id) {
          votersQuery = query(votersCollection, where('district_id', '==', userScope.district_id));
        } else if (userScope.division_id) {
          votersQuery = query(votersCollection, where('division_id', '==', userScope.division_id));
        } else {
          votersQuery = votersCollection;
        }
      } else {
        // For super admin, apply selected location filters
        if (selectedLocation.village_id) {
          votersQuery = query(votersCollection, where('village_id', '==', selectedLocation.village_id));
        } else if (selectedLocation.union_id) {
          votersQuery = query(votersCollection, where('union_id', '==', selectedLocation.union_id));
        } else if (selectedLocation.upazila_id) {
          votersQuery = query(votersCollection, where('upazila_id', '==', selectedLocation.upazila_id));
        } else if (selectedLocation.district_id) {
          votersQuery = query(votersCollection, where('district_id', '==', selectedLocation.district_id));
        } else if (selectedLocation.division_id) {
          votersQuery = query(votersCollection, where('division_id', '==', selectedLocation.division_id));
        } else {
          votersQuery = votersCollection;
        }
      }
      
      // Add ordering
      const finalQuery = votersQuery === votersCollection 
        ? query(votersCollection, orderBy('Last Updated', 'desc'))
        : query(votersQuery, orderBy('Last Updated', 'desc'));
      
      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VoterData));
    },
    enabled: !!userProfile
  });

  // Filter voters based on search and tab
  const filteredVoters = useMemo(() => {
    let filtered = allVoters;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(voter =>
        voter['Voter Name']?.toLowerCase().includes(term) ||
        voter.ID?.toLowerCase().includes(term) ||
        voter.Phone?.includes(term) ||
        voter.NID?.includes(term)
      );
    }

    // Tab filter
    if (selectedTab === 'will-vote') {
      filtered = filtered.filter(voter => voter['Will Vote'] === 'Yes');
    } else if (selectedTab === 'wont-vote') {
      filtered = filtered.filter(voter => voter['Will Vote'] === 'No');
    } else if (selectedTab === 'high-probability') {
      filtered = filtered.filter(voter => 
        voter['Vote Probability (%)'] && voter['Vote Probability (%)'] >= 70
      );
    }

    return filtered;
  }, [allVoters, searchTerm, selectedTab]);

  const getLocationName = (voter: VoterData) => {
    const parts = [];
    
    if (voter.village_id) {
      const village = locationData.villages.find(v => v.id === voter.village_id);
      if (village) parts.push(village.bn_name || village.name);
    }
    
    if (voter.union_id) {
      const union = locationData.unions.find(u => u.id === voter.union_id);
      if (union) parts.push(union.bn_name || union.name);
    }
    
    if (voter.upazila_id) {
      const upazila = locationData.upazilas.find(u => u.id === voter.upazila_id);
      if (upazila) parts.push(upazila.bn_name || upazila.name);
    }
    
    return parts.join(', ');
  };

  // Statistics
  const stats = useMemo(() => {
    const total = allVoters.length;
    const willVote = allVoters.filter(v => v['Will Vote'] === 'Yes').length;
    const wontVote = allVoters.filter(v => v['Will Vote'] === 'No').length;
    const highProbability = allVoters.filter(v => 
      v['Vote Probability (%)'] && v['Vote Probability (%)'] >= 70
    ).length;
    
    return { total, willVote, wontVote, highProbability };
  }, [allVoters]);

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-600">ডেটা লোড করতে সমস্যা হয়েছে</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">সকল ভোটার</h1>
          <p className="mt-2 text-blue-100">ভোটারদের তালিকা ও বিস্তারিত তথ্য</p>
        </div>

        {/* Location Filter - Only show for super admin */}
        {userProfile?.role === 'super_admin' && (
          <VoterLocationFilter
            locationData={locationData}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            userRole={userProfile.role}
            disabled={locationLoading}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">মোট ভোটার</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ভোট দিবে</p>
                  <p className="text-2xl font-bold text-green-600">{stats.willVote}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ভোট দিবে না</p>
                  <p className="text-2xl font-bold text-red-600">{stats.wontVote}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">উচ্চ সম্ভাবনা</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.highProbability}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-2 w-full lg:w-auto">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="নাম, আইডি, ফোন অথবা এনআইডি দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  এক্সপোর্ট
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  রিপোর্ট
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">সকল ভোটার ({stats.total})</TabsTrigger>
            <TabsTrigger value="will-vote">ভোট দিবে ({stats.willVote})</TabsTrigger>
            <TabsTrigger value="wont-vote">ভোট দিবে না ({stats.wontVote})</TabsTrigger>
            <TabsTrigger value="high-probability">উচ্চ সম্ভাবনা ({stats.highProbability})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="grid gap-4 p-6">
                      {filteredVoters.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">কোন ভোটার পাওয়া যায়নি</p>
                        </div>
                      ) : (
                        filteredVoters.map((voter) => (
                          <div key={voter.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {voter['Voter Name']?.charAt(0) || 'V'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <h3 className="font-medium text-gray-900">{voter['Voter Name']}</h3>
                                  <p className="text-sm text-gray-600">আইডি: {voter.ID}</p>
                                  {voter.Phone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {voter.Phone}
                                    </div>
                                  )}
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {getLocationName(voter)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {voter['Will Vote'] === 'Yes' && (
                                  <Badge className="bg-green-100 text-green-800">ভোট দিবে</Badge>
                                )}
                                {voter['Will Vote'] === 'No' && (
                                  <Badge className="bg-red-100 text-red-800">ভোট দিবে না</Badge>
                                )}
                                {voter['Vote Probability (%)'] && (
                                  <Badge variant="outline">
                                    {voter['Vote Probability (%)']}% সম্ভাবনা
                                  </Badge>
                                )}
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AllVoters;
