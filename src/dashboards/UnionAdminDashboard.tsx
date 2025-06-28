
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, FileText, BarChart3, MapPin } from 'lucide-react';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import { useAuth } from '@/hooks/useAuth';

const UnionAdminDashboard = () => {
  const { userProfile } = useAuth();

  return (
    <RoleBasedSidebar>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">ইউনিয়ন অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="mt-2 text-orange-100">ইউনিয়ন পর্যায়ে ভোটার ব্যবস্থাপনা</p>
          {userProfile?.accessScope?.union_name && (
            <div className="mt-3 flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">
                এলাকা: {userProfile.accessScope.union_name}
                {userProfile.accessScope.upazila_name && `, ${userProfile.accessScope.upazila_name}`}
                {userProfile.accessScope.district_name && `, ${userProfile.accessScope.district_name}`}
              </span>
            </div>
          )}
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
                <span>ইউনিয়নের ভোটার তালিকা</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/voters">ভোটার তালিকা দেখুন</a>
              </Button>
              <Button className="w-full" variant="outline">
                আমার এন্ট্রি দেখুন
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>রিপোর্ট ও পরিসংখ্যান</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" asChild>
                <a href="/admin/analytics">ইউনিয়নের রিপোর্ট</a>
              </Button>
              <Button className="w-full" variant="outline">
                ডেটা এক্সপোর্ট
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>দ্রুত অ্যাকশন</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                আজকের এন্ট্রি
              </Button>
              <Button className="w-full" variant="outline">
                আপডেট প্রয়োজন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleBasedSidebar>
  );
};

export default UnionAdminDashboard;
