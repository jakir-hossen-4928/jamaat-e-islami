
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useLocationData } from '@/hooks/useLocationData';
import { UserRole } from '@/lib/types';

const Register = () => {
  const navigate = useNavigate();
  const { secureRegister, loading } = useSecureAuth();
  const {
    locationData,
    loading: locationLoading,
    getFilteredDistricts,
    getFilteredUpazilas,
    getFilteredUnions,
    getFilteredVillages,
    getLocationNames,
  } = useLocationData();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    location: {
      division_id: '',
      district_id: '',
      upazila_id: '',
      union_id: '',
      village_id: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev };
      updated.location[field] = value;

      // Reset dependent fields for cascading selects
      if (field === 'division_id') {
        updated.location.district_id = '';
        updated.location.upazila_id = '';
        updated.location.union_id = '';
        updated.location.village_id = '';
      } else if (field === 'district_id') {
        updated.location.upazila_id = '';
        updated.location.union_id = '';
        updated.location.village_id = '';
      } else if (field === 'upazila_id') {
        updated.location.union_id = '';
        updated.location.village_id = '';
      } else if (field === 'union_id') {
        updated.location.village_id = '';
      }

      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError('নাম প্রয়োজন');
      return false;
    }
    if (!formData.email.trim()) {
      setError('ইমেইল প্রয়োজন');
      return false;
    }
    if (!formData.password) {
      setError('পাসওয়ার্ড প্রয়োজন');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      return false;
    }
    if (!formData.role) {
      setError('ভূমিকা নির্বাচন করুন');
      return false;
    }

    // Location validation - village admin needs complete location data
    if (formData.role === 'village_admin') {
      if (!formData.location.division_id || !formData.location.district_id ||
        !formData.location.upazila_id || !formData.location.union_id || !formData.location.village_id) {
        setError('গ্রাম অ্যাডমিনের জন্য সম্পূর্ণ লোকেশন তথ্য (বিভাগ, জেলা, উপজেলা, ইউনিয়ন, গ্রাম) প্রয়োজন');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    const locationNames = getLocationNames(formData.location);
    const accessScope = {
      ...formData.location,
      ...locationNames
    };

    const result = await secureRegister(
      formData.email,
      formData.password,
      formData.displayName,
      formData.role as 'super_admin' | 'village_admin',
      accessScope
    );

    if (result.success) {
      navigate('/auth/pending-verification');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            নিবন্ধন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="displayName">পূর্ণ নাম *</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="আপনার নাম লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">ইমেইল *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">ভূমিকা *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}>
                <SelectTrigger>
                  <SelectValue placeholder="ভূমিকা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="super_admin">সুপার অ্যাডমিন</SelectItem> */}
                  <SelectItem value="village_admin">গ্রাম অ্যাডমিন</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Selection - Show only for village_admin */}
            {formData.role === 'village_admin' && (
              <div className="space-y-3">
                <div>
                  <Label>বিভাগ *</Label>
                  <Select
                    value={formData.location.division_id}
                    onValueChange={(value) => handleLocationChange('division_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationData.divisions.map(division => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>জেলা *</Label>
                  <Select
                    value={formData.location.district_id}
                    onValueChange={(value) => handleLocationChange('district_id', value)}
                    disabled={!formData.location.division_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.location.division_id ? "প্রথমে বিভাগ নির্বাচন করুন" : "জেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredDistricts(formData.location.division_id).map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>উপজেলা *</Label>
                  <Select
                    value={formData.location.upazila_id}
                    onValueChange={(value) => handleLocationChange('upazila_id', value)}
                    disabled={!formData.location.district_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.location.district_id ? "প্রথমে জেলা নির্বাচন করুন" : "উপজেলা নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredUpazilas(formData.location.district_id).map(upazila => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>ইউনিয়ন *</Label>
                  <Select
                    value={formData.location.union_id}
                    onValueChange={(value) => handleLocationChange('union_id', value)}
                    disabled={!formData.location.upazila_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.location.upazila_id ? "প্রথমে উপজেলা নির্বাচন করুন" : "ইউনিয়ন নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredUnions(formData.location.upazila_id).map(union => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>গ্রাম *</Label>
                  <Select
                    value={formData.location.village_id}
                    onValueChange={(value) => handleLocationChange('village_id', value)}
                    disabled={!formData.location.union_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.location.union_id ? "প্রথমে ইউনিয়ন নির্বাচন করুন" : "গ্রাম নির্বাচন করুন"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredVillages(formData.location.union_id).map(village => (
                        <SelectItem key={village.id} value={village.id}>
                          {village.bn_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="password">পাসওয়ার্ড *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="পাসওয়ার্ড লিখুন"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="পাসওয়ার্ড আবার লিখুন"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || locationLoading}
            >
              {loading ? 'নিবন্ধন হচ্ছে...' : 'নিবন্ধন করুন'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link to="/auth/login" className="text-blue-600 hover:underline">
                  লগইন করুন
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
