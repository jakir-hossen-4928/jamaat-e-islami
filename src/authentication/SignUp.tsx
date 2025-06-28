import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, getUnionsByUpazila } from '@/lib/locationUtils';
import { useQuery } from '@tanstack/react-query';

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    village_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions
  });

  // Load districts based on selected division
  const { data: districts = [] } = useQuery({
    queryKey: ['districts', formData.division_id],
    queryFn: () => getDistrictsByDivision(formData.division_id),
    enabled: !!formData.division_id
  });

  // Load upazilas based on selected district
  const { data: upazilas = [] } = useQuery({
    queryKey: ['upazilas', formData.district_id],
    queryFn: () => getUpazilasByDistrict(formData.district_id),
    enabled: !!formData.district_id
  });

  // Load unions based on selected upazila
  const { data: unions = [] } = useQuery({
    queryKey: ['unions', formData.upazila_id],
    queryFn: () => getUnionsByUpazila(formData.upazila_id),
    enabled: !!formData.upazila_id
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset dependent fields when parent changes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName || !formData.email || !formData.password) {
      toast({
        title: "ত্রুটি",
        description: "সব ক্ষেত্র পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    if (!formData.division_id || !formData.district_id || !formData.upazila_id) {
      toast({
        title: "ত্রুটি",
        description: "অন্তত বিভাগ, জেলা ও উপজেলা নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড মিল নেই",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "ত্রুটি",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.email, 
        formData.password, 
        formData.displayName
      );
      toast({
        title: "সফল",
        description: "রেজিস্ট্রেশন সফল! অ্যাডমিনের অনুমোদনের অপেক্ষা করুন।",
      });
      navigate('/pending-verification');
    } catch (error: any) {
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error.message || "রেজিস্ট্রেশনে ত্রুটি হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" 
            alt="Jamaat-e-Islami Logo" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-green-800">জামায়াতে ইসলামী</h1>
          <p className="text-green-600">ভোটার ব্যবস্থাপনা সিস্টেম</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>রেজিস্ট্রেশন করুন</CardTitle>
            <CardDescription>
              নতুন অ্যাকাউন্ট তৈরি করুন
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">পূর্ণ নাম</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Location Selection */}
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium text-gray-700">এলাকা নির্বাচন করুন</Label>
                
                <div className="space-y-2">
                  <Label htmlFor="division">বিভাগ *</Label>
                  <Select value={formData.division_id} onValueChange={(value) => handleLocationChange('division_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.bn_name} ({division.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">জেলা *</Label>
                  <Select 
                    value={formData.district_id} 
                    onValueChange={(value) => handleLocationChange('district_id', value)}
                    disabled={!formData.division_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.bn_name} ({district.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upazila">উপজেলা *</Label>
                  <Select 
                    value={formData.upazila_id} 
                    onValueChange={(value) => handleLocationChange('upazila_id', value)}
                    disabled={!formData.district_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {upazilas.map((upazila) => (
                        <SelectItem key={upazila.id} value={upazila.id}>
                          {upazila.bn_name} ({upazila.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="union">ইউনিয়ন (ঐচ্ছিক)</Label>
                  <Select 
                    value={formData.union_id} 
                    onValueChange={(value) => handleLocationChange('union_id', value)}
                    disabled={!formData.upazila_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ইউনিয়ন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {unions.map((union) => (
                        <SelectItem key={union.id} value={union.id}>
                          {union.bn_name} ({union.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
              </Button>
              <div className="text-center text-sm">
                <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
                <Link to="/login" className="text-green-600 hover:underline">
                  লগইন করুন
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
