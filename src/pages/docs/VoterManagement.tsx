
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const VoterManagement = () => {
  usePageTitle('ভোটার ব্যবস্থাপনা ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>ভোটার ব্যবস্থাপনা ডকুমেন্টেশন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
                <TabsTrigger value="features">ফিচারসমূহ</TabsTrigger>
                <TabsTrigger value="workflow">কর্মপ্রবাহ</TabsTrigger>
                <TabsTrigger value="examples">উদাহরণ</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ভোটার ব্যবস্থাপনা সিস্টেম</h3>
                    <p className="text-gray-600">
                      এই সিস্টেমটি জামায়াতে ইসলামী বাংলাদেশের জন্য একটি সম্পূর্ণ ভোটার তথ্য ব্যবস্থাপনা সমাধান।
                      এটি ভোটার তথ্য সংগ্রহ, সংরক্ষণ, সম্পাদনা এবং বিশ্লেষণের জন্য ব্যবহৃত হয়।
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-green-600" />
                          <span>ভোটার যোগ করা</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ব্যক্তিগত তথ্য (নাম, বয়স, লিঙ্গ)</li>
                          <li>• যোগাযোগের তথ্য (ফোন, ঠিকানা)</li>
                          <li>• রাজনৈতিক তথ্য (সমর্থন, ভোট সম্ভাবনা)</li>
                          <li>• এলাকা ভিত্তিক বিভাজন</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Search className="w-4 h-4 text-blue-600" />
                          <span>ভোটার খোঁজা</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• নাম দিয়ে অনুসন্ধান</li>
                          <li>• ফোন নম্বর দিয়ে খোঁজা</li>
                          <li>• এনআইডি দিয়ে খোঁজা</li>
                          <li>• এলাকা ভিত্তিক ফিল্টার</li>
                        </ul>
                      </Card>
                    </div>

                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-medium text-blue-800">ভোটার ডেটা কাঠামো</h4>
                      <pre className="mt-2 text-sm text-blue-700 overflow-x-auto">
{`interface VoterData {
  id?: string;
  ID: string;
  'Voter Name': string;
  Age?: number;
  Gender?: 'Male' | 'Female' | 'Other';
  Phone?: string;
  NID?: string;
  'Will Vote'?: 'Yes' | 'No';
  'Vote Probability (%)'?: number;
  'Political Support'?: string;
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
  union_id?: string;
  village_id?: string;
}`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="features">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">মূল ফিচারসমূহ</h3>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">ভোটার যোগ করা</h4>
                          <Badge>অ্যাড</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">নতুন ভোটার তথ্য যোগ করার সুবিধা</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ফর্ম ভ্যালিডেশন</li>
                          <li>• ডুপ্লিকেট চেক</li>
                          <li>• এলাকা সিলেকশন</li>
                          <li>• ব্যাচ আপলোড সাপোর্ট</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">ভোটার তালিকা</h4>
                          <Badge>ভিউ</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">সকল ভোটারের তালিকা দেখা ও ব্যবস্থাপনা</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• পেজিনেশন সাপোর্ট</li>
                          <li>• এডভান্স ফিল্টারিং</li>
                          <li>• সার্চ ফাংশন</li>
                          <li>• এক্সপোর্ট অপশন</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">ভোটার সম্পাদনা</h4>
                          <Badge>এডিট</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">বিদ্যমান ভোটার তথ্য আপডেট করা</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ইনলাইন এডিটিং</li>
                          <li>• হিস্টরি ট্র্যাকিং</li>
                          <li>• ভার্শন কন্ট্রোল</li>
                          <li>• চেঞ্জ লগ</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="workflow">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">কর্মপ্রবাহ</h3>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h4 className="font-medium text-green-800">১. ভোটার তথ্য সংগ্রহ</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                            <span className="text-sm">ফিল্ড টিম ভোটার তথ্য সংগ্রহ করে</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                            <span className="text-sm">ডেটা এন্ট্রি ফর্মে তথ্য ইনপুট</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                            <span className="text-sm">ভ্যালিডেশন ও ভেরিফিকেশন</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium text-blue-800">২. ডেটা প্রসেসিং</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                            <span className="text-sm">ডুপ্লিকেট চেক</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                            <span className="text-sm">জিও-কোডিং</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                            <span className="text-sm">ক্যাটাগরাইজেশন</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium text-purple-800">৩. বিশ্লেষণ ও রিপোর্ট</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                            <span className="text-sm">ভোট সম্ভাবনা বিশ্লেষণ</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                            <span className="text-sm">এলাকা ভিত্তিক রিপোর্ট</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                            <span className="text-sm">টার্গেট গ্রুপ সনাক্তকরণ</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="examples">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ব্যবহারের উদাহরণ</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">১. নতুন ভোটার যোগ করা</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const newVoter = {
  ID: "V001",
  "Voter Name": "মোহাম্মদ রহিম",
  Age: 35,
  Gender: "Male",
  Phone: "01712345678",
  "Will Vote": "Yes",
  "Vote Probability (%)": 85,
  division_id: "division_1",
  district_id: "district_1"
};

// Add voter to database
await addDoc(collection(db, 'voters'), newVoter);`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">২. ভোটার অনুসন্ধান</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Search by name
const searchVoters = async (searchTerm) => {
  const votersRef = collection(db, 'voters');
  const q = query(
    votersRef,
    where('Voter Name', '>=', searchTerm),
    where('Voter Name', '<=', searchTerm + '\uf8ff')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">৩. এলাকা ভিত্তিক ফিল্টার</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Filter voters by location
const getVotersByLocation = async (districtId) => {
  const votersRef = collection(db, 'voters');
  const q = query(
    votersRef,
    where('district_id', '==', districtId),
    orderBy('Voter Name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
};`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-green-50 border-green-200">
                      <h4 className="font-medium text-green-800">বেস্ট প্র্যাকটিস</h4>
                      <ul className="mt-2 space-y-1 text-sm text-green-700">
                        <li>• সর্বদা ডেটা ভ্যালিডেশন করুন</li>
                        <li>• ডুপ্লিকেট এন্ট্রি এড়িয়ে চলুন</li>
                        <li>• নিয়মিত ব্যাকআপ নিন</li>
                        <li>• সিকিউরিটি রুলস মেনে চলুন</li>
                        <li>• পারফরম্যান্স অপটিমাইজেশন করুন</li>
                      </ul>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DocumentationLayout>
  );
};

export default VoterManagement;
