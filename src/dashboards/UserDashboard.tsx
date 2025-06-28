
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';

const UserDashboard = () => {
  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">ব্যবহারকারী ড্যাশবোর্ড</h1>
          <p className="mt-2 text-gray-100">ভোটার তথ্য সংগ্রহ এবং আপডেট</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span>নতুন ভোটার যোগ করুন</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/admin/add-voter">ভোটার এন্ট্রি করুন</a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/google-form">গুগল ফর্ম ব্যবহার করুন</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>আমার এন্ট্রি সমূহ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                জমা দেওয়া ডেটা দেখুন
              </Button>
              <Button className="w-full" variant="outline">
                আপডেট করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default UserDashboard;
