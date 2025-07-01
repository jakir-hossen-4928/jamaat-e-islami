import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocationData } from '@/hooks/useLocationData';
import { ArrowLeft } from 'lucide-react';

const roles: UserRole[] = [
  'super_admin',
  'division_admin',
  'district_admin',
  'upazila_admin',
  'union_admin',
  'village_admin',
];

const Register: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' as UserRole });
  const [location, setLocation] = useState({
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    village_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const {
    locationData,
    loading: locationLoading,
    getFilteredDistricts,
    getFilteredUpazilas,
    getFilteredUnions,
    getFilteredVillages,
  } = useLocationData();

  useEffect(() => {
    // Reset location when role changes
    setLocation({
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: '',
    });
  }, [form.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: UserRole) => {
    setForm({ ...form, role: value });
  };

  const handleLocationChange = (field: keyof typeof location, value: string) => {
    setLocation(prev => {
      const updated = { ...prev, [field]: value };
      // Reset dependent fields
      if (field === 'division_id') {
        updated.district_id = '';
        updated.upazila_id = '';
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'district_id') {
        updated.upazila_id = '';
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'upazila_id') {
        updated.union_id = '';
        updated.village_id = '';
      } else if (field === 'union_id') {
        updated.village_id = '';
      }
      return updated;
    });
  };

  const isLocationRequired = form.role && form.role !== 'super_admin';
  const isLocationValid = () => {
    if (!isLocationRequired) return true;
    if (form.role === 'division_admin') return !!location.division_id;
    if (form.role === 'district_admin') return !!location.division_id && !!location.district_id;
    if (form.role === 'upazila_admin') return !!location.division_id && !!location.district_id && !!location.upazila_id;
    if (form.role === 'union_admin') return !!location.division_id && !!location.district_id && !!location.upazila_id && !!location.union_id;
    if (form.role === 'village_admin') return !!location.division_id && !!location.district_id && !!location.upazila_id && !!location.union_id && !!location.village_id;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!form.name || !form.email || !form.password || !form.role) {
        setError('সব ফিল্ড পূরণ করুন');
        setLoading(false);
        return;
      }
      if (!isLocationValid()) {
        setError('অবস্থান নির্বাচন করুন');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: form.name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: form.name,
        email: form.email,
        role: form.role,
        approved: false,
        createdAt: new Date(),
        accessScope: isLocationRequired ? { ...location } : {},
      });
      await signOut(auth);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              লগইন পেজে যান
            </Button>
          </div>
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex justify-center">
                <img
                  src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                  alt="জামায়াতে ইসলামী"
                  className="w-16 h-16"
                />
              </div>
              <CardTitle className="text-center text-xl text-gray-900">
                রেজিস্ট্রেশন সম্পন্ন হয়েছে
              </CardTitle>
              <p className="text-center text-sm text-gray-600">
                আপনার রেজিস্ট্রেশন সুপার অ্যাডমিন অনুমোদনের অপেক্ষায় আছে। অনুমোদনের পর লগইন করতে পারবেন।
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            হোমে ফিরুন
          </Button>
        </div>
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <img
                src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                alt="জামায়াতে ইসলামী"
                className="w-16 h-16"
              />
            </div>
            <CardTitle className="text-center text-xl text-gray-900">
              নতুন অ্যাকাউন্ট রেজিস্ট্রেশন
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              ভোটার ব্যবস্থাপনা সিস্টেমে অ্যাকাউন্ট তৈরি করুন
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">নাম</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="আপনার নাম লিখুন"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="আপনার ইমেইল লিখুন"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="পাসওয়ার্ড দিন"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">ভূমিকা নির্বাচন করুন</Label>
                <Select value={form.role} onValueChange={handleRoleChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Location dropdowns, shown if role is selected and not super_admin */}
              {isLocationRequired && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="division_id">বিভাগ</Label>
                    <Select
                      value={location.division_id}
                      onValueChange={(value) => handleLocationChange('division_id', value)}
                      disabled={loading || locationLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationData.divisions.map((division: any) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.bn_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(form.role === 'district_admin' || form.role === 'upazila_admin' || form.role === 'union_admin' || form.role === 'village_admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="district_id">জেলা</Label>
                      <Select
                        value={location.district_id}
                        onValueChange={(value) => handleLocationChange('district_id', value)}
                        disabled={loading || locationLoading || !location.division_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="জেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredDistricts(location.division_id).map((district: any) => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.bn_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {(form.role === 'upazila_admin' || form.role === 'union_admin' || form.role === 'village_admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="upazila_id">উপজেলা</Label>
                      <Select
                        value={location.upazila_id}
                        onValueChange={(value) => handleLocationChange('upazila_id', value)}
                        disabled={loading || locationLoading || !location.district_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredUpazilas(location.district_id).map((upazila: any) => (
                            <SelectItem key={upazila.id} value={upazila.id}>
                              {upazila.bn_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {(form.role === 'union_admin' || form.role === 'village_admin') && (
                    <div className="space-y-2">
                      <Label htmlFor="union_id">ইউনিয়ন</Label>
                      <Select
                        value={location.union_id}
                        onValueChange={(value) => handleLocationChange('union_id', value)}
                        disabled={loading || locationLoading || !location.upazila_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredUnions(location.upazila_id).map((union: any) => (
                            <SelectItem key={union.id} value={union.id}>
                              {union.bn_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.role === 'village_admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="village_id">গ্রাম</Label>
                      <Select
                        value={location.village_id}
                        onValueChange={(value) => handleLocationChange('village_id', value)}
                        disabled={loading || locationLoading || !location.union_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="গ্রাম নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredVillages(location.union_id).map((village: any) => (
                            <SelectItem key={village.id} value={village.id}>
                              {village.bn_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    রেজিস্ট্রেশন হচ্ছে...
                  </div>
                ) : (
                  <>রেজিস্টার</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 