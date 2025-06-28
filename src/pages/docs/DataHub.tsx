
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Upload, Download, FileText, Shield } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const DataHub = () => {
  usePageTitle('ডেটা হাব ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>ডেটা হাব ডকুমেন্টেশন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
                <TabsTrigger value="import-export">আমদানি/রপ্তানি</TabsTrigger>
                <TabsTrigger value="backup">ব্যাকআপ</TabsTrigger>
                <TabsTrigger value="security">নিরাপত্তা</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ডেটা হাব সিস্টেম</h3>
                    <p className="text-gray-600">
                      ডেটা হাব হল ভোটার ব্যবস্থাপনা সিস্টেমের কেন্দ্রীয় ডেটা ব্যবস্থাপনা কেন্দ্র।
                      এটি ডেটা আমদানি, রপ্তানি, ব্যাকআপ এবং নিরাপত্তার জন্য ব্যবহৃত হয়।
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-green-600" />
                          <span>ডেটা আমদানি</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• CSV ফাইল আপলোড</li>
                          <li>• Excel ফাইল সাপোর্ট</li>
                          <li>• JSON ডেটা আমদানি</li>
                          <li>• বাল্ক ডেটা আপলোড</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Download className="w-4 h-4 text-blue-600" />
                          <span>ডেটা রপ্তানি</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• CSV ফরম্যাটে ডাউনলোড</li>
                          <li>• Excel ফাইল তৈরি</li>
                          <li>• PDF রিপোর্ট জেনারেশন</li>
                          <li>• কাস্টম ফিল্টার এক্সপোর্ট</li>
                        </ul>
                      </Card>
                    </div>

                    <Card className="p-4 bg-indigo-50 border-indigo-200">
                      <h4 className="font-medium text-indigo-800">সাপোর্টেড ফাইল ফরম্যাট</h4>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium">আমদানি</h5>
                          <ul className="text-indigo-700">
                            <li>• .csv</li>
                            <li>• .xlsx</li>
                            <li>• .json</li>
                            <li>• .xml</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">রপ্তানি</h5>
                          <ul className="text-indigo-700">
                            <li>• .csv</li>
                            <li>• .xlsx</li>
                            <li>• .pdf</li>
                            <li>• .json</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">ব্যাকআপ</h5>
                          <ul className="text-indigo-700">
                            <li>• .zip</li>
                            <li>• .sql</li>
                            <li>• .bak</li>
                            <li>• .tar.gz</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="import-export">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ডেটা আমদানি ও রপ্তানি</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">CSV আমদানি প্রক্রিয়া</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                          <span className="text-sm">CSV ফাইল নির্বাচন করুন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                          <span className="text-sm">কলাম ম্যাপিং যাচাই করুন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                          <span className="text-sm">ডেটা ভ্যালিডেশন চালান</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৪</div>
                          <span className="text-sm">আমদানি সম্পূর্ণ করুন</span>
                        </div>
                      </div>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-3 overflow-x-auto">
{`// CSV Header Format
ID,Voter Name,Age,Gender,Phone,Will Vote,Vote Probability (%),division_id

// Example Row
V001,মোহাম্মদ রহিম,35,Male,01712345678,Yes,85,division_1`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">এক্সপোর্ট অপশন</h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium">সাধারণ এক্সপোর্ট</h5>
                          <p className="text-xs text-gray-600">সমস্ত ভোটার ডেটা</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`// Export all voters
const exportData = await getVoterData();
downloadCSV(exportData, 'all-voters.csv');`}
                          </pre>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">ফিল্টার্ড এক্সপোর্ট</h5>
                          <p className="text-xs text-gray-600">নির্দিষ্ট শর্ত অনুযায়ী</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`// Export filtered data
const filteredData = voters.filter(v => 
  v.district_id === 'district_1' && 
  v.voteProbability >= 70
);
downloadCSV(filteredData, 'high-probability-dhaka.csv');`}
                          </pre>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">ডেটা ভ্যালিডেশন রুলস</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">আবশ্যক</Badge>
                          <span>ID, Voter Name ফিল্ড অবশ্যই থাকতে হবে</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">ফরম্যাট</Badge>
                          <span>ফোন নম্বর ১১ ডিজিটের হতে হবে</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">রেঞ্জ</Badge>
                          <span>Vote Probability ১০-১০০ এর মধ্যে</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">ইউনিক</Badge>
                          <span>ID ফিল্ড ডুপ্লিকেট হতে পারবে না</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">ব্যাচ প্রসেসিং</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// Batch processing example
const processBatchImport = async (file) => {
  const BATCH_SIZE = 1000;
  const data = await parseCSV(file);
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    // Validate batch
    const validatedBatch = validateBatch(batch);
    
    // Import batch to database
    await importBatchToFirestore(validatedBatch);
    
    // Update progress
    updateProgress((i + BATCH_SIZE) / data.length * 100);
  }
};`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="backup">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ব্যাকআপ ও রিস্টোর</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">অটোমেটিক ব্যাকআপ</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">দৈনিক ব্যাকআপ:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">সাপ্তাহিক ফুল ব্যাকআপ:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">মাসিক আর্কাইভ:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                      </div>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-3 overflow-x-auto">
{`// Backup schedule configuration
const backupSchedule = {
  daily: {
    time: "02:00 AM",
    retention: "30 days",
    type: "incremental"
  },
  weekly: {
    day: "Sunday",
    time: "01:00 AM", 
    retention: "12 weeks",
    type: "full"
  },
  monthly: {
    date: "1st",
    time: "00:00 AM",
    retention: "12 months", 
    type: "archive"
  }
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">ম্যানুয়াল ব্যাকআপ</h4>
                      <p className="text-sm text-gray-600 mt-2">যেকোনো সময় ম্যানুয়াল ব্যাকআপ নিতে পারেন</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                          <span className="text-sm">ব্যাকআপ টাইপ নির্বাচন (ফুল/ইনক্রিমেন্টাল)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                          <span className="text-sm">ডেটা রেঞ্জ সিলেক্ট করুন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                          <span className="text-sm">কমপ্রেশন লেভেল সেট করুন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">৪</div>
                          <span className="text-sm">ব্যাকআপ শুরু করুন</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">ডেটা রিস্টোর প্রক্রিয়া</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// Data restore process
const restoreData = async (backupFile, options) => {
  try {
    // 1. Validate backup file
    const isValid = await validateBackupFile(backupFile);
    if (!isValid) throw new Error('Invalid backup file');
    
    // 2. Create restore point
    await createRestorePoint();
    
    // 3. Stop write operations
    await setMaintenanceMode(true);
    
    // 4. Restore data
    const result = await restoreFromBackup(backupFile, options);
    
    // 5. Validate restored data
    await validateRestoredData();
    
    // 6. Resume operations
    await setMaintenanceMode(false);
    
    return result;
  } catch (error) {
    console.error('Restore failed:', error);
    await rollbackRestore();
    throw error;
  }
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">ব্যাকআপ স্ট্যাটিস্টিক্স</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium">সর্বশেষ ব্যাকআপ</h5>
                          <p className="text-xs text-gray-600">২৮ ডিসেম্বর ২০২৪, ২:০০ AM</p>
                          <p className="text-xs text-green-600">সফল</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">ব্যাকআপ সাইজ</h5>
                          <p className="text-xs text-gray-600">৫২৫ MB (কমপ্রেসড)</p>
                          <p className="text-xs text-gray-600">১.২ GB (আনকমপ্রেসড)</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">সংরক্ষিত ব্যাকআপ</h5>
                          <p className="text-xs text-gray-600">৩০ দৈনিক ব্যাকআপ</p>
                          <p className="text-xs text-gray-600">১২ সাপ্তাহিক ব্যাকআপ</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">স্টোরেজ ব্যবহার</h5>
                          <p className="text-xs text-gray-600">১৫.৮ GB / ৫০ GB</p>
                          <p className="text-xs text-blue-600">৩১.৬% ব্যবহৃত</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="security">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ডেটা নিরাপত্তা</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-red-800">এক্সেস কন্ট্রোল</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">সুপার অ্যাডমিন:</span>
                          <Badge className="bg-red-100 text-red-800">সকল অ্যাক্সেস</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ডেটা ম্যানেজার:</span>
                          <Badge className="bg-orange-100 text-orange-800">আমদানি/রপ্তানি</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">অ্যানালিস্ট:</span>
                          <Badge className="bg-yellow-100 text-yellow-800">শুধুমাত্র রপ্তানি</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ভিউয়ার:</span>
                          <Badge className="bg-gray-100 text-gray-800">শুধুমাত্র দেখা</Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">এনক্রিপশন</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• ট্রানজিটে ডেটা এনক্রিপশন (TLS 1.3)</li>
                        <li>• রেস্টে ডেটা এনক্রিপশন (AES-256)</li>
                        <li>• ব্যাকআপ ফাইল এনক্রিপশন</li>
                        <li>• API কমিউনিকেশন সিকিউরিটি</li>
                      </ul>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-3 overflow-x-auto">
{`// Encryption configuration
const securityConfig = {
  encryption: {
    algorithm: "AES-256-GCM",
    keyRotation: "monthly",
    backupEncryption: true
  },
  transmission: {
    protocol: "TLS 1.3",
    certificateValidation: true
  },
  access: {
    sessionTimeout: "30 minutes",
    maxFailedAttempts: 3,
    ipWhitelist: true
  }
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">অডিট লগ</h4>
                      <p className="text-sm text-gray-600 mt-2">সকল ডেটা অপারেশন লগ করা হয়</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>ব্যবহারকারী লগইন/লগআউট</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>ডেটা আমদানি/রপ্তানি অ্যাক্টিভিটি</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>ব্যাকআপ ও রিস্টোর অপারেশন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span>ফাইল ডাউনলোড ও আপলোড</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">ডেটা প্রাইভেসি</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• ব্যক্তিগত তথ্য মাস্কিং</li>
                        <li>• সেনসিটিভ ডেটা রেডঅ্যাকশন</li>
                        <li>• ডেটা রিটেনশন পলিসি</li>
                        <li>• GDPR কমপ্লায়েন্স</li>
                      </ul>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-3 overflow-x-auto">
{`// Data privacy implementation
const maskSensitiveData = (voter) => ({
  ...voter,
  Phone: voter.Phone?.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2'),
  NID: voter.NID?.replace(/\d{6}(\d{4})/, '******$1'),
  'Voter Name': voter['Voter Name']?.charAt(0) + '***'
});

// Export with privacy protection
const exportWithPrivacy = (voters, userRole) => {
  if (userRole !== 'super_admin') {
    return voters.map(maskSensitiveData);
  }
  return voters;
};`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-red-50 border-red-200">
                      <h4 className="font-medium text-red-800">নিরাপত্তা সতর্কতা</h4>
                      <ul className="mt-2 space-y-1 text-sm text-red-700">
                        <li>• কখনো পাসওয়ার্ড প্লেইন টেক্সটে সংরক্ষণ করবেন না</li>
                        <li>• পাবলিক নেটওয়ার্কে সেনসিটিভ ডেটা ট্রান্সফার এড়িয়ে চলুন</li>
                        <li>• নিয়মিত সিস্টেম আপডেট ও প্যাচ করুন</li>
                        <li>• অননুমোদিত অ্যাক্সেস মনিটর করুন</li>
                        <li>• ব্যাকআপ ফাইল নিরাপদ স্থানে সংরক্ষণ করুন</li>
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

export default DataHub;
