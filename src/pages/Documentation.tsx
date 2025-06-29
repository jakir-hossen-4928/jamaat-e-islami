import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  BarChart3,
  Database,
  Settings,
  ArrowRight,
  BookOpen,
  Shield
} from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const Documentation = () => {
  usePageTitle('ডকুমেন্টেশন - জামায়াতে ইসলামী ভোটার সিস্টেম');

  const features = [
    {
      icon: Users,
      title: 'ভোটার ব্যবস্থাপনা',
      description: 'ভোটার তথ্য যোগ, সম্পাদনা এবং ব্যবস্থাপনা',
      path: '/documentation/voter-management',
      badge: 'মূল ফিচার'
    },
    {
      icon: MapPin,
      title: 'এলাকা ব্যবস্থাপনা',
      description: 'বিভাগ, জেলা, উপজেলা, ইউনিয়ন ও গ্রাম ব্যবস্থাপনা',
      path: '/documentation/location-management',
      badge: 'প্রশাসনিক'
    },
    {
      icon: BarChart3,
      title: 'বিশ্লেষণ সিস্টেম',
      description: 'ভোটার ডেটা বিশ্লেষণ ও রিপোর্ট তৈরি',
      path: '/documentation/analytics-system',
      badge: 'রিপোর্টিং'
    },
    {
      icon: Database,
      title: 'ডেটা ব্যবস্থাপনা',
      description: 'ডেটা আমদানি/রপ্তানি ও ব্যাকআপ',
      path: '/documentation/data-hub',
      badge: 'ডেটা'
    }
  ];

  const quickStart = [
    'প্রথমে লগইন করুন আপনার অ্যাকাউন্ট দিয়ে',
    'ড্যাশবোর্ড থেকে আপনার ভূমিকা অনুযায়ী অপশন দেখুন',
    'ভোটার যোগ করতে "ভোটার যোগ করুন" অপশনে যান',
    'এলাকা ভিত্তিক ডেটা দেখতে ফিল্টার ব্যবহার করুন'
  ];

  return (
    <DocumentationLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              ভোটার ব্যবস্থাপনা সিস্টেম
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            জামায়াতে ইসলামী বাংলাদেশের জন্য একটি সম্পূর্ণ ভোটার ব্যবস্থাপনা ও বিশ্লেষণ সিস্টেম।
            এই সিস্টেম দিয়ে আপনি ভোটার তথ্য সংগ্রহ, সংরক্ষণ, বিশ্লেষণ করতে পারবেন।
          </p>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="w-5 h-5 mr-2 text-green-600" />
              দ্রুত শুরু করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {quickStart.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">
                  ড্যাশবোর্ডে যান
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">মূল ফিচারসমূহ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.path} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="w-8 h-8 text-green-600" />
                      <Badge variant="secondary">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <Link to={feature.path}>
                      <Button variant="outline" size="sm" className="w-full">
                        বিস্তারিত দেখুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              সিস্টেম কাঠামো
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">ভূমিকা ভিত্তিক অ্যাক্সেস</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>সুপার অ্যাডমিন:</strong> সর্বোচ্চ অধিকার</li>
                  <li>• <strong>বিভাগীয় অ্যাডমিন:</strong> বিভাগ পর্যায়ে অধিকার</li>
                  <li>• <strong>জেলা অ্যাডমিন:</strong> জেলা পর্যায়ে অধিকার</li>
                  <li>• <strong>উপজেলা অ্যাডমিন:</strong> উপজেলা পর্যায়ে অধিকার</li>
                  <li>• <strong>ইউনিয়ন অ্যাডমিন:</strong> ইউনিয়ন পর্যায়ে অধিকার</li>
                  <li>• <strong>গ্রাম অ্যাডমিন:</strong> গ্রাম পর্যায়ে অধিকার</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">ডেটা নিরাপত্তা</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Firebase Authentication ব্যবহার</li>
                  <li>• এলাকা ভিত্তিক ডেটা অ্যাক্সেস নিয়ন্ত্রণ</li>
                  <li>• রিয়েল-টাইম ডেটা সিঙ্ক</li>
                  <li>• স্বয়ংক্রিয় ব্যাকআপ সিস্টেম</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>প্রযুক্তিগত বিবরণ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">ফ্রন্টএন্ড</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Shadcn/ui components</li>
                  <li>• React Router</li>
                  <li>• Vite Build Tool</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">ব্যাকএন্ড</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Firebase Firestore Database</li>
                  <li>• Firebase Authentication</li>
                  <li>• Real-time Data Sync</li>
                  <li>• Secure Data Storage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DocumentationLayout>
  );
};

export default Documentation;
