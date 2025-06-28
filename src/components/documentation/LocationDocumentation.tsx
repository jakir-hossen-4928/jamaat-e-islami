
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, FileText, MapPin, Database, Settings, Users } from 'lucide-react';

const LocationDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>এলাকা ব্যবস্থাপনা ডকুমেন্টেশন</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
              <TabsTrigger value="structure">কাঠামো</TabsTrigger>
              <TabsTrigger value="api">API রেফারেন্স</TabsTrigger>
              <TabsTrigger value="examples">উদাহরণ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">এলাকা ব্যবস্থাপনা সিস্টেম</h3>
                  <p className="text-gray-600">
                    এই সিস্টেমটি বাংলাদেশের প্রশাসনিক এলাকাসমূহের একটি সম্পূর্ণ হায়ারার্কিক্যাল কাঠামো প্রদান করে।
                    এটি বিভাগ থেকে শুরু করে গ্রাম পর্যায় পর্যন্ত সকল প্রশাসনিক স্তরকে অন্তর্ভুক্ত করে।
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>প্রশাসনিক স্তর</span>
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• বিভাগ (Division) - ৮টি</li>
                        <li>• জেলা (District) - ৬৪টি</li>
                        <li>• উপজেলা (Upazila) - ৪৯৫টি</li>
                        <li>• ইউনিয়ন (Union) - ৪,৫০০+</li>
                        <li>• গ্রাম (Village) - কাস্টমাইজেবল</li>
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>ব্যবহারকারীর ভূমিকা</span>
                      </h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• সুপার অ্যাডমিন - সব অ্যাক্সেস</li>
                        <li>• বিভাগীয় অ্যাডমিন - বিভাগ স্তর</li>
                        <li>• জেলা অ্যাডমিন - জেলা স্তর</li>
                        <li>• উপজেলা অ্যাডমিন - উপজেলা স্তর</li>
                        <li>• ইউনিয়ন অ্যাডমিন - ইউনিয়ন স্তর</li>
                        <li>• গ্রাম অ্যাডমিন - গ্রাম স্তর</li>
                      </ul>
                    </Card>
                  </div>

                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-800">মূল বৈশিষ্ট্য</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>• হায়ারার্কিক্যাল ডেটা স্ট্রাকচার</li>
                      <li>• রোল-বেসড অ্যাক্সেস কন্ট্রোল</li>
                      <li>• ডায়নামিক ফিল্টারিং</li>
                      <li>• গ্রাম বিল্ডার টুল</li>
                      <li>• JSON এক্সপোর্ট সুবিধা</li>
                    </ul>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="structure">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">ডেটা কাঠামো</h3>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">বিভাগ (Division)</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "division_1",
  "name": "Dhaka",
  "bn_name": "ঢাকা"
}`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">জেলা (District)</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "district_1",
  "division_id": "division_1",
  "name": "Dhaka",
  "bn_name": "ঢাকা"
}`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">উপজেলা (Upazila)</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "upazila_1",
  "district_id": "district_1",
  "name": "Dhanmondi",
  "bn_name": "ধানমন্ডি"
}`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">ইউনিয়ন (Union)</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "union_1",
  "upazilla_id": "upazila_1",
  "name": "Ward 1",
  "bn_name": "ওয়ার্ড ১"
}`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">গ্রাম (Village)</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "village_1",
  "union_id": "union_1",
  "upazila_id": "upazila_1",
  "district_id": "district_1",
  "division_id": "division_1",
  "name": "Mohammadpur",
  "bn_name": "মোহাম্মদপুর"
}`}
                    </pre>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="api">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">API রেফারেন্স</h3>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Location Filter Hook</h4>
                    <Badge variant="outline" className="mb-2">useLocationFilter()</Badge>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const {
  locationFilter,      // Current filter object
  setLocationFilter,   // Function to update filter
  filterVoters,       // Function to filter voters
  canAccessData,      // Check access permissions
  userProfile         // Current user profile
} = useLocationFilter();`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">RBAC Functions</h4>
                    <div className="space-y-2">
                      <div>
                        <Badge variant="outline">canAccessLocation(user, location)</Badge>
                        <p className="text-sm text-gray-600 mt-1">Check if user can access specific location</p>
                      </div>
                      <div>
                        <Badge variant="outline">getRolePermissions(role)</Badge>
                        <p className="text-sm text-gray-600 mt-1">Get permissions for a specific role</p>
                      </div>
                      <div>
                        <Badge variant="outline">getAccessibleVoters(user, voters)</Badge>
                        <p className="text-sm text-gray-600 mt-1">Filter voters based on user access</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Location Data Loader</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`const loadLocationData = async (type: string) => {
  // Loads data from /public/data/{type}.json
  // Supports: divisions, districts, upazilas, unions, villages
  // Returns cached data if available
}`}
                    </pre>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="examples">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">ব্যবহারের উদাহরণ</h3>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">১. ভোটার ফিল্টারিং</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Component example
const VoterList = () => {
  const { filterVoters, locationFilter } = useLocationFilter();
  const { data: allVoters } = useQuery(['voters'], fetchVoters);
  
  const filteredVoters = filterVoters(allVoters || []);
  
  return (
    <div>
      <VoterLocationFilter />
      <VoterTable voters={filteredVoters} />
    </div>
  );
};`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">২. অ্যাক্সেস চেক</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Check if user can access specific location data
const { canAccessData } = useLocationFilter();

const canViewDhakaData = canAccessData({
  division_id: 'division_1'
});

if (canViewDhakaData) {
  // Show Dhaka division data
}`}
                    </pre>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">৩. গ্রাম তৈরি</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Create new village
const newVillage = {
  name: 'New Village',
  bn_name: 'নতুন গ্রাম',
  union_id: 'selected_union_id',
  // Parent IDs auto-filled from union selection
};

// Add to local cache and download JSON
locationCache.villages.push(newVillage);
downloadVillagesJSON();`}
                    </pre>
                  </Card>

                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="font-medium text-green-800">বেস্ট প্র্যাকটিস</h4>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>• সর্বদা ইউজারের অ্যাক্সেস লেভেল চেক করুন</li>
                      <li>• ক্যাশিং ব্যবহার করে পারফরম্যান্স উন্নত করুন</li>
                      <li>• হায়ারার্কিক্যাল ফিল্টারিং মেইনটেইন করুন</li>
                      <li>• এরর হ্যান্ডলিং যোগ করুন</li>
                      <li>• টাইপ সেফটি নিশ্চিত করুন</li>
                    </ul>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDocumentation;
