
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Users, Target } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const SMSCampaign = () => {
  usePageTitle('SMS ক্যাম্পেইন ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span>SMS ক্যাম্পেইন ডকুমেন্টেশন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
                <TabsTrigger value="campaigns">ক্যাম্পেইন ধরন</TabsTrigger>
                <TabsTrigger value="targeting">টার্গেটিং</TabsTrigger>
                <TabsTrigger value="analytics">রিপোর্ট</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SMS ক্যাম্পেইন সিস্টেম</h3>
                    <p className="text-gray-600">
                      এই সিস্টেমটি ভোটারদের সাথে SMS এর মাধ্যমে যোগাযোগ স্থাপন ও ক্যাম্পেইন পরিচালনার জন্য ব্যবহৃত হয়।
                      এটি টার্গেটেড মেসেজিং, অটোমেশন এবং বিশ্লেষণের সুবিধা প্রদান করে।
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Send className="w-4 h-4 text-blue-600" />
                          <span>বাল্ক SMS</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• হাজারো ভোটারকে একসাথে মেসেজ</li>
                          <li>• এলাকা ভিত্তিক টার্গেটিং</li>
                          <li>• কাস্টমাইজড মেসেজ</li>
                          <li>• সময়সূচী নির্ধারণ</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <span>স্মার্ট টার্গেটিং</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• বয়স ভিত্তিক গ্রুপিং</li>
                          <li>• ভোট সম্ভাবনা অনুযায়ী</li>
                          <li>• রাজনৈতিক সমর্থন অনুযায়ী</li>
                          <li>• ভৌগোলিক অবস্থান অনুযায়ী</li>
                        </ul>
                      </Card>
                    </div>

                    <Card className="p-4 bg-green-50 border-green-200">
                      <h4 className="font-medium text-green-800">SMS ক্যাম্পেইনের বৈশিষ্ট্য</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium">প্রযুক্তিগত বৈশিষ্ট্য</h5>
                          <ul className="text-green-700">
                            <li>• API ইন্টিগ্রেশন</li>
                            <li>• অটো রেসপন্স</li>
                            <li>• ডেলিভারি ট্র্যাকিং</li>
                            <li>• এরর হ্যান্ডলিং</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">ব্যবসায়িক বৈশিষ্ট্য</h5>
                          <ul className="text-green-700">
                            <li>• কস্ট অপটিমাইজেশন</li>
                            <li>• ROI ট্র্যাকিং</li>
                            <li>• A/B টেস্টিং</li>
                            <li>• পারফরম্যান্স মেট্রিক্স</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="campaigns">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ক্যাম্পেইনের ধরন</h3>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">তথ্যমূলক ক্যাম্পেইন</h4>
                          <Badge className="bg-blue-100 text-blue-800">তথ্য</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">ভোটারদের জানানোর জন্য</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• পার্টির নীতি ও কর্মসূচি</li>
                          <li>• নির্বাচনী প্রতিশ্রুতি</li>
                          <li>• সামাজিক কার্যক্রম</li>
                          <li>• শিক্ষামূলক বার্তা</li>
                        </ul>
                        <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
{`উদাহরণ: "আসসালামু আলাইকুম। জামায়াতে ইসলামী 
বাংলাদেশ আপনাদের সেবায় নিয়োজিত। আমাদের 
শিক্ষানীতি সম্পর্কে জানতে ভিজিট করুন..."`}
                        </pre>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">প্রচারণামূলক ক্যাম্পেইন</h4>
                          <Badge className="bg-orange-100 text-orange-800">প্রচার</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">ভোট প্রার্থনার জন্য</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ভোট প্রার্থনা</li>
                          <li>• প্রার্থী পরিচিতি</li>
                          <li>• নির্বাচনী সভার আমন্ত্রণ</li>
                          <li>• সমর্থন আবেদন</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">রিমাইন্ডার ক্যাম্পেইন</h4>
                          <Badge className="bg-purple-100 text-purple-800">স্মরণ</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">গুরুত্বপূর্ণ তারিখ মনে করিয়ে দেওয়া</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ভোটের তারিখ</li>
                          <li>• রেজিস্ট্রেশনের শেষ তারিখ</li>
                          <li>• সভা ও অনুষ্ঠানের সময়</li>
                          <li>• গুরুত্বপূর্ণ ঘোষণা</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">ইন্টারেক্টিভ ক্যাম্পেইন</h4>
                          <Badge className="bg-green-100 text-green-800">মিথস্ক্রিয়া</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">ভোটারদের সাথে দ্বিমুখী যোগাযোগ</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• সার্ভে ও পোল</li>
                          <li>• মতামত সংগ্রহ</li>
                          <li>• প্রশ্নোত্তর সেশন</li>
                          <li>• ফিডব্যাক সংগ্রহ</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="targeting">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">টার্গেট অডিয়েন্স</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">ডেমোগ্রাফিক টার্গেটিং</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium">বয়স ভিত্তিক</h5>
                          <ul className="text-xs text-gray-600 mt-1">
                            <li>• ১৮-২৫ (তরুণ ভোটার)</li>
                            <li>• ২৬-৪০ (যুব ভোটার)</li>
                            <li>• ৪১-৬০ (মধ্যবয়সী)</li>
                            <li>• ৬০+ (বয়স্ক ভোটার)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">লিঙ্গ ভিত্তিক</h5>
                          <ul className="text-xs text-gray-600 mt-1">
                            <li>• পুরুষ ভোটার</li>
                            <li>• নারী ভোটার</li>
                            <li>• মহিলা নেতৃত্ব</li>
                            <li>• যুব নেতৃত্ব</li>
                          </ul>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">ভৌগোলিক টার্গেটিং</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// Location-based targeting example
const targetAudience = {
  division: "ঢাকা",
  districts: ["ঢাকা", "গাজীপুর", "নরসিংদী"],
  upazilas: ["ধানমন্ডি", "রমনা", "তেজগাঁও"],
  criteria: {
    voteProbability: ">70%",
    ageRange: "25-45",
    gender: "all"
  }
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">আচরণগত টার্গেটিং</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">উচ্চ সমর্থন</Badge>
                          <span className="text-sm">৮০%+ ভোট সম্ভাবনা</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">মধ্যম সমর্থন</Badge>
                          <span className="text-sm">৫০-৮০% ভোট সম্ভাবনা</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">সন্দিহান</Badge>
                          <span className="text-sm">৫০%-এর নিচে ভোট সম্ভাবনা</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">নতুন ভোটার</Badge>
                          <span className="text-sm">প্রথমবার ভোট দিবে</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">ক্যাম্পেইন সেগমেন্ট উদাহরণ</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// High-probability voters
const segment1 = voters.filter(v => 
  v.voteProbability >= 80 && 
  v.location.district === "ঢাকা"
);

// Young voters
const segment2 = voters.filter(v => 
  v.age >= 18 && v.age <= 30
);

// Female voters
const segment3 = voters.filter(v => 
  v.gender === "Female" && 
  v.voteProbability >= 60
);`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analytics">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SMS ক্যাম্পেইন অ্যানালিটিক্স</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium">ডেলিভারি মেট্রিক্স</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>পাঠানো SMS:</span>
                            <span className="font-medium">১০,০০০</span>
                          </div>
                          <div className="flex justify-between">
                            <span>সফল ডেলিভারি:</span>
                            <span className="font-medium text-green-600">৯,৮৫০ (৯৮.৫%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ব্যর্থ:</span>
                            <span className="font-medium text-red-600">১৫০ (১.৫%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>পেন্ডিং:</span>
                            <span className="font-medium text-yellow-600">০</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium">এনগেজমেন্ট মেট্রিক্স</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>উত্তর পাওয়া:</span>
                            <span className="font-medium">২,৩৫০</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ইতিবাচক প্রতিক্রিয়া:</span>
                            <span className="font-medium text-green-600">১,৮৮০ (৮০%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>নেতিবাচক প্রতিক্রিয়া:</span>
                            <span className="font-medium text-red-600">২৩৫ (১০%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>নিউট্রাল:</span>
                            <span className="font-medium text-gray-600">২৩৫ (১০%)</span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="p-4">
                      <h4 className="font-medium">কস্ট অ্যানালিসিস</h4>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-lg">৳৫০,০০০</p>
                          <p className="text-gray-600">মোট খরচ</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-lg">৳৫.০০</p>
                          <p className="text-gray-600">প্রতি SMS</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-lg">৳২১.২৮</p>
                          <p className="text-gray-600">প্রতি রেসপন্স</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium">ROI ক্যালকুলেশন</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// SMS Campaign ROI calculation
const campaignData = {
  totalCost: 50000,      // Total campaign cost
  totalSent: 10000,      // Total SMS sent
  responses: 2350,       // Total responses
  positiveResponses: 1880, // Positive responses
  
  // Calculate metrics
  deliveryRate: (9850 / 10000) * 100,  // 98.5%
  responseRate: (2350 / 9850) * 100,   // 23.9%
  positivityRate: (1880 / 2350) * 100, // 80%
  costPerResponse: 50000 / 2350,        // ৳21.28
  
  // Estimated vote conversion
  estimatedVotes: 1880 * 0.85,          // 1598 votes
  costPerVote: 50000 / 1598             // ৳31.29
};`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <h4 className="font-medium text-blue-800">পারফরম্যান্স ইনসাইট</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• সকাল ১০টা থেকে দুপুর ২টার মধ্যে সবচেয়ে ভালো রেসপন্স</li>
                        <li>• শুক্রবার দিনে সবচেয়ে বেশি এনগেজমেন্ট</li>
                        <li>• ব্যক্তিগতকৃত মেসেজে ৩৫% বেশি রেসপন্স</li>
                        <li>• গ্রামীণ এলাকায় শহুরে এলাকার চেয়ে ২০% বেশি রেসপন্স</li>
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

export default SMSCampaign;
