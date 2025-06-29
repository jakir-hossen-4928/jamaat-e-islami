
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, Users, Home, Map } from 'lucide-react';

const LocationDocumentation = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="w-12 h-12 text-green-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">
            এলাকা ব্যবস্থাপনা সিস্টেম
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          বাংলাদেশের প্রশাসনিক এলাকা ব্যবস্থাপনার জন্য একটি সম্পূর্ণ সিস্টেম। 
          বিভাগ থেকে শুরু করে গ্রাম পর্যায় পর্যন্ত সকল এলাকার তথ্য সংরক্ষণ ও ব্যবস্থাপনা।
        </p>
      </div>

      {/* Location Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>প্রশাসনিক কাঠামো</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">বিভাগ</h3>
              <p className="text-sm text-blue-700">৮টি বিভাগ</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">জেলা</h3>
              <p className="text-sm text-green-700">৬৪টি জেলা</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-yellow-900">উপজেলা</h3>
              <p className="text-sm text-yellow-700">৪৯০+ উপজেলা</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Home className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">ইউনিয়ন</h3>
              <p className="text-sm text-purple-700">৪৫০০+ ইউনিয়ন</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Map className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold text-red-900">গ্রাম</h3>
              <p className="text-sm text-red-700">৮০,০০০+ গ্রাম</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>মূল ফিচার</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Badge className="mr-2">যোগ</Badge>
                নতুন এলাকা যোগ করুন
              </li>
              <li className="flex items-center">
                <Badge className="mr-2">সম্পাদনা</Badge>
                এলাকার তথ্য আপডেট করুন
              </li>
              <li className="flex items-center">
                <Badge className="mr-2">মুছে ফেলুন</Badge>
                অপ্রয়োজনীয় এলাকা মুছুন
              </li>
              <li className="flex items-center">
                <Badge className="mr-2">ডাউনলোড</Badge>
                JSON ফরম্যাটে ডাটা রপ্তানি
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ব্যবহারের নির্দেশনা</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside">
              <li>প্রথমে উপরের স্তর নির্বাচন করুন (বিভাগ/জেলা)</li>
              <li>প্রয়োজনীয় তথ্য পূরণ করুন</li>
              <li>"যোগ করুন" বাটনে ক্লিক করুন</li>
              <li>তালিকায় নতুন এন্ট্রি দেখুন</li>
              <li>ডাউনলোড করতে "ডাউনলোড" বাটন ব্যবহার করুন</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Data Structure */}
      <Card>
        <CardHeader>
          <CardTitle>ডেটা কাঠামো</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-800">
{`বিভাগ: {
  id: string,
  name: string (ইংরেজি),
  bn_name: string (বাংলা),
  url: string
}

জেলা: {
  id: string,
  division_id: string,
  name: string,
  bn_name: string,
  lat: string,
  lon: string,
  url: string
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDocumentation;
