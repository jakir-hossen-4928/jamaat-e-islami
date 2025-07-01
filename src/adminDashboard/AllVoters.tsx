import React, { useState, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, Query, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
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
import { useDataAccess } from '@/contexts/DataAccessContext';
import VoterLocationFilter from '@/components/admin/VoterLocationFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { VoterData } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getFullLocationHierarchy } from '@/lib/locationUtils';
import VirtualizedVoterList from '@/components/voter/VirtualizedVoterList';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 50;

const AllVoters = () => {
  usePageTitle('সকল ভোটার - অ্যাডমিন প্যানেল');

  const { 
    accessScope, 
    canAccessAllData, 
    createVoterQuery, 
    getAccessibleVoters 
  } = useDataAccess();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [locationNames, setLocationNames] = useState<{ [key: string]: string }>({});
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading: locationLoading
  } = useLocationFilter();

  // Fetch voters with role-based access control
  const fetchVoters = useCallback(async (afterDoc?: QueryDocumentSnapshot<DocumentData> | null, append = false) => {
    setIsLoading(true);
    try {
      const q = createVoterQuery();
      if (!q) return;
      
      let finalQuery = q;
      if (afterDoc) {
        finalQuery = query(q, startAfter(afterDoc));
      }
      
      const snapshot = await getDocs(finalQuery);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VoterData[];
      
      // Apply additional client-side filtering using data access
      const accessibleDocs = getAccessibleVoters(docs);
      
      if (append) {
        setVoters(prev => [...prev, ...accessibleDocs]);
      } else {
        setVoters(accessibleDocs);
      }
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      setHasMore(false);
      toast({ title: 'ডেটা লোডে সমস্যা', description: 'ভোটার ডেটা আনতে সমস্যা হয়েছে।', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [createVoterQuery, getAccessibleVoters, toast]);

  // Initial fetch
  React.useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (hasMore && lastDoc) {
      fetchVoters(lastDoc, true);
    }
  }, [hasMore, lastDoc, fetchVoters]);

  // Filter voters based on debounced search and tab
  const filteredVoters = useMemo(() => {
    if (!Array.isArray(voters)) return [];
    let filtered = voters;
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(voter =>
        voter['Voter Name']?.toLowerCase().includes(term) ||
        voter.ID?.toLowerCase().includes(term) ||
        voter.Phone?.includes(term) ||
        voter.NID?.includes(term)
      );
    }
    return filtered;
  }, [voters, debouncedSearchTerm]);

  // Load location names efficiently using static data
  React.useEffect(() => {
    const loadLocationNames = async () => {
      if (!voters || voters.length === 0) return;

      const names: { [key: string]: string } = {};

      try {
        // Get unique location combinations to reduce API calls
        const uniqueVoters = voters.filter((voter, index, self) =>
          index === self.findIndex(v =>
            v.division_id === voter.division_id &&
            v.district_id === voter.district_id &&
            v.upazila_id === voter.upazila_id &&
            v.union_id === voter.union_id
          )
        );

        // Limit location lookups to reduce static file reads
        for (const voter of uniqueVoters.slice(0, 100)) {
          const hierarchy = await getFullLocationHierarchy({
            division_id: voter.division_id,
            district_id: voter.district_id,
            upazila_id: voter.upazila_id,
            union_id: voter.union_id
          });

          const locationKey = `${voter.division_id}_${voter.district_id}_${voter.upazila_id}_${voter.union_id}`;
          names[locationKey] = [hierarchy.union, hierarchy.upazila, hierarchy.district].filter(Boolean).join(', ');
        }

        setLocationNames(names);
      } catch (error) {
        console.error('Error loading location names:', error);
      }
    };

    loadLocationNames();
  }, [voters]);

  const getLocationName = (voter: VoterData) => {
    const locationKey = `${voter.division_id}_${voter.district_id}_${voter.upazila_id}_${voter.union_id}`;
    return locationNames[locationKey] || 'অজানা এলাকা';
  };

  // Statistics with memoization
  const stats = useMemo(() => {
    if (!Array.isArray(voters)) return { total: 0, willVote: 0, wontVote: 0, highProbability: 0, withPhone: 0 };

    const total = voters.length;
    const willVote = voters.filter(v => v['Will Vote'] === 'Yes').length;
    const wontVote = voters.filter(v => v['Will Vote'] === 'No').length;
    const highProbability = voters.filter(v =>
      v['Vote Probability (%)'] && v['Vote Probability (%)'] >= 70
    ).length;
    const withPhone = voters.filter(v => v.Phone).length;

    return { total, willVote, wontVote, highProbability, withPhone };
  }, [voters]);

  const handleExportToPDF = () => {
    if (!Array.isArray(filteredVoters) || filteredVoters.length === 0) {
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
            {/* Show access scope info */}
            {!canAccessAllData && (
              <div className="mt-3 flex items-center space-x-2 text-blue-200">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  আপনার এক্সেস: {accessScope.division_name || accessScope.district_name || accessScope.upazila_name || accessScope.union_name || accessScope.village_name || 'সীমিত এক্সেস'}
                </span>
              </div>
            )}
          </div>

          {/* Location Filter - Only show for super admin */}
          {canAccessAllData && (
            <VoterLocationFilter
              locationData={locationData}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              userRole="super_admin"
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
                <VirtualizedVoterList
                  voters={filteredVoters}
                  isLoading={isLoading}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default AllVoters;
