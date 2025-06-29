
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
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";

const Login = () => {
  usePageTitle('লগইন - জামায়াতে ইসলামী');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { secureLogin, loading } = useSecureAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("সব ফিল্ড পূরণ করুন");
      return;
    }

    try {
      setError("");
      const result = await secureLogin(email, password);

      if (result.success) {
        toast({
          title: "✅ সফল",
          description: "সফলভাবে লগইন হয়েছেন",
        });
        navigate('/dashboard');
      } else {
        // Error messages are already handled by useSecureAuth
        setError("লগইন করতে সমস্যা হয়েছে");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
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
                src="/public/bangladesh-jamaat-e-islami-seeklogo.svg"
                alt="জামায়াতে ইসলামী"
                className="w-16 h-16"
              />
            </div>
            <CardTitle className="text-center text-xl text-gray-900">
              জামায়াতে ইসলামী
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              ভোটার ব্যবস্থাপনা সিস্টেম
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
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
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
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    লগইন হচ্ছে...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    লগইন
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-800 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>

              <div className="text-sm text-gray-600">
                নতুন অ্যাকাউন্ট প্রয়োজন?{' '}
                <Link
                  to="/register"
                  className="text-green-600 hover:text-green-800 hover:underline font-medium"
                >
                  রেজিস্টার করুন
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
