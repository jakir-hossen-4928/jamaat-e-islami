
import React from 'react';
import DocumentationLayout from '@/components/layout/DocumentationLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Users, Shield, Bell, Palette } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';

const SystemSettings = () => {
  usePageTitle('সিস্টেম সেটিংস ডকুমেন্টেশন');

  return (
    <DocumentationLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span>সিস্টেম সেটিংস ডকুমেন্টেশন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">সংক্ষিপ্ত বিবরণ</TabsTrigger>
                <TabsTrigger value="user-management">ব্যবহারকারী</TabsTrigger>
                <TabsTrigger value="permissions">অনুমতি</TabsTrigger>
                <TabsTrigger value="customization">কাস্টমাইজেশন</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">সিস্টেম সেটিংস</h3>
                    <p className="text-gray-600">
                      সিস্টেম সেটিংস সেকশনে আপনি পুরো সিস্টেমের কনফিগারেশন, ব্যবহারকারী ব্যবস্থাপনা,
                      নিরাপত্তা সেটিংস এবং অন্যান্য সিস্টেম লেভেল সেটিংস পরিবর্তন করতে পারেন।
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>ব্যবহারকারী ব্যবস্থাপনা</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• নতুন ব্যবহারকারী যোগ</li>
                          <li>• ভূমিকা নির্ধারণ</li>
                          <li>• অ্যাক্সেস কন্ট্রোল</li>
                          <li>• অ্যাকাউন্ট স্ট্যাটাস ব্যবস্থাপনা</li>
                        </ul>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-red-600" />
                          <span>নিরাপত্তা সেটিংস</span>
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          <li>• পাসওয়ার্ড পলিসি</li>
                          <li>• সেশন টাইমআউট</li>
                          <li>• দু-ফ্যাক্টর অথেনটিকেশন</li>
                          <li>• IP হোয়াইটলিস্টিং</li>
                        </ul>
                      </Card>
                    </div>

                    <Card className="p-4 bg-gray-50 border-gray-200">
                      <h4 className="font-medium text-gray-800">সিস্টেম কনফিগারেশন স্তর</h4>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium">গ্লোবাল সেটিংস</h5>
                          <ul className="text-gray-700">
                            <li>• সিস্টেম টাইমজোন</li>
                            <li>• ডিফল্ট ভাষা</li>
                            <li>• ডেটা রিটেনশন পলিসি</li>
                            <li>• সিস্টেম থিম</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium">অর্গানাইজেশনাল সেটিংস</h5>
                          <ul className="text-gray-700">
                            <li>• কোম্পানি তথ্য</li>
                            <li>• লোগো ও ব্র্যান্ডিং</li>
                            <li>• কর্মপ্রবাহ নিয়ম</li>
                            <li>• নোটিফিকেশন সেটিংস</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="user-management">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ব্যবহারকারী ব্যবস্থাপনা</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">ব্যবহারকারীর ভূমিকা</h4>
                      <div className="mt-2 space-y-3">
                        <div className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">সুপার অ্যাডমিন</h5>
                            <Badge className="bg-red-100 text-red-800">সর্বোচ্চ</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">সিস্টেমের সকল অধিকার ও নিয়ন্ত্রণ</p>
                          <ul className="text-xs text-gray-500 mt-2">
                            <li>• সকল ডেটা অ্যাক্সেস</li>
                            <li>• ব্যবহারকারী ব্যবস্থাপনা</li>
                            <li>• সিস্টেম কনফিগারেশন</li>
                            <li>• ব্যাকআপ ও রিস্টোর</li>
                          </ul>
                        </div>

                        <div className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">বিভাগীয় অ্যাডমিন</h5>
                            <Badge className="bg-orange-100 text-orange-800">উচ্চ</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">নির্দিষ্ট বিভাগের সম্পূর্ণ নিয়ন্ত্রণ</p>
                          <ul className="text-xs text-gray-500 mt-2">
                            <li>• বিভাগীয় ডেটা অ্যাক্সেস</li>
                            <li>• SMS ক্যাম্পেইন</li>
                            <li>• রিপোর্ট জেনারেশন</li>
                            <li>• জেলা অ্যাডমিন ব্যবস্থাপনা</li>
                          </ul>
                        </div>

                        <div className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">জেলা অ্যাডমিন</h5>
                            <Badge className="bg-yellow-100 text-yellow-800">মধ্যম</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">নির্দিষ্ট জেলার ডেটা ব্যবস্থাপনা</p>
                          <ul className="text-xs text-gray-500 mt-2">
                            <li>• জেলার ভোটার ডেটা</li>
                            <li>• স্থানীয় ক্যাম্পেইন</li>
                            <li>• উপজেলা কো-অর্ডিনেশন</li>
                            <li>• জেলা ভিত্তিক রিপোর্ট</li>
                          </ul>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">ব্যবহারকারী যোগ করার প্রক্রিয়া</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">১</div>
                          <span className="text-sm">ব্যক্তিগত তথ্য পূরণ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">২</div>
                          <span className="text-sm">ভূমিকা ও অনুমতি নির্ধারণ</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৩</div>
                          <span className="text-sm">এলাকা ভিত্তিক অ্যাক্সেস সেট</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৪</div>
                          <span className="text-sm">ইমেইল ভেরিফিকেশন</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">৫</div>
                          <span className="text-sm">অ্যাকাউন্ট অ্যাক্টিভেশন</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">ব্যবহারকারী স্ট্যাটাস</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">সক্রিয়:</span>
                          <Badge className="bg-green-100 text-green-800">১২৫ জন</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">নিষ্ক্রিয়:</span>
                          <Badge className="bg-gray-100 text-gray-800">১৮ জন</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">পেন্ডিং:</span>
                          <Badge className="bg-yellow-100 text-yellow-800">৭ জন</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">সাসপেন্ডেড:</span>
                          <Badge className="bg-red-100 text-red-800">৩ জন</Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">ব্যবহারকারী ব্যবস্থাপনা API</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// Create new user
const createUser = async (userData) => {
  const user = await createUserAccount(userData);
  await assignRole(user.uid, userData.role);
  await setAccessScope(user.uid, userData.accessScope);
  await sendVerificationEmail(user.email);
  return user;
};

// Update user role
const updateUserRole = async (userId, newRole) => {
  await updateUserClaims(userId, { role: newRole });
  await logUserRoleChange(userId, newRole);
};

// Suspend user
const suspendUser = async (userId, reason) => {
  await updateUser(userId, { 
    status: 'suspended',
    suspensionReason: reason,
    suspendedAt: new Date()
  });
};`}
                      </pre>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="permissions">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">অনুমতি ব্যবস্থাপনা</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-red-800">নিরাপত্তা অনুমতি</h4>
                      <div className="mt-2 space-y-3">
                        <div>
                          <h5 className="text-sm font-medium">ডেটা অ্যাক্সেস</h5>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" checked readOnly />
                              <span>ভোটার ডেটা পড়া</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" checked readOnly />
                              <span>ভোটার ডেটা লেখা</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" readOnly />
                              <span>ভোটার ডেটা মুছে ফেলা</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" readOnly />
                              <span>সেনসিটিভ ডেটা অ্যাক্সেস</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium">অ্যাডমিন ফাংশন</h5>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" readOnly />
                              <span>ব্যবহারকারী ব্যবস্থাপনা</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" readOnly />
                              <span>সিস্টেম সেটিংস</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" readOnly />
                              <span>ব্যাকআপ/রিস্টোর</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <input type="checkbox" checked readOnly />
                              <span>রিপোর্ট জেনারেশন</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">এলাকা ভিত্তিক অ্যাক্সেস</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// Role-based access control example
const checkAccess = (user, resource, action) => {
  // Check role permissions
  const rolePermissions = getRolePermissions(user.role);
  if (!rolePermissions.includes(action)) {
    return false;
  }
  
  // Check location-based access
  if (resource.location) {
    return canAccessLocation(user, resource.location);
  }
  
  return true;
};

// Location access validation
const canAccessLocation = (user, targetLocation) => {
  const userScope = user.accessScope;
  
  if (user.role === 'super_admin') return true;
  
  if (userScope.division_id !== targetLocation.division_id) {
    return false;
  }
  
  if (userScope.district_id && 
      userScope.district_id !== targetLocation.district_id) {
    return false;
  }
  
  return true;
};`}
                      </pre>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">API অ্যাক্সেস কন্ট্রোল</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ভোটার API:</span>
                          <Badge className="bg-green-100 text-green-800">সীমাহীন</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS API:</span>
                          <Badge className="bg-yellow-100 text-yellow-800">১০০০/দিন</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">রিপোর্ট API:</span>
                          <Badge className="bg-blue-100 text-blue-800">৫০/ঘন্টা</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">এক্সপোর্ট API:</span>
                          <Badge className="bg-orange-100 text-orange-800">১০/দিন</Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">অনুমতি ম্যাট্রিক্স</h4>
                      <div className="mt-2 overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">ফিচার</th>
                              <th className="text-center p-2">সুপার</th>
                              <th className="text-center p-2">বিভাগীয়</th>
                              <th className="text-center p-2">জেলা</th>
                              <th className="text-center p-2">উপজেলা</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2">ভোটার যোগ</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">✅</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">SMS ক্যাম্পেইন</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">❌</td>
                              <td className="text-center p-2">❌</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2">ব্যাকআপ</td>
                              <td className="text-center p-2">✅</td>
                              <td className="text-center p-2">❌</td>
                              <td className="text-center p-2">❌</td>
                              <td className="text-center p-2">❌</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="customization">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">সিস্টেম কাস্টমাইজেশন</h3>
                    
                    <Card className="p-4">
                      <h4 className="font-medium text-blue-800">থিম ও ব্র্যান্ডিং</h4>
                      <div className="mt-2 space-y-3">
                        <div>
                          <h5 className="text-sm font-medium">রঙের স্কিম</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-6 h-6 bg-green-600 rounded"></div>
                            <span className="text-sm">প্রাইমারি: গ্রিন (#16A34A)</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-6 h-6 bg-blue-600 rounded"></div>
                            <span className="text-sm">সেকেন্ডারি: ব্লু (#2563EB)</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium">লোগো সেটিংস</h5>
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            <p>• প্রধান লোগো: ২৫৬x৬৪ পিক্সেল</p>
                            <p>• ফেভিকন: ৩২x৩২ পিক্সেল</p>
                            <p>• সাপোর্টেড ফরম্যাট: PNG, SVG</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-green-800">ভাষা ও স্থানীয়করণ</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">প্রাথমিক ভাষা:</span>
                          <Badge className="bg-green-100 text-green-800">বাংলা</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">সেকেন্ডারি ভাষা:</span>
                          <Badge className="bg-blue-100 text-blue-800">ইংরেজি</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">তারিখ ফরম্যাট:</span>
                          <span className="text-sm">DD/MM/YYYY</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">সময় ফরম্যাট:</span>
                          <span className="text-sm">12 ঘন্টা</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-purple-800">নোটিফিকেশন সেটিংস</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ইমেইল নোটিফিকেশন:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS নোটিফিকেশন:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">পুশ নোটিফিকেশন:</span>
                          <Badge className="bg-gray-100 text-gray-800">নিষ্ক্রিয়</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ব্রাউজার নোটিফিকেশন:</span>
                          <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium text-orange-800">সিস্টেম কনফিগারেশন</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm mt-2 overflow-x-auto">
{`// System configuration example
const systemConfig = {
  general: {
    siteName: "জামায়াতে ইসলামী ভোটার সিস্টেম",
    timezone: "Asia/Dhaka",
    language: "bn",
    dateFormat: "DD/MM/YYYY",
    currency: "BDT"
  },
  
  security: {
    sessionTimeout: 30, // minutes
    passwordMinLength: 8,
    maxLoginAttempts: 3,
    enableTwoFactor: false
  },
  
  features: {
    enableSMSCampaign: true,
    enableVoterImport: true,
    enableBulkOperations: true,
    maxExportRows: 10000
  },
  
  branding: {
    primaryColor: "#16A34A",
    secondaryColor: "#2563EB",
    logoUrl: "/assets/logo.png",
    faviconUrl: "/assets/favicon.ico"
  }
};`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <h4 className="font-medium text-yellow-800">কাস্টমাইজেশন টিপস</h4>
                      <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                        <li>• পরিবর্তনের আগে সর্বদা ব্যাকআপ নিন</li>
                        <li>• থিম পরিবর্তনের পর সব ব্রাউজারে টেস্ট করুন</li>
                        <li>• লোগো আপলোডের সময় ফাইল সাইজ চেক করুন</li>
                        <li>• ভাষা পরিবর্তনের পর সব পেজ চেক করুন</li>
                        <li>• নোটিফিকেশন সেটিংস নিয়মিত আপডেট করুন</li>
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

export default SystemSettings;
