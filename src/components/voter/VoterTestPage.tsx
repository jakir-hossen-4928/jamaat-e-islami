
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVoterOperations } from '@/hooks/useVoterOperations';
import { useDebounce } from '@/hooks/useDebounce';
import VirtualizedVoterList from './VirtualizedVoterList';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { VoterData } from '@/lib/types';
import { Plus, Search, Users } from 'lucide-react';

const VoterTestPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newVoter, setNewVoter] = useState({
    Name: '',
    FatherOrHusband: '',
    'Mothers Name': '',
    ID: '',
    Phone: '',
    'Village Name': '',
    'Will Vote': 'Yes' as 'Yes' | 'No',
    'Vote Probability (%)': 50
  });
  const [mockVoters, setMockVoters] = useState<VoterData[]>([
    {
      id: '1',
      Name: 'আহমেদ হাসান',
      FatherOrHusband: 'আবদুল হাসান',
      'Mothers Name': 'ফাতেমা বেগম',
      ID: 'V001',
      Phone: '01711111111',
      'Village Name': 'রামপুর',
      'Will Vote': 'Yes',
      'Vote Probability (%)': 85,
      'Last Updated': new Date().toISOString()
    },
    {
      id: '2',
      Name: 'ফাতেমা খাতুন',
      FatherOrHusband: 'আবদুল করিম',
      'Mothers Name': 'রাবিয়া বেগম',
      ID: 'V002',
      Phone: '01722222222',
      'Village Name': 'শ্যামপুর',
      'Will Vote': 'No',
      'Vote Probability (%)': 30,
      'Last Updated': new Date().toISOString()
    }
  ]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { addVoter, updateVoter, deleteVoter, isLoading } = useVoterOperations({
    onSuccess: () => {
      console.log('Operation successful');
    },
    onError: (error) => {
      console.error('Operation failed:', error);
    }
  });

  const filteredVoters = mockVoters.filter(voter =>
    voter.Name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    voter.ID?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    voter.Phone?.includes(debouncedSearchTerm)
  );

  const handleAddVoter = async () => {
    try {
      // For testing, we'll add to mock data instead of Firebase
      const newId = Date.now().toString();
      const voterWithId: VoterData = {
        ...newVoter,
        id: newId,
        'Last Updated': new Date().toISOString()
      };
      
      setMockVoters(prev => [...prev, voterWithId]);
      
      // Reset form
      setNewVoter({
        Name: '',
        FatherOrHusband: '',
        'Mothers Name': '',
        ID: '',
        Phone: '',
        'Village Name': '',
        'Will Vote': 'Yes',
        'Vote Probability (%)': 50
      });
      
      console.log('Mock voter added:', voterWithId);
    } catch (error) {
      console.error('Error adding voter:', error);
    }
  };

  const handleEditVoter = (voter: VoterData) => {
    console.log('Edit voter:', voter);
    // For testing, just log the action
  };

  const handleDeleteVoter = async (voterId: string) => {
    try {
      // For testing, remove from mock data
      setMockVoters(prev => prev.filter(v => v.id !== voterId));
      console.log('Mock voter deleted:', voterId);
    } catch (error) {
      console.error('Error deleting voter:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
                ভোটার ম্যানেজমেন্ট টেস্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  মোট ভোটার: {mockVoters.length}
                </Badge>
                <Badge variant="outline">
                  ফিল্টার করা: {filteredVoters.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">ভোটার তালিকা</TabsTrigger>
              <TabsTrigger value="add">নতুন ভোটার</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Voter List */}
              <VirtualizedVoterList
                voters={filteredVoters}
                onEdit={handleEditVoter}
                onDelete={handleDeleteVoter}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    নতুন ভোটার যোগ করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">নাম</label>
                      <Input
                        value={newVoter.Name}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, Name: e.target.value }))}
                        placeholder="ভোটারের নাম"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">পিতা/স্বামীর নাম</label>
                      <Input
                        value={newVoter.FatherOrHusband}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, FatherOrHusband: e.target.value }))}
                        placeholder="পিতা/স্বামীর নাম"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">মাতার নাম</label>
                      <Input
                        value={newVoter['Mothers Name']}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, 'Mothers Name': e.target.value }))}
                        placeholder="মাতার নাম"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">আইডি</label>
                      <Input
                        value={newVoter.ID}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, ID: e.target.value }))}
                        placeholder="ভোটার আইডি"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ফোন</label>
                      <Input
                        value={newVoter.Phone}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, Phone: e.target.value }))}
                        placeholder="ফোন নম্বর"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">গ্রাম</label>
                      <Input
                        value={newVoter['Village Name']}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, 'Village Name': e.target.value }))}
                        placeholder="গ্রামের নাম"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ভোট দিবে?</label>
                      <select 
                        value={newVoter['Will Vote']}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, 'Will Vote': e.target.value as 'Yes' | 'No' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Yes">হ্যাঁ</option>
                        <option value="No">না</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ভোটের সম্ভাবনা (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={newVoter['Vote Probability (%)']}
                        onChange={(e) => setNewVoter(prev => ({ ...prev, 'Vote Probability (%)': parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddVoter}
                    disabled={isLoading || !newVoter.Name || !newVoter.ID || !newVoter.FatherOrHusband || !newVoter['Mothers Name']}
                    className="w-full"
                  >
                    {isLoading ? 'যোগ করা হচ্ছে...' : 'ভোটার যোগ করুন'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VoterTestPage;
