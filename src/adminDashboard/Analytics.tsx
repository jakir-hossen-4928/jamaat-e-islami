import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import LocationFilter from '@/components/admin/LocationFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Vote, AlertTriangle, Filter } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocationFilter } from '@/hooks/useLocationFilter';

const Analytics = () => {
  const { userProfile } = useAuth();
  const { locationData, selectedLocation, setSelectedLocation, isLoading: locationLoading } = useLocationFilter();
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedLocation, userProfile?.accessScope],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      let votersQuery = query(votersRef);

      // Apply role-based filtering
      if (userProfile?.role !== 'super_admin') {
        const userScope = userProfile?.accessScope;
        if (userScope) {
          const constraints = [];
          if (userScope.division_id) constraints.push(where('division_id', '==', userScope.division_id));
          if (userScope.district_id) constraints.push(where('district_id', '==', userScope.district_id));
          if (userScope.upazila_id) constraints.push(where('upazila_id', '==', userScope.upazila_id));
          if (userScope.union_id) constraints.push(where('union_id', '==', userScope.union_id));
          if (userScope.village_id) constraints.push(where('village_id', '==', userScope.village_id));
          
          if (constraints.length > 0) {
            votersQuery = query(votersRef, ...constraints);
          }
        }
      } else if (Object.keys(selectedLocation).length > 0) {
        // Super admin can filter by location
        const constraints = Object.entries(selectedLocation)
          .filter(([_, value]) => value)
          .map(([key, value]) => where(key, '==', value));
        
        if (constraints.length > 0) {
          votersQuery = query(votersRef, ...constraints);
        }
      }

      const snapshot = await getDocs(votersQuery);
      const voters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));

      // Age distribution
      const ageGroups = {
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '60+': 0
      };

      // Gender distribution
      const genderDistribution = {
        Male: 0,
        Female: 0,
        Other: 0
      };

      // Vote intention
      const voteIntention = {
        Yes: 0,
        No: 0,
        Undecided: 0
      };

      // Education levels
      const educationLevels: { [key: string]: number } = {};

      // Occupation categories
      const occupations: { [key: string]: number } = {};

      // Political support distribution
      const politicalSupport: { [key: string]: number } = {};

      // Special conditions
      const specialConditions = {
        'Has Disability': 0,
        'Is Migrated': 0,
        'Student': 0
      };

      // Location-based distribution
      const locationStats = {
        divisions: {} as { [key: string]: number },
        districts: {} as { [key: string]: number },
        upazilas: {} as { [key: string]: number },
        unions: {} as { [key: string]: number },
        villages: {} as { [key: string]: number }
      };

      voters.forEach(voter => {
        // Age grouping
        if (voter.Age) {
          if (voter.Age >= 18 && voter.Age <= 30) ageGroups['18-30']++;
          else if (voter.Age >= 31 && voter.Age <= 45) ageGroups['31-45']++;
          else if (voter.Age >= 46 && voter.Age <= 60) ageGroups['46-60']++;
          else if (voter.Age > 60) ageGroups['60+']++;
        }

        // Gender
        if (voter.Gender) {
          genderDistribution[voter.Gender]++;
        }

        // Vote intention
        if (voter['Will Vote'] === 'Yes') voteIntention.Yes++;
        else if (voter['Will Vote'] === 'No') voteIntention.No++;
        else voteIntention.Undecided++;

        // Education
        if (voter.Education) {
          educationLevels[voter.Education] = (educationLevels[voter.Education] || 0) + 1;
        }

        // Occupation
        if (voter.Occupation) {
          occupations[voter.Occupation] = (occupations[voter.Occupation] || 0) + 1;
        }

        // Political support
        if (voter['Political Support']) {
          politicalSupport[voter['Political Support']] = (politicalSupport[voter['Political Support']] || 0) + 1;
        }

        // Special conditions
        if (voter['Has Disability'] === 'Yes') specialConditions['Has Disability']++;
        if (voter['Is Migrated'] === 'Yes') specialConditions['Is Migrated']++;
        if (voter.Student === 'Yes') specialConditions['Student']++;

        // Location stats (for super admin view)
        if (userProfile?.role === 'super_admin') {
          if (voter.division_id) {
            locationStats.divisions[voter.division_id] = (locationStats.divisions[voter.division_id] || 0) + 1;
          }
          if (voter.district_id) {
            locationStats.districts[voter.district_id] = (locationStats.districts[voter.district_id] || 0) + 1;
          }
          if (voter.upazila_id) {
            locationStats.upazilas[voter.upazila_id] = (locationStats.upazilas[voter.upazila_id] || 0) + 1;
          }
          if (voter.union_id) {
            locationStats.unions[voter.union_id] = (locationStats.unions[voter.union_id] || 0) + 1;
          }
          if (voter.village_id) {
            locationStats.villages[voter.village_id] = (locationStats.villages[voter.village_id] || 0) + 1;
          }
        }
      });

      return {
        totalVoters: voters.length,
        ageGroups: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
        genderDistribution: Object.entries(genderDistribution).map(([name, value]) => ({ name, value })),
        voteIntention: Object.entries(voteIntention).map(([name, value]) => ({ name, value })),
        educationLevels: Object.entries(educationLevels).slice(0, 10).map(([name, value]) => ({ name, value })),
        occupations: Object.entries(occupations).slice(0, 10).map(([name, value]) => ({ name, value })),
        politicalSupport: Object.entries(politicalSupport).slice(0, 10).map(([name, value]) => ({ name, value })),
        specialConditions: Object.entries(specialConditions).map(([name, value]) => ({ name, value })),
        avgVoteProbability: voters.length > 0 ? voters.reduce((sum, v) => sum + (v['Vote Probability (%)'] || 0), 0) / voters.length : 0,
        highProbabilityVoters: voters.filter(v => v['Vote Probability (%)'] && v['Vote Probability (%)'] >= 70).length,
        votersWithPhone: voters.filter(v => v.Phone).length,
        locationStats
      };
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  const COLORS = ['#059669', '#DC2626', '#D97706', '#7C3AED', '#2563EB', '#DB2777'];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">ডেটা লোড হচ্ছে...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">বিশ্লেষণ ও পরিসংখ্যান</h1>
          {userProfile?.role === 'super_admin' && (
            <Button
              variant="outline"
              onClick={() => setShowLocationFilter(!showLocationFilter)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              এলাকা ফিল্টার
            </Button>
          )}
        </div>

        {/* Location Filter for Super Admin */}
        {userProfile?.role === 'super_admin' && showLocationFilter && (
          <Card className="shadow-md border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                এলাকা ভিত্তিক ফিল্টার
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">বিভাগ</label>
                  <Select
                    value={selectedLocation.division_id || "all"}
                    onValueChange={(value) => setSelectedLocation({ ...selectedLocation, division_id: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব বিভাগ</SelectItem>
                      {locationData.divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">জেলা</label>
                  <Select
                    value={selectedLocation.district_id || "all"}
                    onValueChange={(value) => setSelectedLocation({ ...selectedLocation, district_id: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব জেলা</SelectItem>
                      {locationData.districts
                        .filter(district => !selectedLocation.division_id || district.division_id === selectedLocation.division_id)
                        .map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">উপজেলা</label>
                  <Select
                    value={selectedLocation.upazila_id || "all"}
                    onValueChange={(value) => setSelectedLocation({ ...selectedLocation, upazila_id: value === "all" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব উপজেলা</SelectItem>
                      {locationData.upazilas
                        .filter(upazila => !selectedLocation.district_id || upazila.district_id === selectedLocation.district_id)
                        .map((upazila) => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLocation({})}
                  className="text-xs"
                >
                  ফিল্টার রিসেট করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ভোটার</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalVoters || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userProfile?.role !== 'super_admin' && userProfile?.accessScope && (
                  <>
                    {userProfile.accessScope.village_name || 
                     userProfile.accessScope.union_name || 
                     userProfile.accessScope.upazila_name || 
                     userProfile.accessScope.district_name || 
                     userProfile.accessScope.division_name} এলাকায়
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">গড় ভোট সম্ভাবনা</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics?.avgVoteProbability || 0)}%</div>
              <p className="text-xs text-muted-foreground">সকল ভোটারের গড়</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">উচ্চ সম্ভাবনা</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.highProbabilityVoters || 0}</div>
              <p className="text-xs text-muted-foreground">৭০%+ ভোট সম্ভাবনা</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ফোন নম্বর আছে</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.votersWithPhone || 0}</div>
              <p className="text-xs text-muted-foreground">SMS পাঠানো যাবে</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>বয়সভিত্তিক বিতরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>লিঙ্গভিত্তিক বিতরণ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.genderDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vote Intention */}
          <Card>
            <CardHeader>
              <CardTitle>ভোট প্রদানের ইচ্ছা</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.voteIntention}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name === 'Yes' ? 'হ্যাঁ' : name === 'No' ? 'না' : 'অনিশ্চিত'} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.voteIntention?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Political Support */}
          <Card>
            <CardHeader>
              <CardTitle>রাজনৈতিক সমর্থন</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.politicalSupport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Education, Occupation and Special Conditions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>শিক্ষাগত যোগ্যতা (শীর্ষ ১০)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.educationLevels} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7C3AED" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>পেশা (শীর্ষ ১০)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.occupations} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>বিশেষ অবস্থা</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.specialConditions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#DB2776" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;

