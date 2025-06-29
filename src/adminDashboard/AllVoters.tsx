
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
  Eye,
  Phone,
  MapPin,
  BarChart3,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VoterLocationFilter from '@/components/admin/VoterLocationFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { VoterData } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AllVoters = () => {
  usePageTitle('সকল ভোটার - অ্যাডমিন প্যানেল');
  
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading: locationLoading
  } = useLocationFilter();

  // Optimized Firebase query with caching
  const { data: allVoters = [], isLoading, error } = useQuery({
    queryKey: ['voters', userProfile?.uid, selectedLocation],
    queryFn: async () => {
      if (!userProfile) return [];
      
      const votersCollection = collection(db, 'voters');
      let finalQuery = query(votersCollection, orderBy('Last Updated', 'desc'));
      
      // Apply location-based filtering based on user role and selected location
      if (userProfile.role !== 'super_admin') {
        const userScope = userProfile.accessScope;
        if (userScope.village_id) {
          finalQuery = query(votersCollection, where('village_id', '==', userScope.village_id), orderBy('Last Updated', 'desc'));
        } else if (userScope.union_id) {
          finalQuery = query(votersCollection, where('union_id', '==', userScope.union_id), orderBy('Last Updated', 'desc'));
        } else if (userScope.upazila_id) {
          finalQuery = query(votersCollection, where('upazila_id', '==', userScope.upazila_id), orderBy('Last Updated', 'desc'));
        } else if (userScope.district_id) {
          finalQuery = query(votersCollection, where('district_id', '==', userScope.district_id), orderBy('Last Updated', 'desc'));
        } else if (userScope.division_id) {
          finalQuery = query(votersCollection, where('division_id', '==', userScope.division_id), orderBy('Last Updated', 'desc'));
        }
      } else {
        // For super admin, apply selected location filters
        if (selectedLocation.village_id) {
          finalQuery = query(votersCollection, where('village_id', '==', selectedLocation.village_id), orderBy('Last Updated', 'desc'));
        } else if (selectedLocation.union_id) {
          finalQuery = query(votersCollection, where('union_id', '==', selectedLocation.union_id), orderBy('Last Updated', 'desc'));
        } else if (selectedLocation.upazila_id) {
          finalQuery = query(votersCollection, where('upazila_id', '==', selectedLocation.upazila_id), orderBy('Last Updated', 'desc'));
        } else if (selectedLocation.district_id) {
          finalQuery = query(votersCollection, where('district_id', '==', selectedLocation.district_id), orderBy('Last Updated', 'desc'));
        } else if (selectedLocation.division_id) {
          finalQuery = query(votersCollection, where('division_id', '==', selectedLocation.division_id), orderBy('Last Updated', 'desc'));
        }
      }
      
      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => {
        const documentData = doc.data();
        const voterData: VoterData = {
          id: doc.id,
          ID: documentData.ID || '',
          'Voter Name': documentData['Voter Name'] || '',
          FatherOrHusband: documentData.FatherOrHusband,
          Age: documentData.Age,
          Gender: documentData.Gender,
          'Marital Status': documentData['Marital Status'],
          Student: documentData.Student,
          Occupation: documentData.Occupation,
          Education: documentData.Education,
          Religion: documentData.Religion,
          Phone: documentData.Phone,
          NID: documentData.NID,
          WhatsApp: documentData.WhatsApp,
          'Will Vote': documentData['Will Vote'],
          'Voted Before': documentData['Voted Before'],
          'Vote Probability (%)': documentData['Vote Probability (%)'],
          'Priority Level': documentData['Priority Level'],
          'Political Support': documentData['Political Support'],
          'Has Disability': documentData['Has Disability'],
          'Is Migrated': documentData['Is Migrated'],
          division_id: documentData.division_id,
          district_id: documentData.district_id,
          upazila_id: documentData.upazila_id,
          union_id: documentData.union_id,
          village_id: documentData.village_id,
          'House Name': documentData['House Name'],
          Remarks: documentData.Remarks,
          Collector: documentData.Collector,
          'Collection Date': documentData['Collection Date'],
          'Last Updated': documentData['Last Updated']
        };
        return voterData;
      });
    },
    enabled: !!userProfile,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce Firebase reads
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (renamed from cacheTime)
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
    } else if (selectedTab === 'with-phone') {
      filtered = filtered.filter(voter => voter.Phone);
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
    const withPhone = allVoters.filter(v => v.Phone).length;
    
    return { total, willVote, wontVote, highProbability, withPhone };
  }, [allVoters]);

  const handleExportToPDF = () => {
    if (filteredVoters.length === 0) {
      toast({
        title: 'সতর্কতা',
        description: 'পিডিএফ তৈরি করার জন্য কোন ভোটার নেই',
        variant: 'destructive',
      });
      return;
    }
    navigate('/admin/pdf-preview', { state: { voters: filteredVoters } });
  };

  const handleViewAnalytics = () => {
    navigate('/admin/analytics', { state: { voters: filteredVoters, locationFilter: selectedLocation } });
  };

  if (error) {
    return (
      <RoleBasedSidebar>
        <div className="text-center py-8">
          <p className="text-red-600">ডেটা লোড করতে সমস্যা হয়েছে</p>
        </div>
      </RoleBasedSidebar>
    );
  }

  return (
    <RoleBasedSidebar>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">সকল ভোটার</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-4 mt-6">
                <Button onClick={handleExportToPDF} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  পিডিএফ এক্সপোর্ট
                </Button>
                <Button onClick={handleViewAnalytics} variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  রিপোর্ট এনালিটিক্স
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 lg:p-6 text-white">
            <h1 className="text-xl lg:text-3xl font-bold">সকল ভোটার</h1>
            <p className="mt-2 text-blue-100 text-sm lg:text-base">ভোটারদের তালিকা ও বিস্তারিত তথ্য</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
            <Card>
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center">
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                  <div className="ml-2 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">মোট ভোটার</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center">
                  <div className="h-6 w-6 lg:h-8 lg:w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 lg:h-4 lg:w-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="ml-2 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">ভোট দিবে</p>
                    <p className="text-lg lg:text-2xl font-bold text-green-600">{stats.willVote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center">
                  <div className="h-6 w-6 lg:h-8 lg:w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 lg:h-4 lg:w-4 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="ml-2 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">ভোট দিবে না</p>
                    <p className="text-lg lg:text-2xl font-bold text-red-600">{stats.wontVote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center">
                  <div className="h-6 w-6 lg:h-8 lg:w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 lg:h-4 lg:w-4 bg-purple-600 rounded-full"></div>
                  </div>
                  <div className="ml-2 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">উচ্চ সম্ভাবনা</p>
                    <p className="text-lg lg:text-2xl font-bold text-purple-600">{stats.highProbability}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center">
                  <Phone className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                  <div className="ml-2 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">ফোন আছে</p>
                    <p className="text-lg lg:text-2xl font-bold text-orange-600">{stats.withPhone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 lg:p-6">
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
                <div className="hidden lg:flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportToPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    পিডিএফ এক্সপোর্ট
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleViewAnalytics}>
                    <FileText className="h-4 w-4 mr-2" />
                    রিপোর্ট এনালিটিক্স
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="all" className="text-xs lg:text-sm">
                সকল ভোটার ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="will-vote" className="text-xs lg:text-sm">
                ভোট দিবে ({stats.willVote})
              </TabsTrigger>
              <TabsTrigger value="wont-vote" className="text-xs lg:text-sm">
                ভোট দিবে না ({stats.wontVote})
              </TabsTrigger>
              <TabsTrigger value="high-probability" className="text-xs lg:text-sm">
                উচ্চ সম্ভাবনা ({stats.highProbability})
              </TabsTrigger>
              <TabsTrigger value="with-phone" className="text-xs lg:text-sm">
                ফোন আছে ({stats.withPhone})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4 lg:mt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <div className="grid gap-3 lg:gap-4 p-4 lg:p-6">
                        {filteredVoters.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">কোন ভোটার পাওয়া যায়নি</p>
                          </div>
                        ) : (
                          filteredVoters.map((voter) => (
                            <div key={voter.id} className="border rounded-lg p-3 lg:p-4 hover:bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 lg:space-x-4">
                                  <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {voter['Voter Name']?.charAt(0) || 'V'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1">
                                    <h3 className="font-medium text-gray-900 text-sm lg:text-base">
                                      {voter['Voter Name']}
                                    </h3>
                                    <p className="text-xs lg:text-sm text-gray-600">আইডি: {voter.ID}</p>
                                    {voter.Phone && (
                                      <div className="flex items-center text-xs lg:text-sm text-gray-600">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {voter.Phone}
                                      </div>
                                    )}
                                    <div className="flex items-center text-xs lg:text-sm text-gray-600">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {getLocationName(voter)}
                                    </div>
                                    {voter['Political Support'] && (
                                      <p className="text-xs text-gray-600">
                                        সমর্থন: {voter['Political Support']}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col lg:flex-row items-end lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
                                  {voter['Will Vote'] === 'Yes' && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">ভোট দিবে</Badge>
                                  )}
                                  {voter['Will Vote'] === 'No' && (
                                    <Badge className="bg-red-100 text-red-800 text-xs">ভোট দিবে না</Badge>
                                  )}
                                  {voter['Vote Probability (%)'] && (
                                    <Badge variant="outline" className="text-xs">
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
      </div>
    </RoleBasedSidebar>
  );
};

export default AllVoters;

