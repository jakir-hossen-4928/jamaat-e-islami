
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
              নতুন অ্যাকাউন্ট তৈরি করুন। অনুমোদনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
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

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>নোট:</strong> রেজিস্ট্রেশনের পর অ্যাডমিনের কাছ থেকে অনুমোদন ও এলাকা নির্ধারণের জন্য অপেক্ষা করুন।
                </p>
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
