
import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/lib/usePageTitle";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  usePageTitle('পাসওয়ার্ড রিসেট - জামায়াতে ইসলামী');
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("ইমেইল ঠিকানা লিখুন");
      return;
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে");
      
      toast({
        title: "✅ সফল",
        description: "পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.code === 'auth/user-not-found') {
        setError("এই ইমেইল দিয়ে কোন অ্যাকাউন্ট পাওয়া যায়নি");
      } else if (error.code === 'auth/invalid-email') {
        setError("অবৈধ ইমেইল ঠিকানা");
      } else {
        setError("পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
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
              পাসওয়ার্ড রিসেট
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              আপনার ইমেইল ঠিকানা লিখুন
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
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
              
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    পাঠানো হচ্ছে...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    রিসেট লিংক পাঠান
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-800 hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                লগইনে ফিরুন
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
