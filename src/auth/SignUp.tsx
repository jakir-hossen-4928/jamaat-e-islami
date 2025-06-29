
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/lib/usePageTitle";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { passwordValidation } from "@/lib/security";

const SignUp = () => {
  usePageTitle('রেজিস্টার - জামায়াতে ইসলামী');
  
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const { secureRegister, loading } = useSecureAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time password validation
    if (name === 'password') {
      const validation = passwordValidation.validate(value);
      setPasswordErrors(validation.errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("সব ফিল্ড পূরণ করুন");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }

    // Validate password strength
    const validation = passwordValidation.validate(formData.password);
    if (!validation.isValid) {
      setError("পাসওয়ার্ড নীতিমালা মেনে চলুন");
      return;
    }

    try {
      setError("");
      const result = await secureRegister(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "✅ সফল",
          description: "অ্যাকাউন্ট তৈরি হয়েছে। অনুমোদনের অপেক্ষায় রয়েছে।",
        });
        navigate('/pending-verification');
      } else {
        // Error messages are already handled by useSecureAuth
        setError("রেজিস্ট্রেশন করতে সমস্যা হয়েছে");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError("রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back to Home Button */}
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
                src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
                alt="জামায়াতে ইসলামী"
                className="w-16 h-16"
              />
            </div>
            <CardTitle className="text-center text-xl text-gray-900">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              জামায়াতে ইসলামী ভোটার ব্যবস্থাপনায় যোগ দিন
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
                <Label htmlFor="displayName">পূর্ণ নাম</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="আপনার ইমেইল লিখুন"
                  disabled={loading}
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="শক্তিশালী পাসওয়ার্ড লিখুন"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password requirements */}
                {passwordErrors.length > 0 && (
                  <div className="text-xs text-red-600 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    disabled={loading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || passwordErrors.length > 0}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    রেজিস্টার হচ্ছে...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    রেজিস্টার
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-800 hover:underline font-medium"
                >
                  লগইন করুন
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
