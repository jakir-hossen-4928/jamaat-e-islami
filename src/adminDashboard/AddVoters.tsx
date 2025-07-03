import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { VoterData } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { useRoleBasedDataAccess } from '@/hooks/useRoleBasedDataAccess';
import VoterLocationFilter from '@/components/admin/VoterLocationFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

interface FormState {
  'Voter Name': string;
  'Father/Husband': string;
  Mother: string;
  Address: string;
  Age: string;
  Gender: string;
  Phone: string;
  'Vote Probability (%)': string;
  'Will Vote': string;
  Remarks: string;
}

const AddVoters = () => {
  usePageTitle('নতুন ভোটার যোগ করুন - অ্যাডমিন প্যানেল');
  
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const { getDefaultVoterLocation, canAddVoterInLocation } = useRoleBasedDataAccess();
  
  const {
    locationData,
    selectedLocation,
    setSelectedLocation,
    isLoading: locationLoading
  } = useLocationFilter();

  const [formData, setFormData] = useState<FormState>({
    'Voter Name': '',
    'Father/Husband': '',
    Mother: '',
    Address: '',
    Age: '',
    Gender: '',
    Phone: '',
    'Vote Probability (%)': '',
    'Will Vote': '',
    Remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Auto-fill location for village admin
    if (userProfile?.role === 'village_admin') {
      const defaultLocation = getDefaultVoterLocation();
      setSelectedLocation(defaultLocation);
      console.log('Auto-filled location for village admin:', defaultLocation);
    }
  }, [userProfile, getDefaultVoterLocation, setSelectedLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData['Voter Name']) return 'ভোটারের নাম আবশ্যক';
    if (!formData['Father/Husband']) return 'পিতা/স্বামীর নাম আবশ্যক';
    if (!formData['Mother']) return 'মাতার নাম আবশ্যক';
    if (!formData['Address']) return 'ঠিকানা আবশ্যক';
    if (!formData['Age']) return 'বয়স আবশ্যক';
    if (!formData['Gender']) return 'লিঙ্গ আবশ্যক';
    if (!formData['Vote Probability (%)']) return 'ভোটের সম্ভাবনা আবশ্যক';
    if (!formData['Will Vote']) return 'ভোট দিবেন কিনা তা আবশ্যক';

    const age = parseInt(formData.Age);
    if (isNaN(age) || age <= 0 || age > 120) return 'বৈধ বয়স লিখুন';

    const voteProbability = parseInt(formData['Vote Probability (%)']);
    if (isNaN(voteProbability) || voteProbability < 0 || voteProbability > 100) {
      return 'ভোটের সম্ভাবনা ০-১০০ এর মধ্যে হতে হবে';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Check if user can add voter in this location
    if (!canAddVoterInLocation(selectedLocation)) {
      toast({
        title: 'অ্যাক্সেস নিষিদ্ধ',
        description: 'আপনি এই অবস্থানে ভোটার যোগ করার অনুমতি নেই',
        variant: 'destructive',
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'ফর্ম ত্রুটি',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const voterData: VoterData = {
        ...formData,
        division_id: selectedLocation.division_id || null,
        district_id: selectedLocation.district_id || null,
        upazila_id: selectedLocation.upazila_id || null,
        union_id: selectedLocation.union_id || null,
        village_id: selectedLocation.village_id || null,
        'Last Updated': new Date().toISOString()
      };

      await addDoc(collection(db, 'voters'), voterData);

      toast({
        title: 'সফল',
        description: 'নতুন ভোটার যোগ করা হয়েছে',
      });

      setFormData({
        'Voter Name': '',
        'Father/Husband': '',
        Mother: '',
        Address: '',
        Age: '',
        Gender: '',
        Phone: '',
        'Vote Probability (%)': '',
        'Will Vote': '',
        Remarks: ''
      });
    } catch (error) {
      console.error('Error adding voter:', error);
      toast({
        title: 'Error',
        description: 'ভোটার যোগ করার সময় সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleBasedSidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-4 lg:p-6 text-white">
            <h1 className="text-xl lg:text-3xl font-bold">নতুন ভোটার যোগ করুন</h1>
            <p className="mt-2 text-green-100 text-sm lg:text-base">ভোটার তথ্য সংগ্রহ ও সংরক্ষণ</p>
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

          <Card>
            <CardHeader>
              <CardTitle>ভোটারের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="voterName">ভোটারের নাম</Label>
                  <Input
                    type="text"
                    id="voterName"
                    name="Voter Name"
                    value={formData['Voter Name']}
                    onChange={handleChange}
                    placeholder="ভোটারের নাম লিখুন"
                  />
                </div>
                <div>
                  <Label htmlFor="fatherHusband">পিতা/স্বামীর নাম</Label>
                  <Input
                    type="text"
                    id="fatherHusband"
                    name="Father/Husband"
                    value={formData['Father/Husband']}
                    onChange={handleChange}
                    placeholder="পিতা/স্বামীর নাম লিখুন"
                  />
                </div>
                <div>
                  <Label htmlFor="motherName">মাতার নাম</Label>
                  <Input
                    type="text"
                    id="motherName"
                    name="Mother"
                    value={formData['Mother']}
                    onChange={handleChange}
                    placeholder="মাতার নাম লিখুন"
                  />
                </div>
                <div>
                  <Label htmlFor="address">ঠিকানা</Label>
                  <Textarea
                    id="address"
                    name="Address"
                    value={formData['Address']}
                    onChange={handleChange}
                    placeholder="সম্পূর্ণ ঠিকানা লিখুন"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">বয়স</Label>
                    <Input
                      type="number"
                      id="age"
                      name="Age"
                      value={formData.Age}
                      onChange={handleChange}
                      placeholder="বয়স লিখুন"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">লিঙ্গ</Label>
                    <Select
                      name="Gender"
                      value={formData.Gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, Gender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="পুরুষ">পুরুষ</SelectItem>
                        <SelectItem value="মহিলা">মহিলা</SelectItem>
                        <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">ফোন নম্বর (ঐচ্ছিক)</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                    placeholder="ফোন নম্বর লিখুন"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voteProbability">ভোটের সম্ভাবনা (%)</Label>
                    <Input
                      type="number"
                      id="voteProbability"
                      name="Vote Probability (%)"
                      value={formData['Vote Probability (%)']}
                      onChange={handleChange}
                      placeholder="0-100 এর মধ্যে লিখুন"
                    />
                  </div>
                  <div>
                    <Label htmlFor="willVote">ভোট দিবেন?</Label>
                    <Select
                      name="Will Vote"
                      value={formData['Will Vote']}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, 'Will Vote': value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="হ্যাঁ">হ্যাঁ</SelectItem>
                        <SelectItem value="না">না</SelectItem>
                        <SelectItem value="সংশয়">সংশয়</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="remarks">মন্তব্য (ঐচ্ছিক)</Label>
                  <Textarea
                    id="remarks"
                    name="Remarks"
                    value={formData.Remarks}
                    onChange={handleChange}
                    placeholder="মন্তব্য লিখুন"
                  />
                </div>
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'যোগ করা হচ্ছে...' : 'ভোটার যোগ করুন'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default AddVoters;
