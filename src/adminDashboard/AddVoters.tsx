import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Save, User, Phone, Vote, Info, CheckCircle, Upload, Settings, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/lib/usePageTitle';
import { Checkbox } from '@/components/ui/checkbox';
import BulkVoterUpload from './BulkVoterUpload';
import { useAuth } from '@/hooks/useAuth';
import { loadLocationData } from '@/lib/locationUtils';

// Updated VoterData interface
export interface VoterData {
  id?: string;
  ID: string;
  'House Name'?: string;
  'Voter Name': string;
  FatherOrHusband?: string;
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other';
  'Marital Status'?: 'Married' | 'Unmarried' | 'Widowed' | 'Divorced';
  Student?: 'Yes' | 'No';
  Occupation?: string;
  Education?: string;
  Religion?: string;
  Phone?: string;
  WhatsApp?: 'Yes' | 'No';
  NID?: string;
  'Is Voter'?: 'Yes' | 'No';
  'Will Vote'?: 'Yes' | 'No';
  'Voted Before'?: 'Yes' | 'No';
  'Vote Probability (%)'?: number;
  'Political Support'?: string;
  'Priority Level'?: 'Low' | 'Medium' | 'High';
  'Has Disability'?: 'Yes' | 'No';
  'Is Migrated'?: 'Yes' | 'No';
  Remarks?: string;
  Collector?: string;
  'Collection Date'?: string;
  'Last Updated'?: string;
  // Location fields
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}

