
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Shield, Bell, Mail, MessageSquare } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const SystemSettings = () => {
  usePageTitle('সিস্টেম সেটিংস - অ্যাডমিন প্যানেল');
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  // System configuration state
  const [systemConfig, setSystemConfig] = useState({
    systemName: 'জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা',
    maintenanceMode: false,
    registrationEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    maxVotersPerUser: 1000,
    sessionTimeout: 30,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  const [notifications, setNotifications] = useState({
    newUserRegistration: true,
    voterDataUpdate: true,
    systemMaintenance: true,
    securityAlert: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPassword: true,
    twoFactorAuth: false,
    sessionLogging: true,
    ipWhitelist: '',
    maxLoginAttempts: 5
  });

  // Get system stats
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const usersRef = collection(db, 'users');
      const votersRef = collection(db, 'voters');
      
      const [usersSnapshot, votersSnapshot] = await Promise.all([
        getDocs(usersRef),
        getDocs(votersRef)
      ]);
      
      return {
        totalUsers: usersSnapshot.size,
        totalVoters: votersSnapshot.size,
        activeUsers: usersSnapshot.docs.filter(doc => doc.data().approved).length,
        pendingUsers: usersSnapshot.docs.filter(doc => !doc.data().approved).length,
        lastBackup: new Date().toISOString(),
        systemVersion: '1.0.0',
        databaseSize: '2.5 MB'
      };
    }
  });

  // Save system configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      // In a real system, this would save to a settings collection
      console.log('Saving system config:', config);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'সফল',
        description: 'সিস্টেম কনফিগারেশন সংরক্ষিত হয়েছে',
      });
    },
    onError: () => {
      toast({
        title: 'ত্রুটি',
        description: 'কনফিগারেশন সংরক্ষণে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    },
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate({
      systemConfig,
      notifications,
      securitySettings
    });
  };

  const handleBackupNow = () => {
    toast({
      title: 'ব্যাকআপ শুরু',
      description: 'সিস্টেম ব্যাকআপ প্রক্রিয়া শুরু হয়েছে',
    });
  };

  if (userProfile?.role !== 'super_admin') {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">এই পেজে অ্যাক্সেসের জন্য সুপার অ্যাডমিন অনুমতি প্রয়োজন</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">সিস্টেম সেটিংস</h1>
          <p className="mt-2 text-purple-100">সিস্টেম কনফিগারেশন ও রক্ষণাবেক্ষণ</p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-blue-700">{systemStats?.totalUsers || 0}</div>
              <div className="text-xs text-blue-600">মোট ব্যবহারকারী</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-green-700">{systemStats?.totalVoters || 0}</div>
              <div className="text-xs text-green-600">মোট ভোটার</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-orange-700">{systemStats?.pendingUsers || 0}</div>
              <div className="text-xs text-orange-600">অনুমোদনের অপেক্ষায়</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-purple-700">{systemStats?.systemVersion || '1.0.0'}</div>
              <div className="text-xs text-purple-600">সিস্টেম ভার্সন</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">সাধারণ</TabsTrigger>
            <TabsTrigger value="notifications">নোটিফিকেশন</TabsTrigger>
            <TabsTrigger value="security">নিরাপত্তা</TabsTrigger>
            <TabsTrigger value="backup">ব্যাকআপ</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>সাধারণ সেটিংস</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">সিস্টেমের নাম</Label>
                    <Input 
                      id="systemName"
                      value={systemConfig.systemName}
                      onChange={(e) => setSystemConfig({...systemConfig, systemName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxVoters">প্রতি ব্যবহারকারীর সর্বোচ্চ ভোটার</Label>
                    <Input 
                      id="maxVoters"
                      type="number"
                      value={systemConfig.maxVotersPerUser}
                      onChange={(e) => setSystemConfig({...systemConfig, maxVotersPerUser: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">সেশন টাইমআউট (মিনিট)</Label>
                    <Input 
                      id="sessionTimeout"
                      type="number"
                      value={systemConfig.sessionTimeout}
                      onChange={(e) => setSystemConfig({...systemConfig, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance">রক্ষণাবেক্ষণ মোড</Label>
                    <Switch 
                      id="maintenance"
                      checked={systemConfig.maintenanceMode}
                      onCheckedChange={(checked) => setSystemConfig({...systemConfig, maintenanceMode: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="registration">নতুন নিবন্ধন সক্রিয়</Label>
                    <Switch 
                      id="registration"
                      checked={systemConfig.registrationEnabled}
                      onCheckedChange={(checked) => setSystemConfig({...systemConfig, registrationEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms">SMS সেবা সক্রিয়</Label>
                    <Switch 
                      id="sms"
                      checked={systemConfig.smsEnabled}
                      onCheckedChange={(checked) => setSystemConfig({...systemConfig, smsEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">ইমেইল সেবা সক্রিয়</Label>
                    <Switch 
                      id="email"
                      checked={systemConfig.emailEnabled}
                      onCheckedChange={(checked) => setSystemConfig({...systemConfig, emailEnabled: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>নোটিফিকেশন সেটিংস</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newUser">নতুন ব্যবহারকারী নিবন্ধন</Label>
                  <Switch 
                    id="newUser"
                    checked={notifications.newUserRegistration}
                    onCheckedChange={(checked) => setNotifications({...notifications, newUserRegistration: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="voterUpdate">ভোটার ডেটা আপডেট</Label>
                  <Switch 
                    id="voterUpdate"
                    checked={notifications.voterDataUpdate}
                    onCheckedChange={(checked) => setNotifications({...notifications, voterDataUpdate: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance">সিস্টেম রক্ষণাবেক্ষণ</Label>
                  <Switch 
                    id="maintenance"
                    checked={notifications.systemMaintenance}
                    onCheckedChange={(checked) => setNotifications({...notifications, systemMaintenance: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="security">নিরাপত্তা সতর্কতা</Label>
                  <Switch 
                    id="security"
                    checked={notifications.securityAlert}
                    onCheckedChange={(checked) => setNotifications({...notifications, securityAlert: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>নিরাপত্তা সেটিংস</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="strongPassword">শক্তিশালী পাসওয়ার্ড বাধ্যতামূলক</Label>
                  <Switch 
                    id="strongPassword"
                    checked={securitySettings.enforceStrongPassword}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enforceStrongPassword: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactor">দ্বিতীয় স্তরের যাচাইকরণ</Label>
                  <Switch 
                    id="twoFactor"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sessionLog">সেশন লগিং</Label>
                  <Switch 
                    id="sessionLog"
                    checked={securitySettings.sessionLogging}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, sessionLogging: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">সর্বোচ্চ লগইন চেষ্টা</Label>
                  <Input 
                    id="maxAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP হোয়াইটলিস্ট</Label>
                  <Textarea 
                    id="ipWhitelist"
                    placeholder="আইপি ঠিকানা প্রতি লাইনে একটি"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>ব্যাকআপ ও পুনরুদ্ধার</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoBackup">স্বয়ংক্রিয় ব্যাকআপ</Label>
                  <Switch 
                    id="autoBackup"
                    checked={systemConfig.autoBackup}
                    onCheckedChange={(checked) => setSystemConfig({...systemConfig, autoBackup: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ব্যাকআপের ফ্রিকোয়েন্সি</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={systemConfig.backupFrequency === 'daily' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSystemConfig({...systemConfig, backupFrequency: 'daily'})}
                    >
                      দৈনিক
                    </Button>
                    <Button 
                      variant={systemConfig.backupFrequency === 'weekly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSystemConfig({...systemConfig, backupFrequency: 'weekly'})}
                    >
                      সাপ্তাহিক
                    </Button>
                    <Button 
                      variant={systemConfig.backupFrequency === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSystemConfig({...systemConfig, backupFrequency: 'monthly'})}
                    >
                      মাসিক
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">ব্যাকআপের তথ্য</h4>
                  <p className="text-sm text-gray-600">শেষ ব্যাকআপ: {new Date().toLocaleDateString('bn-BD')}</p>
                  <p className="text-sm text-gray-600">ডেটাবেসের আকার: {systemStats?.databaseSize || 'N/A'}</p>
                  <p className="text-sm text-gray-600">স্ট্যাটাস: <Badge variant="default">সফল</Badge></p>
                </div>

                <Button onClick={handleBackupNow} className="w-full">
                  এখনই ব্যাকআপ নিন
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveConfig} 
            disabled={saveConfigMutation.isPending}
            size="lg"
          >
            {saveConfigMutation.isPending ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
