
import React, { useState } from 'react';
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
import { Plus } from 'lucide-react';

const VillageAddVoter = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
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
      const voterID = `VOTER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const voterData: VoterData = {
        ID: voterID,
        Name: formData['Voter Name'],
        FatherOrHusband: formData['Father/Husband'],
        'Mothers Name': formData['Mother'],
        Address: formData['Address'],
        Age: parseInt(formData['Age']),
        Gender: formData['Gender'] as any,
        Phone: formData['Phone'],
        'Vote Probability (%)': parseInt(formData['Vote Probability (%)']),
        'Will Vote': formData['Will Vote'] as any,
        Remarks: formData['Remarks'],
        // Auto-fill location from village admin's scope
        division_id: userProfile?.accessScope?.division_id || '',
        district_id: userProfile?.accessScope?.district_id || '',
        upazila_id: userProfile?.accessScope?.upazila_id || '',
        union_id: userProfile?.accessScope?.union_id || '',
        village_id: userProfile?.accessScope?.village_id || '',
        'Last Updated': new Date().toISOString()
      };

      await addDoc(collection(db, 'voters'), voterData);

      toast({
        title: 'সফল',
        description: 'নতুন ভোটার যোগ করা হয়েছে',
      });

      // Reset form
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
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <Plus className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">নতুন ভোটার যোগ করুন</h1>
            <p className="mt-2 text-green-100">
              {userProfile?.accessScope?.village_name && `গ্রাম: ${userProfile.accessScope.village_name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
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
  );
};

export default VillageAddVoter;