const AddVoters = () => {
  usePageTitle('বাংলাদেশ জামায়াতে ইসলামী');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  // Location data state
  const [locationData, setLocationData] = useState({
    divisions: [],
    districts: [],
    upazilas: [],
    unions: [],
    villages: []
  });

  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState({
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    village_id: ''
  });

  // State for form data
  const [formData, setFormData] = useState({
    'Voter Name': '',
    'House Name': '',
    FatherOrHusband: '',
    Age: '',
    Gender: '' as 'Male' | 'Female' | 'Other' | '',
    'Marital Status': '' as 'Married' | 'Unmarried' | 'Widowed' | 'Divorced' | '',
    Student: '' as 'Yes' | 'No' | '',
    Occupation: '',
    Education: '',
    Religion: '',
    Phone: '',
    WhatsApp: '' as 'Yes' | 'No' | '',
    NID: '',
    'Is Voter': '' as 'Yes' | 'No' | '',
    'Will Vote': '' as 'Yes' | 'No' | '',
    'Voted Before': '' as 'Yes' | 'No' | '',
    'Vote Probability (%)': '',
    'Political Support': '',
    'Priority Level': 'Medium' as 'Low' | 'Medium' | 'High',
    'Has Disability': '' as 'Yes' | 'No' | '',
    'Is Migrated': '' as 'Yes' | 'No' | '',
    Remarks: ''
  });

  // State for selected columns, initialized from localStorage
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem('voterFormColumns');
    return saved
      ? JSON.parse(saved)
      : Object.keys(formData).filter(
          (key) => key !== 'Voter Name' // Ensure 'Voter Name' is always included
        );
  });

  // Load location data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadLocationData();
        setLocationData({
          divisions: data.divisions || [],
          districts: data.districts || [],
          upazilas: data.upazilas || [],
          unions: data.unions || [],
          villages: []
        });
      } catch (error) {
        console.error('Error loading location data:', error);
      }
    };

    if (userProfile?.role === 'super_admin') {
      loadData();
    }
  }, [userProfile]);

  // Save selected columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('voterFormColumns', JSON.stringify(selectedColumns));
  }, [selectedColumns]);

  const queryClient = useQueryClient();

  // Available columns for selection (excluding required 'Voter Name')
  const availableColumns: { key: keyof VoterData; label: string }[] = [
    { key: 'House Name', label: 'বাড়ির নাম' },
    { key: 'FatherOrHusband', label: 'পিতা/স্বামীর নাম' },
    { key: 'Age', label: 'বয়স' },
    { key: 'Gender', label: 'লিঙ্গ' },
    { key: 'Marital Status', label: 'বৈবাহিক অবস্থা' },
    { key: 'Student', label: 'ছাত্র/ছাত্রী' },
    { key: 'Occupation', label: 'পেশা' },
    { key: 'Education', label: 'শিক্ষা' },
    { key: 'Religion', label: 'ধর্ম' },
    { key: 'Phone', label: 'ফোন' },
    { key: 'WhatsApp', label: 'হোয়াটসঅ্যাপ' },
    { key: 'NID', label: 'NID' },
    { key: 'Is Voter', label: 'ভোটার কিনা' },
    { key: 'Will Vote', label: 'ভোট দেবেন' },
    { key: 'Voted Before', label: 'আগে ভোট দিয়েছেন' },
    { key: 'Vote Probability (%)', label: 'ভোট দেওয়ার সম্ভাবনা (%)' },
    { key: 'Political Support', label: 'রাজনৈতিক সমর্থন' },
    { key: 'Priority Level', label: 'অগ্রাধিকার স্তর' },
    { key: 'Has Disability', label: 'প্রতিবন্ধী কিনা' },
    { key: 'Is Migrated', label: 'প্রবাসী কিনা' },
    { key: 'Remarks', label: 'মন্তব্য' },
  ];

  // Location change handlers
  const handleLocationChange = (field: string, value: string) => {
    const updated = { ...selectedLocation };
    
    // Clear dependent fields when parent changes
    if (field === 'division_id') {
      updated.district_id = '';
      updated.upazila_id = '';
      updated.union_id = '';
      updated.village_id = '';
    } else if (field === 'district_id') {
      updated.upazila_id = '';
      updated.union_id = '';
      updated.village_id = '';
    } else if (field === 'upazila_id') {
      updated.union_id = '';
      updated.village_id = '';
    } else if (field === 'union_id') {
      updated.village_id = '';
    }
    
    updated[field as keyof typeof updated] = value;
    setSelectedLocation(updated);
  };

  // Filter data based on selections
  const getFilteredDistricts = () => {
    if (!selectedLocation.division_id) return locationData.districts;
    return locationData.districts.filter((d: any) => d.division_id === selectedLocation.division_id);
  };

  const getFilteredUpazilas = () => {
    if (!selectedLocation.district_id) return locationData.upazilas;
    return locationData.upazilas.filter((u: any) => u.district_id === selectedLocation.district_id);
  };

  const getFilteredUnions = () => {
    if (!selectedLocation.upazila_id) return locationData.unions;
    return locationData.unions.filter((u: any) => u.upazilla_id === selectedLocation.upazila_id);
  };

  const getFilteredVillages = () => {
    if (!selectedLocation.union_id) return locationData.villages;
    return locationData.villages.filter((v: any) => v.union_id === selectedLocation.union_id);
  };

  const addSingleVoterMutation = useMutation({
    mutationFn: async (voter: Partial<VoterData>) => {
      try {
        if (!voter['Voter Name']?.trim()) {
          throw new Error('ভোটারের নাম আবশ্যক');
        }

        // For super admin, require location selection
        if (userProfile?.role === 'super_admin') {
          if (!selectedLocation.division_id || !selectedLocation.district_id || !selectedLocation.upazila_id) {
            throw new Error('বিভাগ, জেলা এবং উপজেলা নির্বাচন আবশ্যক');
          }
        }

        const votersRef = collection(db, 'voters');
        const voterData: VoterData = {
          ...voter,
          ID: Date.now().toString(),
          'Collection Date': new Date().toISOString(),
          'Last Updated': new Date().toISOString(),
          Collector: 'Admin'
        } as VoterData;

        // Add location data for super admin
        if (userProfile?.role === 'super_admin') {
          voterData.division_id = selectedLocation.division_id;
          voterData.district_id = selectedLocation.district_id;
          voterData.upazila_id = selectedLocation.upazila_id;
          voterData.union_id = selectedLocation.union_id || undefined;
          voterData.village_id = selectedLocation.village_id || undefined;
        } else {
          // For other roles, use their access scope
          const scope = userProfile?.accessScope;
          if (scope) {
            voterData.division_id = scope.division_id;
            voterData.district_id = scope.district_id;
            voterData.upazila_id = scope.upazila_id;
            voterData.union_id = scope.union_id;
            voterData.village_id = scope.village_id;
          }
        }

        if (voter.Age) voterData.Age = parseInt(voter.Age.toString());
        if (voter['Vote Probability (%)']) voterData['Vote Probability (%)'] = parseInt(voter['Vote Probability (%)'].toString());

        Object.keys(voterData).forEach((key) => {
          if (voterData[key as keyof VoterData] === '' || voterData[key as keyof VoterData] === undefined) {
            delete voterData[key as keyof VoterData];
          }
        });

        const docRef = await addDoc(votersRef, voterData);
        return docRef.id;
      } catch (error: any) {
        console.error('Error adding voter:', error);
        let errorMessage = 'ভোটার যোগ করতে সমস্যা হয়েছে';
        if (error.code === 'permission-denied') {
          errorMessage = 'অনুমতি অস্বীকৃত: দয়া করে আপনার অ্যাক্সেস অনুমতি পরীক্ষা করুন।';
        } else if (error.code === 'invalid-argument') {
          errorMessage = 'অবৈধ তথ্য প্রদান করা হয়েছে। দয়া করে ফর্মটি সঠিকভাবে পূরণ করুন।';
        } else if (error.code === 'unavailable') {
          errorMessage = 'ডাটাবেস সংযোগে সমস্যা। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
        } else if (error.message) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: 'সফল',
        description: 'নতুন ভোটার যোগ করা হয়েছে',
      });
      setShowSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: 'ত্রুটি',
        description: error.message || 'ভোটার যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      'Voter Name': '',
      'House Name': '',
      FatherOrHusband: '',
      Age: '',
      Gender: '',
      'Marital Status': '',
      Student: '',
      Occupation: '',
      Education: '',
      Religion: '',
      Phone: '',
      WhatsApp: '',
      NID: '',
      'Is Voter': '',
      'Will Vote': '',
      'Voted Before': '',
      'Vote Probability (%)': '',
      'Political Support': '',
      'Priority Level': 'Medium',
      'Has Disability': '',
      'Is Migrated': '',
      Remarks: ''
    });
    setSelectedLocation({
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: ''
    });
    setShowSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData['Voter Name'].trim()) {
      toast({
        title: 'ত্রুটি',
        description: 'ভোটারের নাম আবশ্যক',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const voterData: Partial<VoterData> = {
        'Voter Name': formData['Voter Name'],
        'House Name': formData['House Name'] || undefined,
        FatherOrHusband: formData.FatherOrHusband || undefined,
        Age: formData.Age ? parseInt(formData.Age) : undefined,
        Gender: formData.Gender || undefined,
        'Marital Status': formData['Marital Status'] || undefined,
        Student: formData.Student || undefined,
        Occupation: formData.Occupation || undefined,
        Education: formData.Education || undefined,
        Religion: formData.Religion || undefined,
        Phone: formData.Phone || undefined,
        WhatsApp: formData.WhatsApp || undefined,
        NID: formData.NID || undefined,
        'Is Voter': formData['Is Voter'] || undefined,
        'Will Vote': formData['Will Vote'] || undefined,
        'Voted Before': formData['Voted Before'] || undefined,
        'Vote Probability (%)': formData['Vote Probability (%)'] ? parseInt(formData['Vote Probability (%)']) : undefined,
        'Political Support': formData['Political Support'] || undefined,
        'Priority Level': formData['Priority Level'],
        'Has Disability': formData['Has Disability'] || undefined,
        'Is Migrated': formData['Is Migrated'] || undefined,
        Remarks: formData.Remarks || undefined,
      };

      await addSingleVoterMutation.mutateAsync(voterData);
    } catch (error: any) {
      toast({
        title: 'ত্রুটি',
        description: error.message || 'ভোটার যোগ করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  if (showSuccess) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <Card className="max-w-md w-full shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ভোটার সফলভাবে যোগ হয়েছে!</h2>
              <p className="text-gray-600 mb-6">{formData['Voter Name']} ভোটার ডাটাবেজে যোগ করা হয়েছে।</p>
              <div className="space-y-3">
                <Button
                  onClick={resetForm}
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  আরো ভোটার যোগ করুন
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/voters')}
                  className="w-full"
                >
                  সকল ভোটার দেখুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/voters')}
                className="flex items-center gap-2 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                ভোটারদের কাছে ফিরুন
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">নতুন ভোটার যোগ করুন</h1>
                <p className="text-sm text-gray-600 hidden sm:block">ভোটারের তথ্য প্রবেশ করান ডাটাবেজে যোগ করতে</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    বাল্ক আপলোড CSV
                  </Button>
                </DialogTrigger>
                <BulkVoterUpload />
              </Dialog>
              <Dialog open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    কলাম সেটিংস
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-lg p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">ফর্ম কলাম নির্বাচন করুন</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 sm:space-y-4">
                    <p className="text-sm text-gray-600">ফর্মে কোন কলামগুলো দেখাতে চান তা নির্বাচন করুন:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      {availableColumns.map((column) => (
                        <div key={column.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.key}
                            checked={selectedColumns.includes(column.key)}
                            onCheckedChange={() => handleColumnToggle(column.key)}
                            disabled={column.key === 'Voter Name'} // Disable for required field
                          />
                          <Label htmlFor={column.key} className="text-sm">{column.label}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsColumnSettingsOpen(false)}
                        className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                      >
                        সংরক্ষণ করুন
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsColumnSettingsOpen(false)}
                      >
                        বাতিল
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Location Selection for Super Admin */}
            {userProfile?.role === 'super_admin' && (
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                    <MapPin className="w-5 h-5" />
                    এলাকা নির্বাচন করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <Label>বিভাগ *</Label>
                      <Select value={selectedLocation.division_id} onValueChange={(value) => handleLocationChange('division_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {locationData.divisions.map((division: any) => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.bn_name} ({division.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>জেলা *</Label>
                      <Select 
                        value={selectedLocation.district_id} 
                        onValueChange={(value) => handleLocationChange('district_id', value)}
                        disabled={!selectedLocation.division_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredDistricts().map((district: any) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.bn_name} ({district.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>উপজেলা *</Label>
                      <Select 
                        value={selectedLocation.upazila_id} 
                        onValueChange={(value) => handleLocationChange('upazila_id', value)}
                        disabled={!selectedLocation.district_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredUpazilas().map((upazila: any) => (
                            <SelectItem key={upazila.id} value={upazila.id}>
                              {upazila.bn_name} ({upazila.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>ইউনিয়ন</Label>
                      <Select 
                        value={selectedLocation.union_id} 
                        onValueChange={(value) => handleLocationChange('union_id', value)}
                        disabled={!selectedLocation.upazila_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredUnions().map((union: any) => (
                            <SelectItem key={union.id} value={union.id}>
                              {union.bn_name} ({union.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>গ্রাম</Label>
                      <Select 
                        value={selectedLocation.village_id} 
                        onValueChange={(value) => handleLocationChange('village_id', value)}
                        disabled={!selectedLocation.union_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="গ্রাম নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredVillages().map((village: any) => (
                            <SelectItem key={village.id} value={village.id}>
                              {village.bn_name} ({village.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
                  <User className="w-5 h-5" />
                  ব্যক্তিগত তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Always include Voter Name */}
                  <div>
                    <Label htmlFor="voterName" className="text-sm font-medium">
                      ভোটারের নাম <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="voterName"
                      value={formData['Voter Name']}
                      onChange={(e) => handleInputChange('Voter Name', e.target.value)}
                      placeholder="পূর্ণ নাম লিখুন"
                      required
                      className="mt-1"
                    />
                  </div>

                  {selectedColumns.includes('House Name') && (
                    <div>
                      <Label htmlFor="houseName" className="text-sm font-medium">বাড়ির নাম</Label>
                      <Input
                        id="houseName"
                        value={formData['House Name']}
                        onChange={(e) => handleInputChange('House Name', e.target.value)}
                        placeholder="বাড়ি/পারিবারিক নাম"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {selectedColumns.includes('FatherOrHusband') && (
                    <div>
                      <Label htmlFor="fatherHusband" className="text-sm font-medium">পিতা/স্বামীর নাম</Label>
                      <Input
                        id="fatherHusband"
                        value={formData.FatherOrHusband}
                        onChange={(e) => handleInputChange('FatherOrHusband', e.target.value)}
                        placeholder="পিতা বা স্বামীর নাম"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {selectedColumns.includes('Age') && (
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium">বয়স</Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="120"
                        value={formData.Age}
                        onChange={(e) => handleInputChange('Age', e.target.value)}
                        placeholder="বছরের হিসাবে বয়স"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {selectedColumns.includes('Gender') && (
                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium">লিঙ্গ</Label>
                      <Select value={formData.Gender} onValueChange={(value) => handleInputChange('Gender', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">পুরুষ</SelectItem>
                          <SelectItem value="Female">মহিলা</SelectItem>
                          <SelectItem value="Other">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedColumns.includes('Marital Status') && (
                    <div>
                      <Label htmlFor="maritalStatus" className="text-sm font-medium">বৈবাহিক অবস্থা</Label>
                      <Select value={formData['Marital Status']} onValueChange={(value) => handleInputChange('Marital Status', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="অবস্থা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Married">বিবাহিত</SelectItem>
                          <SelectItem value="Unmarried">অবিবাহিত</SelectItem>
                          <SelectItem value="Widowed">বিধবা</SelectItem>
                          <SelectItem value="Divorced">তালাকপ্রাপ্ত</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedColumns.includes('Student') && (
                    <div>
                      <Label htmlFor="student" className="text-sm font-medium">ছাত্র/ছাত্রী</Label>
                      <Select value={formData.Student} onValueChange={(value) => handleInputChange('Student', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="ছাত্র/ছাত্রী কিনা?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">হ্যাঁ</SelectItem>
                          <SelectItem value="No">না</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedColumns.includes('Occupation') && (
                    <div>
                      <Label htmlFor="occupation" className="text-sm font-medium">পেশা</Label>
                      <Input
                        id="occupation"
                        value={formData.Occupation}
                        onChange={(e) => handleInputChange('Occupation', e.target.value)}
                        placeholder="পেশা লিখুন"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {selectedColumns.includes('Education') && (
                    <div>
                      <Label htmlFor="education" className="text-sm font-medium">শিক্ষা</Label>
                      <Input
                        id="education"
                        value={formData.Education}
                        onChange={(e) => handleInputChange('Education', e.target.value)}
                        placeholder="শিক্ষাগত যোগ্যতা"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {selectedColumns.includes('Religion') && (
                    <div>
                      <Label htmlFor="religion" className="text-sm font-medium">ধর্ম</Label>
                      <Input
                        id="religion"
                        value={formData.Religion}
                        onChange={(e) => handleInputChange('Religion', e.target.value)}
                        placeholder="ধর্ম লিখুন"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(selectedColumns.includes('Phone') || selectedColumns.includes('WhatsApp') || selectedColumns.includes('NID')) && (
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                    <Phone className="w-5 h-5" />
                    যোগাযোগ ও পরিচয়
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedColumns.includes('Phone') && (
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">ফোন</Label>
                        <Input
                          id="phone"
                          value={formData.Phone}
                          onChange={(e) => handleInputChange('Phone', e.target.value)}
                          placeholder="ফোন নম্বর"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {selectedColumns.includes('WhatsApp') && (
                      <div>
                        <Label htmlFor="whatsapp" className="text-sm font-medium">হোয়াটসঅ্যাপ</Label>
                        <Select value={formData.WhatsApp} onValueChange={(value) => handleInputChange('WhatsApp', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="হোয়াটসঅ্যাপ আছে?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('NID') && (
                      <div>
                        <Label htmlFor="nid" className="text-sm font-medium">NID</Label>
                        <Input
                          id="nid"
                          value={formData.NID}
                          onChange={(e) => handleInputChange('NID', e.target.value)}
                          placeholder="জাতীয় পরিচয়পত্র নম্বর"
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Political Information */}
            {(selectedColumns.includes('Is Voter') || selectedColumns.includes('Will Vote') || selectedColumns.includes('Voted Before') || selectedColumns.includes('Vote Probability (%)') || selectedColumns.includes('Political Support') || selectedColumns.includes('Priority Level') || selectedColumns.includes('Has Disability') || selectedColumns.includes('Is Migrated')) && (
              <Card className="shadow-lg">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                    <Vote className="w-5 h-5" />
                    রাজনৈতিক তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedColumns.includes('Is Voter') && (
                      <div>
                        <Label htmlFor="isVoter" className="text-sm font-medium">ভোটার কিনা</Label>
                        <Select value={formData['Is Voter']} onValueChange={(value) => handleInputChange('Is Voter', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="নিবন্ধিত ভোটার?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('Will Vote') && (
                      <div>
                        <Label htmlFor="willVote" className="text-sm font-medium">ভোট দেবেন</Label>
                        <Select value={formData['Will Vote']} onValueChange={(value) => handleInputChange('Will Vote', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="ভোট দেবেন?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('Voted Before') && (
                      <div>
                        <Label htmlFor="votedBefore" className="text-sm font-medium">আগে ভোট দিয়েছেন</Label>
                        <Select value={formData['Voted Before']} onValueChange={(value) => handleInputChange('Voted Before', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="আগে ভোট দিয়েছেন?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('Vote Probability (%)') && (
                      <div>
                        <Label htmlFor="voteProbability" className="text-sm font-medium">ভোট দেওয়ার সম্ভাবনা (%)</Label>
                        <Input
                          id="voteProbability"
                          type="number"
                          min="0"
                          max="100"
                          value={formData['Vote Probability (%)']}
                          onChange={(e) => handleInputChange('Vote Probability (%)', e.target.value)}
                          placeholder="0-100"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {selectedColumns.includes('Political Support') && (
                      <div>
                        <Label htmlFor="politicalSupport" className="text-sm font-medium">রাজনৈতিক সমর্থন</Label>
                        <Input
                          id="politicalSupport"
                          value={formData['Political Support']}
                          onChange={(e) => handleInputChange('Political Support', e.target.value)}
                          placeholder="রাজনৈতিক দল বা প্রার্থী"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {selectedColumns.includes('Priority Level') && (
                      <div>
                        <Label htmlFor="priorityLevel" className="text-sm font-medium">অগ্রাধিকার স্তর</Label>
                        <Select value={formData['Priority Level']} onValueChange={(value) => handleInputChange('Priority Level', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">উচ্চ</SelectItem>
                            <SelectItem value="Medium">মাঝারি</SelectItem>
                            <SelectItem value="Low">নিম্ন</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('Has Disability') && (
                      <div>
                        <Label htmlFor="hasDisability" className="text-sm font-medium">প্রতিবন্ধী কিনা</Label>
                        <Select value={formData['Has Disability']} onValueChange={(value) => handleInputChange('Has Disability', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="প্রতিবন্ধী কিনা?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedColumns.includes('Is Migrated') && (
                      <div>
                        <Label htmlFor="isMigrated" className="text-sm font-medium">প্রবাসী কিনা</Label>
                        <Select value={formData['Is Migrated']} onValueChange={(value) => handleInputChange('Is Migrated', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="প্রবাসী কিনা?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">হ্যাঁ</SelectItem>
                            <SelectItem value="No">না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {selectedColumns.includes('Remarks') && (
              <Card className="shadow-lg">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800 text-base sm:text-lg">
                    <Info className="w-5 h-5" />
                    অতিরিক্ত তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label htmlFor="remarks" className="text-sm font-medium">মন্তব্য</Label>
                    <Textarea
                      id="remarks"
                      value={formData.Remarks}
                      onChange={(e) => handleInputChange('Remarks', e.target.value)}
                      placeholder="অতিরিক্ত নোট বা মন্তব্য..."
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 bg-white p-4 rounded-lg shadow-sm">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/voters')}
                disabled={isLoading}
                className="transition-colors duration-200"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  'ভোটার যোগ করা হচ্ছে...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    ভোটার যোগ করুন
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddVoters;
