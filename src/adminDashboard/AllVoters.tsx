
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { VoterData } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useDataAccess } from '@/contexts/DataAccessContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const AllVoters = () => {
  const { 
    getAccessibleVoters, 
    createVoterQuery,
    canAddVoterInLocation,
    accessScope,
    canAccessAllData 
  } = useDataAccess();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [genderFilter, setGenderFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { toast } = useToast();

  const additionalFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    if (genderFilter && genderFilter !== 'all') filters.Gender = genderFilter;
    if (priorityFilter && priorityFilter !== 'all') filters['Priority Level'] = priorityFilter;
    return filters;
  }, [genderFilter, priorityFilter]);

  const { data: votersData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['voters', accessScope, additionalFilters],
    queryFn: async () => {
      const votersQuery = createVoterQuery(additionalFilters);
      if (!votersQuery) return [];
      
      const snapshot = await getDocs(votersQuery);
      const votersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<VoterData, 'id'>)
      })) as VoterData[];
      
      return getAccessibleVoters(votersData);
    },
    enabled: !!accessScope
  });

  const filteredVoters = useMemo(() => {
    if (!Array.isArray(votersData)) return [];

    let filtered = [...votersData];

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(voter =>
        Object.values(voter).some(value =>
          typeof value === 'string' && value.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [votersData, debouncedSearchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center">ভোটার তালিকা লোড হচ্ছে...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-500">
            ভোটার তালিকা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>সকল ভোটার ({filteredVoters.length})</span>
            <div className="flex items-center space-x-4">
              <Input
                type="search"
                placeholder="নাম, আইডি, ঠিকানা দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="লিঙ্গ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                  <SelectItem value="মহিলা">মহিলা</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="অগ্রাধিকার" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব</SelectItem>
                  <SelectItem value="উচ্চ">উচ্চ</SelectItem>
                  <SelectItem value="মাঝারি">মাঝারি</SelectItem>
                  <SelectItem value="নিম্ন">নিম্ন</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Voters Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoters.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8">
              <p className="text-center text-gray-500">কোনো ভোটার পাওয়া যায়নি</p>
            </CardContent>
          </Card>
        ) : (
          filteredVoters.map((voter) => (
            <Card key={voter.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{voter.Name}</h3>
                    <p className="text-sm text-gray-600">ভোটার আইডি: {voter['Voter ID']}</p>
                  </div>
                  <Badge variant={voter.Gender === 'পুরুষ' ? 'default' : 'secondary'}>
                    {voter.Gender}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">পিতার নাম:</p>
                    <p className="font-medium">{voter['Fathers Name']}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">মাতার নাম:</p>
                    <p className="font-medium">{voter['Mothers Name']}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">ঠিকানা:</p>
                  <p className="text-sm font-medium">
                    {voter.Village}, {voter.Union}, {voter.Upazila}, {voter.District}
                  </p>
                </div>

                {voter.Mobile && (
                  <div>
                    <p className="text-sm text-gray-500">মোবাইল:</p>
                    <p className="text-sm font-medium">{voter.Mobile}</p>
                  </div>
                )}

                {voter.Occupation && (
                  <div>
                    <p className="text-sm text-gray-500">পেশা:</p>
                    <p className="text-sm font-medium">{voter.Occupation}</p>
                  </div>
                )}

                {voter['Priority Level'] && (
                  <div className="pt-2">
                    <Badge 
                      variant={
                        voter['Priority Level'] === 'উচ্চ' ? 'destructive' : 
                        voter['Priority Level'] === 'মাঝারি' ? 'default' : 'secondary'
                      }
                    >
                      অগ্রাধিকার: {voter['Priority Level']}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Table View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>বিস্তারিত তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>পিতার নাম</TableHead>
                  <TableHead>মাতার নাম</TableHead>
                  <TableHead>লিঙ্গ</TableHead>
                  <TableHead>গ্রাম</TableHead>
                  <TableHead>ইউনিয়ন</TableHead>
                  <TableHead>উপজেলা</TableHead>
                  <TableHead>জেলা</TableHead>
                  <TableHead>বিভাগ</TableHead>
                  <TableHead>ভোটার আইডি</TableHead>
                  <TableHead>মোবাইল</TableHead>
                  <TableHead>পেশা</TableHead>
                  <TableHead>রক্তের গ্রুপ</TableHead>
                  <TableHead>শিক্ষাগত যোগ্যতা</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium">{voter.Name}</TableCell>
                    <TableCell>{voter['Fathers Name']}</TableCell>
                    <TableCell>{voter['Mothers Name']}</TableCell>
                    <TableCell>{voter.Gender}</TableCell>
                    <TableCell>{voter.Village}</TableCell>
                    <TableCell>{voter.Union}</TableCell>
                    <TableCell>{voter.Upazila}</TableCell>
                    <TableCell>{voter.District}</TableCell>
                    <TableCell>{voter.Division}</TableCell>
                    <TableCell>{voter['Voter ID']}</TableCell>
                    <TableCell>{voter.Mobile}</TableCell>
                    <TableCell>{voter.Occupation}</TableCell>
                    <TableCell>{voter['Blood Group']}</TableCell>
                    <TableCell>{voter.Education}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllVoters;
