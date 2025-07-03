import React, { useState, useMemo, useEffect } from 'react';
import { collection, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Phone,
  Filter,
  Target,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import VoterLocationFilter from '@/components/admin/VoterLocationFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { VoterData, SMSCampaign } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/hooks/use-toast';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import { useVotersQuery } from '@/hooks/useOptimizedQuery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SMSCampaignComponent = () => {
  usePageTitle('এসএমএস ক্যাম্পেইন - অ্যাডমিন প্যানেল');
  
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading: locationLoading
  } = useLocationFilter();

  // Create voters query without limits
  const createVotersQuery = () => {
    if (!userProfile) return null;
    
    const votersCollection = collection(db, 'voters');
    
    if (userProfile.role === 'village_admin' && userProfile.accessScope?.village_id) {
      console.log('Creating SMS campaign query for village admin:', userProfile.accessScope.village_id);
      return query(votersCollection, 
        where('village_id', '==', userProfile.accessScope.village_id), 
        orderBy('Last Updated', 'desc')
      );
    } else if (userProfile.role === 'super_admin') {
      if (selectedLocation.village_id) {
        return query(votersCollection, 
          where('village_id', '==', selectedLocation.village_id), 
          orderBy('Last Updated', 'desc')
        );
      } else if (selectedLocation.union_id) {
        return query(votersCollection, 
          where('union_id', '==', selectedLocation.union_id), 
          orderBy('Last Updated', 'desc')
        );
      } else if (selectedLocation.upazila_id) {
        return query(votersCollection, 
          where('upazila_id', '==', selectedLocation.upazila_id), 
          orderBy('Last Updated', 'desc')
        );
      } else if (selectedLocation.district_id) {
        return query(votersCollection, 
          where('district_id', '==', selectedLocation.district_id), 
          orderBy('Last Updated', 'desc')
        );
      } else if (selectedLocation.division_id) {
        return query(votersCollection, 
          where('division_id', '==', selectedLocation.division_id), 
          orderBy('Last Updated', 'desc')
        );
      }
      // Default query for super admin
      return query(votersCollection, orderBy('Last Updated', 'desc'));
    }
    
    return null;
  };

  const votersQuery = createVotersQuery();

  const createQueryKey = () => {
    const baseKey = ['sms-voters', userProfile?.uid];
    if (userProfile?.role === 'village_admin') {
      baseKey.push(userProfile.accessScope?.village_id);
    } else if (selectedLocation && Object.keys(selectedLocation).length > 0) {
      baseKey.push(JSON.stringify(selectedLocation));
    }
    return baseKey;
  };

  const { data: queryData, isLoading: votersLoading, error } = useVotersQuery({
    query: votersQuery!,
    queryKey: createQueryKey(),
    enabled: !!userProfile && !!votersQuery,
  });

  // Ensure allVoters is always an array
  const allVoters: VoterData[] = Array.isArray(queryData) ? queryData : [];
  
  console.log('SMS Campaign - All voters:', allVoters.length);

  // Filter voters based on criteria with enhanced caching
  const targetVoters = useMemo(() => {
    if (!Array.isArray(allVoters) || allVoters.length === 0) return [];
    
    let filtered = allVoters;

    // Apply audience filters
    switch (targetAudience) {
      case 'will-vote':
        filtered = filtered.filter(voter => voter['Will Vote'] === 'Yes');
        break;
      case 'wont-vote':
        filtered = filtered.filter(voter => voter['Will Vote'] === 'No');
        break;
      case 'with-phone':
        filtered = filtered.filter(voter => voter.Phone);
        break;
      case 'high-probability':
        filtered = filtered.filter(voter => 
          voter['Vote Probability (%)'] && voter['Vote Probability (%)'] >= 70
        );
        break;
      case 'all':
      default:
        break;
    }

    // Only return voters with phone numbers for SMS
    return filtered.filter(voter => voter.Phone);
  }, [allVoters, targetAudience]);

  const handleSendCampaign = async () => {
    if (!campaignName.trim() || !message.trim()) {
      toast({
        title: 'ত্রুটি',
        description: 'ক্যাম্পেইনের নাম এবং বার্তা প্রয়োজন',
        variant: 'destructive',
      });
      return;
    }

    if (!Array.isArray(targetVoters) || targetVoters.length === 0) {
      toast({
        title: 'ত্রুটি',
        description: 'কোন টার্গেট ভোটার পাওয়া যায়নি',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const campaign: Omit<SMSCampaign, 'id'> = {
        name: campaignName,
        message: message,
        targetAudience: [targetAudience],
        sentCount: targetVoters.length,
        status: 'sent',
        createdAt: new Date().toISOString(),
        createdBy: userProfile!.uid,
        locationScope: selectedLocation
      };

      await addDoc(collection(db, 'sms_campaigns'), campaign);

      toast({
        title: 'সফল',
        description: `${targetVoters.length} জন ভোটারের কাছে এসএমএস পাঠানো হয়েছে`,
      });

      // Reset form
      setCampaignName('');
      setMessage('');
      setTargetAudience('all');
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: 'ত্রুটি',
        description: 'ক্যাম্পেইন পাঠাতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    console.error('SMS Campaign error:', error);
    return (
      <RoleBasedSidebar>
        <div className="text-center py-8">
          <p className="text-red-600">ডেটা লোড করতে সমস্যা হয়েছে</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
        </div>
      </RoleBasedSidebar>
    );
  }

  return (
    <RoleBasedSidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-4 lg:p-6 text-white">
            <h1 className="text-xl lg:text-3xl font-bold">এসএমএস ক্যাম্পেইন</h1>
            <p className="mt-2 text-purple-100 text-sm lg:text-base">ভোটারদের কাছে বার্তা পাঠান</p>
          </div>

          {/* Location Filter - Show only for super_admin */}
          {userProfile?.role === 'super_admin' && (
            <VoterLocationFilter
              locationData={locationData}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              userRole={userProfile.role}
              disabled={locationLoading}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  নতুন ক্যাম্পেইন তৈরি করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ক্যাম্পেইনের নাম</label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="যেমন: ভোট দেওয়ার আহ্বান"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">টার্গেট অডিয়েন্স</label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="অডিয়েন্স নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সকল ভোটার</SelectItem>
                      <SelectItem value="will-vote">যারা ভোট দিবে</SelectItem>
                      <SelectItem value="wont-vote">যারা ভোট দিবে না</SelectItem>
                      <SelectItem value="high-probability">উচ্চ সম্ভাবনা</SelectItem>
                      <SelectItem value="with-phone">ফোন নম্বর আছে</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">বার্তা</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="আপনার বার্তা লিখুন..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    অক্ষর: {message.length}/160
                  </p>
                </div>

                <Button 
                  onClick={handleSendCampaign}
                  disabled={isLoading || votersLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      পাঠানো হচ্ছে...
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      ক্যাম্পেইন পাঠান
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Target Audience Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  টার্গেট অডিয়েন্স প্রিভিউ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {votersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-6 w-6 text-blue-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">মোট ভোটার</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {Array.isArray(allVoters) ? allVoters.length : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Phone className="h-6 w-6 text-green-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">টার্গেট</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Array.isArray(targetVoters) ? targetVoters.length : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">ফিল্টার তথ্য:</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {targetAudience === 'all' && 'সকল ভোটার'}
                          {targetAudience === 'will-vote' && 'যারা ভোট দিবে'}
                          {targetAudience === 'wont-vote' && 'যারা ভোট দিবে না'}
                          {targetAudience === 'high-probability' && 'উচ্চ সম্ভাবনা'}
                          {targetAudience === 'with-phone' && 'ফোন নম্বর আছে'}
                        </Badge>
                        <Badge variant="outline">
                          শুধু ফোন নম্বর সহ ভোটার
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default SMSCampaignComponent;
