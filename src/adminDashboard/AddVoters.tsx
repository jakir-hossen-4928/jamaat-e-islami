import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, User, Phone, Vote, Info, CheckCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { usePageTitle } from '@/lib/usePageTitle';

// Define VoterData type to ensure type safety
interface VoterData {
  'Voter Name': string;
  'House Name'?: string;
  'FatherOrHusband'?: string;
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
  'Priority Level': 'Low' | 'Medium' | 'High';
  'Has Disability'?: 'Yes' | 'No';
  'Is Migrated'?: 'Yes' | 'No';
  Remarks?: string;
  ID: string;
  'Collection Date': string;
  'Last Updated': string;
  Collector: string;
}

const AddVoters = () => {
  usePageTitle('বাংলাদেশ জামায়াতে ইসলামী');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    'Voter Name': '',
    'House Name': '',
    'FatherOrHusband': '',
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

  const addSingleVoterMutation = useMutation({
    mutationFn: async (voter: Partial<VoterData>) => {
      try {
        // Validate required fields
        if (!voter['Voter Name']?.trim()) {
          throw new Error('ভোটারের নাম আবশ্যক');
        }

        const votersRef = collection(db, 'voters');
        const voterData: VoterData = {
          ...voter,
          ID: Date.now().toString(),
          'Collection Date': new Date().toISOString(),
          'Last Updated': new Date().toISOString(),
          Collector: 'Admin'
        } as VoterData;

        // Ensure numeric fields are properly formatted
        if (voter.Age) voterData.Age = parseInt(voter.Age.toString());
        if (voter['Vote Probability (%)']) voterData['Vote Probability (%)'] = parseInt(voter['Vote Probability (%)'].toString());

        // Remove undefined or empty string fields to avoid Firestore issues
        Object.keys(voterData).forEach(key => {
          if (voterData[key as keyof VoterData] === '' || voterData[key as keyof VoterData] === undefined) {
            delete voterData[key as keyof VoterData];
          }
        });

        // Add voter to Firestore
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
        title: "সফল",
        description: "নতুন ভোটার যোগ করা হয়েছে",
      });
      setShowSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "ত্রুটি",
        description: error.message || "ভোটার যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      'Voter Name': '',
      'House Name': '',
      'FatherOrHusband': '',
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
    setShowSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData['Voter Name'].trim()) {
      toast({
        title: "ত্রুটি",
        description: "ভোটারের নাম আবশ্যক",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const voterData: Partial<VoterData> = {
        'Voter Name': formData['Voter Name'],
        'House Name': formData['House Name'] || undefined,
        'FatherOrHusband': formData['FatherOrHusband'] || undefined,
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
        title: "ত্রুটি",
        description: error.message || "ভোটার যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      toast({
        title: "ফাইল নির্বাচিত নেই",
        description: "অনুগ্রহ করে একটি CSV ফাইল নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingBulk(true);
    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
          const validData = results.data.filter((row: any) => row['Voter Name'] && row['Voter Name'].trim() !== '');

          const batch = writeBatch(db);
          const votersRef = collection(db, 'voters');

          validData.forEach((voter: any, index) => {
            const docRef = doc(votersRef);
            const voterData: VoterData = {
              ...voter,
              ID: (Date.now() + index).toString(),
              'Collection Date': new Date().toISOString(),
              'Last Updated': new Date().toISOString(),
              Collector: 'Admin'
            };

            // Clean up voter data
            Object.keys(voterData).forEach(key => {
              if (voterData[key as keyof VoterData] === '' || voterData[key as keyof VoterData] === undefined) {
                delete voterData[key as keyof VoterData];
              }
            });

            batch.set(docRef, voterData);
          });

          await batch.commit();

          queryClient.invalidateQueries({ queryKey: ['voters'] });
          toast({
            title: "সফল",
            description: `${validData.length} জন ভোটার যোগ করা হয়েছে`,
          });
          setIsBulkUploadOpen(false);
          setCsvFile(null);
        },
        error: () => {
          toast({
            title: "ত্রুটি",
            description: "CSV ফাইল পড়তে সমস্যা হয়েছে",
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "আপলোড ত্রুটি",
        description: error.message || "CSV ফাইল প্রক্রিয়া করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBulk(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showSuccess) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <Card className="max-w-md w-full shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ভোটার সফলভাবে যোগ হয়েছে!</h2>
              <p className="text-gray-600 mb-6">
                {formData['Voter Name']} ভোটার ডাটাবেজে যোগ করা হয়েছে।
              </p>
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
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
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
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  বাল্ক আপলোড CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>বাল্ক ভোটার আপলোড</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="csvFile">CSV ফাইল নির্বাচন করুন</Label>
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>CSV-তে এই হেডার থাকতে হবে:</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                      Voter Name,Age,Gender,Phone,Will Vote,Priority Level,...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkUpload}
                      disabled={!csvFile || isUploadingBulk}
                      className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    >
                      {isUploadingBulk ? 'আপলোড হচ্ছে...' : 'ভোটার আপলোড করুন'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                      বাতিল
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

                  <div>
                    <Label htmlFor="fatherHusband" className="text-sm font-medium">পিতা/স্বামীর নাম</Label>
                    <Input
                      id="fatherHusband"
                      value={formData['FatherOrHusband']}
                      onChange={(e) => handleInputChange('FatherOrHusband', e.target.value)}
                      placeholder="পিতা বা স্বামীর নাম"
                      className="mt-1"
                    />
                  </div>

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
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-800 text-base sm:text-lg">
                  <Phone className="w-5 h-5" />
                  যোগাযোগ ও পরিচয়
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Political Information */}
            <Card className="shadow-lg">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                  <Vote className="w-5 h-5" />
                  রাজনৈতিক তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
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
                  "ভোটার যোগ করা হচ্ছে..."
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
