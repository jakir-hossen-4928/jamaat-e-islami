
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Send, Filter, DollarSign, Wifi, Loader2 } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useVotersQuery } from '@/hooks/useOptimizedQuery';
import { getFullLocationHierarchy } from '@/lib/locationUtils';

interface SMSLog {
  timestamp: string;
  phone: string;
  status: 'success' | 'failed';
  message: string;
}

const SMSCampaign = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationNames, setLocationNames] = useState<{[key: string]: string}>({});
  const [filters, setFilters] = useState({
    willVote: 'all',
    gender: 'all',
    minAge: '',
    maxAge: '',
    maritalStatus: 'all',
    student: 'all',
    hasDisability: 'all',
    isMigrated: 'all',
  });

  // Create optimized query based on user role with pagination/limits
  const createVotersQuery = () => {
    if (!userProfile) return null;
    
    const votersCollection = collection(db, 'voters');
    
    // Apply role-based filtering with limits to reduce reads
    if (userProfile.role !== 'super_admin') {
      const userScope = userProfile.accessScope;
      if (userScope.village_id) {
        return query(votersCollection, 
          where('village_id', '==', userScope.village_id), 
          orderBy('Last Updated', 'desc'),
          limit(1000) // Limit to reduce reads
        );
      } else if (userScope.union_id) {
        return query(votersCollection, 
          where('union_id', '==', userScope.union_id), 
          orderBy('Last Updated', 'desc'),
          limit(2000)
        );
      } else if (userScope.upazila_id) {
        return query(votersCollection, 
          where('upazila_id', '==', userScope.upazila_id), 
          orderBy('Last Updated', 'desc'),
          limit(5000)
        );
      } else if (userScope.district_id) {
        return query(votersCollection, 
          where('district_id', '==', userScope.district_id), 
          orderBy('Last Updated', 'desc'),
          limit(10000)
        );
      } else if (userScope.division_id) {
        return query(votersCollection, 
          where('division_id', '==', userScope.division_id), 
          orderBy('Last Updated', 'desc'),
          limit(15000)
        );
      }
    }
    
    // For super admin, limit to recent records
    return query(votersCollection, 
      orderBy('Last Updated', 'desc'),
      limit(20000)
    );
  };

  const votersQuery = createVotersQuery();

  // Create proper query key
  const createQueryKey = () => {
    const baseKey = ['sms-voters-optimized', userProfile?.uid];
    if (userProfile?.accessScope) {
      baseKey.push(JSON.stringify(userProfile.accessScope));
    }
    return baseKey;
  };

  // Use optimized query hook
  const { data: voters = [], isLoading } = useVotersQuery({
    query: votersQuery!,
    queryKey: createQueryKey(),
    enabled: !!userProfile && !!votersQuery,
  });

  // Load location names efficiently using static data
  useEffect(() => {
    const loadLocationNames = async () => {
      if (!voters || voters.length === 0) return;
      
      const names: {[key: string]: string} = {};
      
      try {
        const uniqueVoters = voters.filter((voter, index, self) => 
          index === self.findIndex(v => 
            v.division_id === voter.division_id &&
            v.district_id === voter.district_id &&
            v.upazila_id === voter.upazila_id &&
            v.union_id === voter.union_id
          )
        );

        for (const voter of uniqueVoters.slice(0, 50)) { // Limit location lookups
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

  // Fetch SMS balance with caching
  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const responseBalance = await fetch(`${baseUrl}/getBalance`);
      if (responseBalance.ok) {
        const data = await responseBalance.json();
        setBalance(data.balance || 0);
      } else {
        throw new Error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      toast({
        title: 'ব্যালেন্স লোড ত্রুটি',
        description: 'SMS ব্যালেন্স লোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Optimized filter function with early returns
  const filteredVoters = voters ? voters.filter((voter) => {
    // Early return for voters without phone numbers
    if (!voter.Phone) return false;

    // Search filter with early return
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        voter['Voter Name']?.toLowerCase().includes(term) ||
        voter.Phone?.includes(term) ||
        voter.ID?.toLowerCase().includes(term);
      
      if (!matchesSearch) return false;
    }

    // Advanced filters with early returns
    if (filters.willVote !== 'all' && voter['Will Vote'] !== filters.willVote) return false;
    if (filters.gender !== 'all' && voter.Gender !== filters.gender) return false;
    if (filters.minAge && (!voter.Age || voter.Age < parseInt(filters.minAge))) return false;
    if (filters.maxAge && (!voter.Age || voter.Age > parseInt(filters.maxAge))) return false;
    if (filters.maritalStatus !== 'all' && voter['Marital Status'] !== filters.maritalStatus) return false;
    if (filters.student !== 'all' && voter.Student !== filters.student) return false;
    if (filters.hasDisability !== 'all' && voter['Has Disability'] !== filters.hasDisability) return false;
    if (filters.isMigrated !== 'all' && voter['Is Migrated'] !== filters.isMigrated) return false;

    return true;
  }) : [];

  console.log('Total voters loaded:', voters ? voters.length : 0);
  console.log('Filtered voters:', filteredVoters.length);

  const selectedVoterData = filteredVoters.filter((voter) => selectedVoters.includes(voter.id!));
  const estimatedCost = selectedVoters.length * 0.35;

  const getLocationName = (voter: VoterData) => {
    const locationKey = `${voter.division_id}_${voter.district_id}_${voter.upazila_id}_${voter.union_id}`;
    return locationNames[locationKey] || 'অজানা এলাকা';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVoters(filteredVoters.map((v) => v.id!));
    } else {
      setSelectedVoters([]);
    }
  };

  const handleVoterSelect = (voterId: string, checked: boolean) => {
    if (checked) {
      setSelectedVoters([...selectedVoters, voterId]);
    } else {
      setSelectedVoters(selectedVoters.filter((id) => id !== voterId));
    }
  };

  const sendSMS = async () => {
    if (!message.trim()) {
      toast({
        title: 'ত্রুটি',
        description: 'অনুগ্রহ করে SMS বার্তা লিখুন',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVoters.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'অনুগ্রহ করে কমপক্ষে একজন ভোটার নির্বাচন করুন',
        variant: 'destructive',
      });
      return;
    }

    if (balance !== null && estimatedCost > balance) {
      toast({
        title: 'অপর্যাপ্ত ব্যালেন্স',
        description: `SMS পাঠানোর জন্য ৳${estimatedCost.toFixed(2)} প্রয়োজন, কিন্তু আপনার ব্যালেন্স ৳${balance.toFixed(2)}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const phoneNumbers = selectedVoterData.map((voter) => voter.Phone).filter(Boolean);
      const newLogs: SMSLog[] = [];

      for (const phone of phoneNumbers) {
        try {
          const response = await fetch(`${baseUrl}/sendSMS`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              number: phone,
              message: message,
            }),
          });

          const log: SMSLog = {
            timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
            phone,
            status: response.ok ? 'success' : 'failed',
            message: response.ok ? 'SMS sent successfully' : `Failed to send SMS to ${phone}`,
          };
          newLogs.push(log);

          if (!response.ok) {
            throw new Error(`Failed to send SMS to ${phone}`);
          }
        } catch (error: any) {
          newLogs.push({
            timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
            phone,
            status: 'failed',
            message: error.message || `Failed to send SMS to ${phone}`,
          });
        }
      }

      setSmsLogs((prev) => [...newLogs, ...prev]);
      toast({
        title: 'SMS পাঠানো সম্পন্ন',
        description: `${phoneNumbers.length} জন ভোটারের কাছে SMS পাঠানোর চেষ্টা করা হয়েছে`,
      });

      setMessage('');
      setSelectedVoters([]);
      fetchBalance();
    } catch (error: any) {
      console.error('SMS sending error:', error);
      toast({
        title: 'SMS পাঠানো ব্যর্থ',
        description: error.message || 'SMS পাঠাতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const placeholders = [
    { key: '{name}', label: 'নাম' },
    { key: '{phone}', label: 'ফোন' },
    { key: '{age}', label: 'বয়স' },
  ];

  const insertPlaceholder = (placeholder: string) => {
    setMessage((prev) => `${prev}${placeholder} `);
  };

  const resetFilters = () => {
    setFilters({
      willVote: 'all',
      gender: 'all',
      minAge: '',
      maxAge: '',
      maritalStatus: 'all',
      student: 'all',
      hasDisability: 'all',
      isMigrated: 'all',
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SMS ক্যাম্পেইন</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Card className="shadow-lg border-l-4 border-l-blue-600">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">SMS ব্যালেন্স</p>
                    <p className="text-lg font-bold text-blue-600">
                      {isLoadingBalance ? 'লোড হচ্ছে...' : balance !== null ? `৳${balance.toFixed(2)}` : 'N/A'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchBalance}
                    disabled={isLoadingBalance}
                    className="ml-2"
                  >
                    <Wifi className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 w-4 text-blue-600" />
              <span>নির্বাচিত: {selectedVoters.length}</span>
              <Badge variant="outline">খরচ: ৳{estimatedCost.toFixed(2)}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                <MessageSquare className="w-5 h-5" />
                বার্তা লিখুন
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Textarea
                placeholder="আপনার SMS বার্তা এখানে লিখুন..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium mb-2">প্লেসহোল্ডার ব্যবহার করুন:</p>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map((placeholder) => (
                    <Button
                      key={placeholder.key}
                      size="sm"
                      variant="outline"
                      onClick={() => insertPlaceholder(placeholder.key)}
                      className="text-xs border-gray-300 hover:bg-blue-50"
                    >
                      {placeholder.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>বার্তার দৈর্ঘ্য: {message.length}/160</span>
                <span>SMS পার্ট: {Math.ceil(message.length / 160)}</span>
              </div>
              <Button
                onClick={sendSMS}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-colors duration-200"
                disabled={selectedVoters.length === 0 || !message.trim() || isSending}
              >
                <Send className="w-4 h-4" />
                {isSending ? 'পাঠানো হচ্ছে...' : `SMS পাঠান (${selectedVoters.length} জন)`}
              </Button>
              {/* SMS Logs */}
              <Card className="mt-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">SMS পাঠানোর লগ</CardTitle>
                </CardHeader>
                <CardContent>
                  {smsLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">কোনো লগ পাওয়া যায়নি</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {smsLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded text-sm ${log.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}
                        >
                          <p className="font-medium">{log.timestamp}</p>
                          <p>ফোন: {log.phone}</p>
                          <p>স্ট্যাটাস: {log.status === 'success' ? 'সফল' : 'ব্যর্থ'}</p>
                          <p>বিস্তারিত: {log.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Voter Selection */}
          <Card className="shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Users className="w-5 h-5" />
                  ভোটার নির্বাচন ({filteredVoters.length})
                </div>
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 text-xs">
                      <Filter className="w-4 h-4" />
                      ফিল্টার
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-[95vw] sm:max-w-lg p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">অ্যাডভান্সড ফিল্টার</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="willVote" className="text-sm font-medium">ভোট দেবেন?</Label>
                        <Select
                          value={filters.willVote}
                          onValueChange={(value) => setFilters({ ...filters, willVote: value })}
                        >
                          <SelectTrigger id="willVote" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="gender" className="text-sm font-medium">লিঙ্গ</Label>
                        <Select
                          value={filters.gender}
                          onValueChange={(value) => setFilters({ ...filters, gender: value })}
                        >
                          <SelectTrigger id="gender" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Male">পুরুষ</SelectItem>
                            <SelectItem value="Female">মহিলা</SelectItem>
                            <SelectItem value="Other">অন্যান্য</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maritalStatus" className="text-sm font-medium">বৈবাহিক অবস্থা</Label>
                        <Select
                          value={filters.maritalStatus}
                          onValueChange={(value) => setFilters({ ...filters, maritalStatus: value })}
                        >
                          <SelectTrigger id="maritalStatus" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Married">বিবাহিত</SelectItem>
                            <SelectItem value="Unmarried">অবিবাহিত</SelectItem>
                            <SelectItem value="Widowed">বিধবা</SelectItem>
                            <SelectItem value="Divorced">তালাকপ্রাপ্ত</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="student" className="text-sm font-medium">ছাত্র/ছাত্রী</Label>
                        <Select
                          value={filters.student}
                          onValueChange={(value) => setFilters({ ...filters, student: value })}
                        >
                          <SelectTrigger id="student" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hasDisability" className="text-sm font-medium">প্রতিবন্ধী কিনা</Label>
                        <Select
                          value={filters.hasDisability}
                          onValueChange={(value) => setFilters({ ...filters, hasDisability: value })}
                        >
                          <SelectTrigger id="hasDisability" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="isMigrated" className="text-sm font-medium">প্রবাসী কিনা</Label>
                        <Select
                          value={filters.isMigrated}
                          onValueChange={(value) => setFilters({ ...filters, isMigrated: value })}
                        >
                          <SelectTrigger id="isMigrated" className="mt-1">
                            <SelectValue placeholder="সবাই" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সবাই</SelectItem>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="minAge" className="text-sm font-medium">সর্বনিম্ন বয়স</Label>
                        <Input
                          id="minAge"
                          type="number"
                          placeholder="বয়স"
                          value={filters.minAge}
                          onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxAge" className="text-sm font-medium">সর্বোচ্চ বয়স</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          placeholder="বয়স"
                          value={filters.maxAge}
                          onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => {
                          setIsFilterOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ফিল্টার প্রয়োগ
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        ফিল্টার রিসেট
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVoters.length === filteredVoters.length && filteredVoters.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">সবাই নির্বাচন করুন ({filteredVoters.length})</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  </div>
                ) : filteredVoters.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">কোনো ভোটার পাওয়া যায়নি</p>
                ) : (
                  filteredVoters.map((voter) => (
                    <div
                      key={voter.id}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200"
                    >
                      <Checkbox
                        checked={selectedVoters.includes(voter.id!)}
                        onCheckedChange={(checked) => handleVoterSelect(voter.id!, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{voter['Voter Name']}</p>
                        <p className="text-xs text-gray-600">{voter.Phone || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{getLocationName(voter)}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant={voter['Will Vote'] === 'Yes' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {voter['Will Vote'] === 'Yes' ? 'ভোট দেবেন' : voter['Will Vote'] === 'No' ? 'ভোট দেবেন না' : 'N/A'}
                          </Badge>
                          {voter.Gender && (
                            <Badge variant="outline" className="text-xs">
                              {voter.Gender === 'Male' ? 'পুরুষ' : voter.Gender === 'Female' ? 'মহিলা' : 'অন্যান্য'}
                            </Badge>
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
      </div>
    </AdminLayout>
  );
};

export default SMSCampaign;
