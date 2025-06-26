
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Send, Filter, DollarSign, Wifi } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const SMSCampaign = () => {
  const [message, setMessage] = useState('');
  const [selectedVoters, setSelectedVoters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filters, setFilters] = useState({
    willVote: '',
    priority: '',
    gender: '',
    minAge: '',
    maxAge: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const { data: voters = [], isLoading } = useQuery({
    queryKey: ['voters'],
    queryFn: async () => {
      const votersRef = collection(db, 'voters');
      const snapshot = await getDocs(votersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    }
  });

  // Fetch SMS balance
  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch('https://jammat-e-islami.vercel.app/getBalance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      } else {
        throw new Error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      toast({
        title: "ব্যালেন্স লোড ত্রুটি",
        description: "SMS ব্যালেন্স লোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const filteredVoters = voters.filter(voter => {
    const matchesSearch = voter['Voter Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.Phone?.includes(searchTerm);
    
    const matchesWillVote = !filters.willVote || voter['Will Vote'] === filters.willVote;
    const matchesPriority = !filters.priority || voter['Priority Level'] === filters.priority;
    const matchesGender = !filters.gender || voter.Gender === filters.gender;
    const matchesMinAge = !filters.minAge || (voter.Age && voter.Age >= parseInt(filters.minAge));
    const matchesMaxAge = !filters.maxAge || (voter.Age && voter.Age <= parseInt(filters.maxAge));
    
    return matchesSearch && matchesWillVote && matchesPriority && matchesGender && 
           matchesMinAge && matchesMaxAge && voter.Phone;
  });

  const selectedVoterData = filteredVoters.filter(voter => selectedVoters.includes(voter.id!));
  const estimatedCost = selectedVoters.length * 0.35;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVoters(filteredVoters.map(v => v.id!));
    } else {
      setSelectedVoters([]);
    }
  };

  const handleVoterSelect = (voterId: string, checked: boolean) => {
    if (checked) {
      setSelectedVoters([...selectedVoters, voterId]);
    } else {
      setSelectedVoters(selectedVoters.filter(id => id !== voterId));
    }
  };

  const sendSMS = async () => {
    if (!message.trim()) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে SMS বার্তা লিখুন",
        variant: "destructive",
      });
      return;
    }

    if (selectedVoters.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে কমপক্ষে একজন ভোটার নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (balance !== null && estimatedCost > balance) {
      toast({
        title: "অপর্যাপ্ত ব্যালেন্স",
        description: `SMS পাঠানোর জন্য ৳${estimatedCost.toFixed(2)} প্রয়োজন, কিন্তু আপনার ব্যালেন্স ৳${balance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const phoneNumbers = selectedVoterData.map(voter => voter.Phone).filter(Boolean);
      
      for (const phone of phoneNumbers) {
        const response = await fetch('https://jammat-e-islami.vercel.app/sendSMS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone,
            message: message
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send SMS to ${phone}`);
        }
      }

      toast({
        title: "SMS পাঠানো সম্পন্ন",
        description: `${selectedVoters.length} জন ভোটারের কাছে SMS সফলভাবে পাঠানো হয়েছে`,
      });

      // Reset form and refresh balance
      setMessage('');
      setSelectedVoters([]);
      fetchBalance();
      
    } catch (error: any) {
      console.error('SMS sending error:', error);
      toast({
        title: "SMS পাঠানো ব্যর্থ",
        description: error.message || "SMS পাঠাতে সমস্যা হয়েছে",
        variant: "destructive",
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
    setMessage(prev => `${prev}${placeholder} `);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Header with Balance */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SMS ক্যাম্পেইন</h1>
          <div className="flex items-center gap-4">
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
                  >
                    <Wifi className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center space-x-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">নির্বাচিত: {selectedVoters.length}</span>
              <Badge variant="outline">খরচ: ৳{estimatedCost.toFixed(2)}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Message Composition */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>বার্তা লিখুন</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="আপনার SMS বার্তা এখানে লিখুন..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none text-sm"
              />
              
              <div>
                <p className="text-sm font-medium mb-2">প্লেসহোল্ডার ব্যবহার করুন:</p>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map(placeholder => (
                    <Button
                      key={placeholder.key}
                      size="sm"
                      variant="outline"
                      onClick={() => insertPlaceholder(placeholder.key)}
                      className="text-xs"
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
                className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
                disabled={selectedVoters.length === 0 || !message.trim() || isSending}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'পাঠানো হচ্ছে...' : `SMS পাঠান (${selectedVoters.length} জন)`}
              </Button>
            </CardContent>
          </Card>

          {/* Voter Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>ভোটার নির্বাচন</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  ফিল্টার
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />

              {showFilters && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                  <select
                    className="p-2 border rounded text-sm"
                    value={filters.willVote}
                    onChange={(e) => setFilters({...filters, willVote: e.target.value})}
                  >
                    <option value="">ভোট দেবেন?</option>
                    <option value="Yes">হ্যাঁ</option>
                    <option value="No">না</option>
                  </select>
                  
                  <select
                    className="p-2 border rounded text-sm"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  >
                    <option value="">অগ্রাধিকার</option>
                    <option value="High">উচ্চ</option>
                    <option value="Medium">মাঝারি</option>
                    <option value="Low">নিম্ন</option>
                  </select>
                  
                  <select
                    className="p-2 border rounded text-sm"
                    value={filters.gender}
                    onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  >
                    <option value="">লিঙ্গ</option>
                    <option value="Male">পুরুষ</option>
                    <option value="Female">মহিলা</option>
                  </select>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="সর্বনিম্ন বয়স"
                      type="number"
                      value={filters.minAge}
                      onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedVoters.length === filteredVoters.length && filteredVoters.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">সবাই নির্বাচন করুন ({filteredVoters.length})</span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="text-center py-4 text-sm">লোড হচ্ছে...</div>
                ) : (
                  filteredVoters.map(voter => (
                    <div key={voter.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors duration-200">
                      <Checkbox
                        checked={selectedVoters.includes(voter.id!)}
                        onCheckedChange={(checked) => handleVoterSelect(voter.id!, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{voter['Voter Name']}</p>
                        <p className="text-xs text-gray-600">{voter.Phone}</p>
                        <div className="flex space-x-2 text-xs mt-1">
                          <Badge variant={voter['Will Vote'] === 'Yes' ? 'default' : 'secondary'} className="text-xs">
                            {voter['Will Vote'] === 'Yes' ? 'ভোট দেবেন' : 'ভোট দেবেন না'}
                          </Badge>
                          <Badge variant={
                            voter['Priority Level'] === 'High' ? 'destructive' :
                            voter['Priority Level'] === 'Medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {voter['Priority Level'] === 'High' ? 'উচ্চ' :
                             voter['Priority Level'] === 'Medium' ? 'মাঝারি' : 'নিম্ন'}
                          </Badge>
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
