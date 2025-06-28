
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, PieChart, TrendingUp, MapPin } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const AnalyticsSystem = () => {
  usePageTitle('বিশ্লেষণ সিস্টেম ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>বিশ্লেষণ সিস্টেম ডকুমেন্টেশন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
                <TabsTrigger value="charts">চার্ট ও গ্রাফ</TabsTrigger>
                <TabsTrigger value="reports">রিপোর্ট</TabsTrigger>
                <TabsTrigger value="insights">অন্তর্দৃষ্টি</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">বিশ্লেষণ সিস্টেম</h3>
                    <p className="text-gray-600">
                      এই সিস্টেমটি ভোটার ডেটার উপর ভিত্তি করে বিভিন্ন ধরনের বিশ্লেষণ ও রিপোর্ট তৈরি করে।
                      এটি রাজনৈতিক কৌশল নির্ধারণে সহায়তা করে।
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <PieChart className="w-4 h-4 text-blue-600" />
                          <span>ভোট সম্ভাবনা বিশ্লেষণ</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• উচ্চ সম্ভাবনার ভোটার (৭০%+)</li>
                          <li>• মধ্যম সম্ভাবনার ভোটার (৪০-৭০%)</li>
                          <li>• নিম্ন সম্ভাবনার ভোটার (৪০%-)</li>
                          <li>• অনিশ্চিত ভোটার</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>ভৌগোলিক বিশ্লেষণ</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• বিভাগ ভিত্তিক ভোটার বন্টন</li>
                          <li>• জেলা ভিত্তিক বিশ্লেষণ</li>
                          <li>• উপজেলা ভিত্তিক ট্রেন্ড</li>
                          <li>• গ্রাম ভিত্তিক ডেটা</li>
                        </ul>
                      </Card>
                    </div>

                    <Card className="p-4 bg-purple-50 border-purple-200">
                      <h4 className="font-medium text-purple-800">বিশ্লেষণের ধরন</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium">পরিমাণগত বিশ্লেষণ</h5>
                          <ul className="text-purple-700">
                            <li>• ভোটার সংখ্যা</li>
                            <li>• বয়স বিতরণ</li>
                            <li>• লিঙ্গ অনুপাত</li>
                            <li>• সম্ভাবনার হার</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">গুণগত বিশ্লেষণ</h5>
                          <ul className="text-purple-700">
                            <li>• রাজনৈতিক আচরণ</li>
                            <li>• সমর্থনের ধরন</li>
                            <li>• প্রভাবশালী ব্যক্তিত্ব</li>
                            <li>• স্থানীয় ইস্যু</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="charts">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">চার্ট ও গ্রাফের ধরন</h3>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h4 className="font-medium">বার চার্ট</h4>
                        <p className="text-sm text-gray-600 mt-2">এলাকা ভিত্তিক ভোটার সংখ্যা তুলনা</p>
                        <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`<BarChart data={votersByLocation}>
  <Bar dataKey="count" fill="#3B82F6" />
  <XAxis dataKey="location" />
  <YAxis />
</BarChart>`}
                        </pre>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium">পাই চার্ট</h4>
                        <p className="text-sm text-gray-600 mt-2">ভোট সম্ভাবনার শতাংশ বিতরণ</p>
                        <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`<PieChart data={probabilityDistribution}>
  <Pie dataKey="value" fill="#8884d8" />
  <Tooltip />
  <Legend />
</PieChart>`}
                        </pre>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium">লাইন চার্ট</h4>
                        <p className="text-sm text-gray-600 mt-2">সময়ের সাথে ভোটার সংগ্রহের ট্রেন্ড</p>
                        <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`<LineChart data={voterCollectionTrend}>
  <Line type="monotone" dataKey="count" stroke="#10B981" />
  <XAxis dataKey="date" />
  <YAxis />
</LineChart>`}
                        </pre>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium">এরিয়া চার্ট</h4>
                        <p className="text-sm text-gray-600 mt-2">বয়স ভিত্তিক ভোটার বিতরণ</p>
                        <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`<AreaChart data={ageDistribution}>
  <Area type="monotone" dataKey="count" fill="#F59E0B" />
  <XAxis dataKey="ageGroup" />
  <YAxis />
</AreaChart>`}
                        </pre>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reports">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">রিপোর্টের ধরন</h3>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">দৈনিক রিপোর্ট</h4>
                          <Badge variant="outline">প্রতিদিন</Badge>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• নতুন ভোটার যোগ</li>
                          <li>• আপডেট করা তথ্য</li>
                          <li>• ডেটা কোয়ালিটি চেক</li>
                          <li>• ফিল্ড টিমের কার্যক্রম</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">সাপ্তাহিক রিপোর্ট</h4>
                          <Badge variant="outline">সাপ্তাহিক</Badge>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ভোটার সংগ্রহের ট্রেন্ড</li>
                          <li>• এলাকা ভিত্তিক অগ্রগতি</li>
                          <li>• টার্গেট বনাম অর্জন</li>
                          <li>• সমস্যা ও সমাধান</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">মাসিক রিপোর্ট</h4>
                          <Badge variant="outline">মাসিক</Badge>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• সামগ্রিক ভোটার পরিস্থিতি</li>
                          <li>• রাজনৈতিক বিশ্লেষণ</li>
                          <li>• কৌশলগত সুপারিশ</li>
                          <li>• পরবর্তী মাসের পরিকল্পনা</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">নির্বাচনী রিপোর্ট</h4>
                          <Badge variant="outline">বিশেষ</Badge>
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• ভোট প্রাক্কলন</li>
                          <li>• কৌশলগত পরিকল্পনা</li>
                          <li>• রিস্ক অ্যাসেসমেন্ট</li>
                          <li>• ক্যাম্পেইন সুপারিশ</li>
                        </ul>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="insights">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ডেটা অন্তর্দৃষ্টি</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">প্রধান সূচক (KPIs)</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">ভোটার সংগ্রহের হার</p>
                          <p className="text-xs text-gray-600">প্রতিদিন কতজন নতুন ভোটার যোগ হচ্ছে</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ভোট সম্ভাবনার গড়</p>
                          <p className="text-xs text-gray-600">সামগ্রিক ভোট পাওয়ার সম্ভাবনা</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">এলাকা কভারেজ</p>
                          <p className="text-xs text-gray-600">কতটি এলাকা থেকে ডেটা সংগ্রহ হয়েছে</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ডেটা কোয়ালিটি স্কোর</p>
                          <p className="text-xs text-gray-600">তথ্যের নির্ভুলতা ও সম্পূর্ণতা</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">ট্রেন্ড বিশ্লেষণ</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• বয়স্ক ভোটারদের মধ্যে সমর্থন বেশি</li>
                        <li>• গ্রামীণ এলাকায় ভোট সম্ভাবনা বেশি</li>
                        <li>• শিক্ষিত ভোটারদের মধ্যে সচেতনতা বেশি</li>
                        <li>• যুব সমাজে আগ্রহ বৃদ্ধি পাচ্ছে</li>
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">চ্যালেঞ্জ ও সুযোগ</h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-red-600">চ্যালেঞ্জ</h5>
                          <ul className="text-xs text-gray-600 mt-1">
                            <li>• শহুরে এলাকায় কম সমর্থন</li>
                            <li>• নারী ভোটারদের সংখ্যা কম</li>
                            <li>• তরুণ প্রজন্মের দূরত্ব</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-green-600">সুযোগ</h5>
                          <ul className="text-xs text-gray-600 mt-1">
                            <li>• গ্রামীণ এলাকায় শক্ত ভিত্তি</li>
                            <li>• ধর্মীয় সচেতনতা বৃদ্ধি</li>
                            <li>• সোশ্যাল নেটওয়ার্ক সম্প্রসারণ</li>
                          </ul>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <h4 className="font-medium text-yellow-800">সুপারিশ</h4>
                      <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                        <li>• শহুরে এলাকায় বিশেষ ক্যাম্পেইন চালু করুন</li>
                        <li>• নারী ভোটারদের জন্য আলাদা কর্মসূচি</li>
                        <li>• যুব সমাজের সাথে সংযোগ বৃদ্ধি করুন</li>
                        <li>• ডিজিটাল প্ল্যাটফর্ম ব্যবহার করুন</li>
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

export default AnalyticsSystem;
