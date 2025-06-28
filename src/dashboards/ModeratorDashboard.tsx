
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText } from 'lucide-react';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

const ModeratorDashboard = () => {
  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">মডারেটর ড্যাশবোর্ড</h1>
          <p className="mt-2 text-indigo-100">ডেটা পর্যালোচনা এবং সম্পাদনা</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>ভোটার ডেটা পর্যালোচনা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/voters">ভোটার তালিকা দেখুন</a>
              </Button>
              <Button className="w-full" variant="outline">
                পেন্ডিং এন্ট্রি পর্যালোচনা
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>রিপোর্ট এবং বিশ্লেষণ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/analytics">এলাকার রিপোর্ট</a>
              </Button>
              <Button className="w-full" variant="outline">
                ডেটা যাচাইকরণ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default ModeratorDashboard;
