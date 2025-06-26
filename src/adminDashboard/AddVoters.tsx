import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Upload, Users } from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

const AddVoters = () => {
  const [singleVoter, setSingleVoter] = useState<Partial<VoterData>>({
    'Voter Name': '',
    Age: undefined,
    Gender: undefined,
    Phone: '',
    'Will Vote': undefined,
    'Priority Level': undefined,
    'Vote Probability (%)': undefined,
    Collector: 'Admin',
    'Collection Date': new Date().toISOString(),
    'Last Updated': new Date().toISOString()
  });

  const [csvData, setCsvData] = useState<VoterData[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addSingleVoterMutation = useMutation({
    mutationFn: async (voter: Partial<VoterData>) => {
      const votersRef = collection(db, 'voters');
      await addDoc(votersRef, {
        ...voter,
        ID: Date.now().toString(),
        'Collection Date': new Date().toISOString(),
        'Last Updated': new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: "সফল",
        description: "নতুন ভোটার যোগ করা হয়েছে",
      });
      // Reset form
      setSingleVoter({
        'Voter Name': '',
        Age: undefined,
        Gender: undefined,
        Phone: '',
        'Will Vote': undefined,
        'Priority Level': undefined,
        'Vote Probability (%)': undefined,
        Collector: 'Admin',
        'Collection Date': new Date().toISOString(),
        'Last Updated': new Date().toISOString()
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ভোটার যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const addBulkVotersMutation = useMutation({
    mutationFn: async (voters: VoterData[]) => {
      const batch = writeBatch(db);
      const votersRef = collection(db, 'voters');
      
      voters.forEach((voter, index) => {
        const docRef = doc(votersRef);
        batch.set(docRef, {
          ...voter,
          ID: (Date.now() + index).toString(),
          'Collection Date': new Date().toISOString(),
          'Last Updated': new Date().toISOString()
        });
      });
      
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast({
        title: "সফল",
        description: `${csvData.length} জন ভোটার যোগ করা হয়েছে`,
      });
      setCsvData([]);
      setCsvFile(null);
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "বাল্ক ভোটার যোগ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const handleSingleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleVoter['Voter Name']) {
      toast({
        title: "ত্রুটি",
        description: "ভোটারের নাম আবশ্যক",
        variant: "destructive",
      });
      return;
    }
    addSingleVoterMutation.mutate(singleVoter);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter((row: any) => row['Voter Name'] && row['Voter Name'].trim() !== '');
        setCsvData(validData as VoterData[]);
      },
      error: () => {
        toast({
          title: "ত্রুটি",
          description: "CSV ফাইল পড়তে সমস্যা হয়েছে",
          variant: "destructive",
        });
      }
    });
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      {
        'Voter Name': 'নমুনা নাম',
        'House Name': 'নমুনা বাড়ি',
        'FatherOrHusband': 'নমুনা পিতা',
        'Age': 35,
        'Gender': 'Male',
        'Marital Status': 'Married',
        'Student': 'No',
        'Occupation': 'ব্যবসা',
        'Education': 'এসএসসি',
        'Religion': 'Islam',
        'Phone': '01711000000',
        'WhatsApp': 'Yes',
        'NID': '1234567890',
        'Is Voter': 'Yes',
        'Will Vote': 'Yes',
        'Voted Before': 'Yes',
        'Vote Probability (%)': 75,
        'Political Support': 'Supporting',
        'Priority Level': 'High',
        'Has Disability': 'No',
        'Is Migrated': 'No',
        'Remarks': 'নমুনা মন্তব্য'
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'voter_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ভোটার যোগ করুন</h1>
        </div>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>একক ভোটার</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>বাল্ক আপলোড</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>নতুন ভোটার যোগ করুন</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSingleVoterSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">ভোটারের নাম *</label>
                      <Input
                        value={singleVoter['Voter Name'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'Voter Name': e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">বাড়ির নাম</label>
                      <Input
                        value={singleVoter['House Name'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'House Name': e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">পিতা/স্বামীর নাম</label>
                      <Input
                        value={singleVoter.FatherOrHusband || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, FatherOrHusband: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">বয়স</label>
                      <Input
                        type="number"
                        value={singleVoter.Age || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, Age: parseInt(e.target.value) || undefined})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">লিঙ্গ</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={singleVoter.Gender || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, Gender: e.target.value as 'Male' | 'Female' | 'Other'})}
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option value="Male">পুরুষ</option>
                        <option value="Female">মহিলা</option>
                        <option value="Other">অন্যান্য</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ফোন নম্বর</label>
                      <Input
                        value={singleVoter.Phone || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, Phone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">NID নম্বর</label>
                      <Input
                        value={singleVoter.NID || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, NID: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">পেশা</label>
                      <Input
                        value={singleVoter.Occupation || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, Occupation: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ভোট দেবেন?</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={singleVoter['Will Vote'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'Will Vote': e.target.value as 'Yes' | 'No'})}
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option value="Yes">হ্যাঁ</option>
                        <option value="No">না</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">অগ্রাধিকার স্তর</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={singleVoter['Priority Level'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'Priority Level': e.target.value as 'Low' | 'Medium' | 'High'})}
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option value="Low">নিম্ন</option>
                        <option value="Medium">মাঝারি</option>
                        <option value="High">উচ্চ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ভোট সম্ভাবনা (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={singleVoter['Vote Probability (%)'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'Vote Probability (%)': parseInt(e.target.value) || undefined})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">রাজনৈতিক সমর্থন</label>
                      <Input
                        value={singleVoter['Political Support'] || ''}
                        onChange={(e) => setSingleVoter({...singleVoter, 'Political Support': e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">মন্তব্য</label>
                    <Textarea
                      value={singleVoter.Remarks || ''}
                      onChange={(e) => setSingleVoter({...singleVoter, Remarks: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={addSingleVoterMutation.isPending}
                  >
                    {addSingleVoterMutation.isPending ? 'যোগ করা হচ্ছে...' : 'ভোটার যোগ করুন'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>বাল্ক ভোটার আপলোড</span>
                  <Button onClick={downloadSampleCSV} variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    নমুনা CSV ডাউনলোড
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">CSV ফাইল আপলোড করুন</label>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    শুধুমাত্র CSV ফাইল গ্রহণযোগ্য। প্রথমে নমুনা ফাইল ডাউনলোড করে ফরম্যাট দেখুন।
                  </p>
                </div>

                {csvData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">প্রিভিউ ({csvData.length} টি রেকর্ড)</h3>
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 text-left">নাম</th>
                            <th className="p-2 text-left">ফোন</th>
                            <th className="p-2 text-left">বয়স</th>
                            <th className="p-2 text-left">ভোট দেবেন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 10).map((voter, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{voter['Voter Name']}</td>
                              <td className="p-2">{voter.Phone}</td>
                              <td className="p-2">{voter.Age}</td>
                              <td className="p-2">{voter['Will Vote']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvData.length > 10 && (
                        <p className="p-2 text-center text-gray-600">আরও {csvData.length - 10} টি রেকর্ড...</p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => addBulkVotersMutation.mutate(csvData)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      disabled={addBulkVotersMutation.isPending}
                    >
                      {addBulkVotersMutation.isPending ? 'আপলোড হচ্ছে...' : `${csvData.length} জন ভোটার যোগ করুন`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AddVoters;
