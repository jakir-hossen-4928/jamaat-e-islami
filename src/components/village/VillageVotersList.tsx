
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Eye, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleBasedDataAccess } from '@/hooks/useRoleBasedDataAccess';
import { useVotersQuery } from '@/hooks/useOptimizedQuery';

const VillageVotersList = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { createVoterQuery } = useRoleBasedDataAccess();
  
  // Create the query for village admin
  const votersQuery = createVoterQuery();
  
  const { data: voters = [], isLoading, error } = useVotersQuery({
    query: votersQuery!,
    queryKey: ['village-voters', userProfile?.accessScope?.village_id],
    enabled: !!userProfile?.accessScope?.village_id && !!votersQuery,
  });

  const filteredVoters = voters.filter(voter =>
    voter.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.Phone?.includes(searchTerm)
  );

  const stats = {
    total: voters.length,
    willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
    highProbability: voters.filter(v => (v['Vote Probability (%)'] || 0) >= 70).length,
    withPhone: voters.filter(v => v.Phone).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">
          <p className="text-red-600">ডেটা লোড করতে সমস্যা হয়েছে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold">আমার এলাকার ভোটার</h1>
        <p className="mt-2 text-blue-100">
          {userProfile?.accessScope?.village_name && `গ্রাম: ${userProfile.accessScope.village_name}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ফোন আছে</p>
                <p className="text-2xl font-bold text-orange-600">{stats.withPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Voters List */}
      <Card>
        <CardHeader>
          <CardTitle>ভোটার তালিকা ({filteredVoters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVoters.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">কোন ভোটার পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVoters.map((voter) => (
                <div key={voter.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {voter.Name?.charAt(0) || 'V'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900">{voter.Name}</h3>
                        <p className="text-sm text-gray-600">আইডি: {voter.ID}</p>
                        <p className="text-sm text-gray-600">পিতা/স্বামী: {voter.FatherOrHusband}</p>
                        {voter.Phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {voter.Phone}
                          </div>
                        )}
                        {voter.Age && (
                          <p className="text-sm text-gray-600">বয়স: {voter.Age}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VillageVotersList;
