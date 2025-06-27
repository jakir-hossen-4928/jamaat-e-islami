
import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Phone, Send, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/lib/usePageTitle';

interface Voter {
  id: string;
  'Voter Name': string;
  Phone?: string;
  Age?: number;
  Gender?: string;
  'Priority Level'?: string;
  'Political Support'?: string;
}

interface SMSStatus {
  phone: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

const SMSCampaignNew = () => {
  usePageTitle('এসএমএস ক্যাম্পেইন - জামায়াতে ইসলামী');
  
  const [voters, setVoters] = useState<Voter[]>([]);
  const [selectedVoters, setSelectedVoters] = useState<Voter[]>([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [smsStatuses, setSmsStatuses] = useState<SMSStatus[]>([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const { toast } = useToast();

  // Use your API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchVoters();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setIsBalanceLoading(true);
    try {
      const responseBalance = await fetch(`${baseUrl}/getBalance`);
      if (responseBalance.ok) {
        const data = await responseBalance.json();
        setBalance(data.balance || 0);
      } else {
        throw new Error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ব্যালেন্স লোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const fetchVoters = async () => {
    try {
      const votersRef = collection(db, 'voters');
      const q = query(votersRef, where('Phone', '!=', ''));
      const querySnapshot = await getDocs(q);
      
      const votersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Voter[];

      setVoters(votersData);
      setSelectedVoters(votersData);
    } catch (error) {
      console.error('Error fetching voters:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ভোটারদের তথ্য লোড করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    }
  };

  const filterVoters = (filterType: string) => {
    setFilter(filterType);
    
    switch (filterType) {
      case 'high-priority':
        setSelectedVoters(voters.filter(v => v['Priority Level'] === 'High'));
        break;
      case 'supporters':
        setSelectedVoters(voters.filter(v => v['Political Support']?.toLowerCase().includes('জামায়াত')));
        break;
      case 'young':
        setSelectedVoters(voters.filter(v => v.Age && v.Age < 35));
        break;
      default:
        setSelectedVoters(voters);
    }
  };

  const sendMessages = async () => {
    if (!message.trim()) {
      toast({
        title: 'ত্রুটি',
        description: 'দয়া করে বার্তা লিখুন',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVoters.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'কোন ভোটার নির্বাচিত নেই',
        variant: 'destructive',
      });
      return;
    }

    const phoneNumbers = selectedVoters
      .filter(voter => voter.Phone)
      .map(voter => voter.Phone as string);

    if (phoneNumbers.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'কোন বৈধ ফোন নম্বর পাওয়া যায়নি',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setSmsStatuses(phoneNumbers.map(phone => ({ phone, status: 'pending' })));

    let sentCount = 0;
    let failedCount = 0;

    for (const phone of phoneNumbers) {
      try {
        const response = await fetch(`${baseUrl}/sendSMS`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            number: phone,
            message: message
          }),
        });

        if (response.ok) {
          setSmsStatuses(prev => prev.map(status => 
            status.phone === phone 
              ? { ...status, status: 'sent' }
              : status
          ));
          sentCount++;
        } else {
          const errorData = await response.json();
          setSmsStatuses(prev => prev.map(status => 
            status.phone === phone 
              ? { ...status, status: 'failed', error: errorData.message || 'Unknown error' }
              : status
          ));
          failedCount++;
        }
      } catch (error) {
        setSmsStatuses(prev => prev.map(status => 
          status.phone === phone 
            ? { ...status, status: 'failed', error: 'Network error' }
            : status
        ));
        failedCount++;
      }

      // Small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
    
    // Refresh balance after sending
    await fetchBalance();

    toast({
      title: 'সম্পন্ন',
      description: `${sentCount}টি এসএমএস সফলভাবে পাঠানো হয়েছে, ${failedCount}টি ব্যর্থ`,
      variant: sentCount > 0 ? 'default' : 'destructive',
    });
  };

  const getStatusIcon = (status: 'pending' | 'sent' | 'failed') => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                    এসএমএস ক্যাম্পেইন
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">ভোটারদের কাছে বার্তা পাঠান</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>ব্যালেন্স: </span>
                    {isBalanceLoading ? (
                      <span className="animate-pulse">লোড হচ্ছে...</span>
                    ) : (
                      <Badge variant="secondary">{balance} টাকা</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-green-600" />
                    <span>{selectedVoters.length} জন নির্বাচিত</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">ভোটার ফিল্টার</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => filterVoters('all')}
                  className="text-sm h-9"
                >
                  সকল ({voters.length})
                </Button>
                <Button
                  variant={filter === 'high-priority' ? 'default' : 'outline'}
                  onClick={() => filterVoters('high-priority')}
                  className="text-sm h-9"
                >
                  উচ্চ অগ্রাধিকার
                </Button>
                <Button
                  variant={filter === 'supporters' ? 'default' : 'outline'}
                  onClick={() => filterVoters('supporters')}
                  className="text-sm h-9"
                >
                  সমর্থক
                </Button>
                <Button
                  variant={filter === 'young' ? 'default' : 'outline'}
                  onClick={() => filterVoters('young')}
                  className="text-sm h-9"
                >
                  তরুণ (&lt;৩৫)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">বার্তা লিখুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="messageText" className="text-sm font-medium">এসএমএস বার্তা</Label>
                <Textarea
                  id="messageText"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="আপনার বার্তা লিখুন..."
                  className="mt-1 min-h-[100px]"
                />
                <div className="text-sm text-gray-500 mt-1">
                  অক্ষর: {message.length}/160
                </div>
              </div>

              <Button
                onClick={sendMessages}
                disabled={loading || !message.trim() || selectedVoters.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 h-11"
              >
                {loading ? (
                  'পাঠানো হচ্ছে...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {selectedVoters.length}টি এসএমএস পাঠান
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* SMS Status */}
          {smsStatuses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">এসএমএস স্ট্যাটাস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {smsStatuses.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="font-mono">{status.phone}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className={
                          status.status === 'sent' ? 'text-green-600' :
                          status.status === 'failed' ? 'text-red-600' :
                          'text-yellow-600'
                        }>
                          {status.status === 'sent' ? 'পাঠানো হয়েছে' :
                           status.status === 'failed' ? 'ব্যর্থ' : 'অপেক্ষমাণ'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SMSCampaignNew;
