
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: "সফলভাবে পাঠানো হয়েছে",
        description: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে",
      });
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message || "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে",
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
            <CardTitle className="flex items-center gap-2">
              <Link to="/login" className="text-green-600 hover:text-green-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              পাসওয়ার্ড রিসেট
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? "আপনার ইমেইল চেক করুন এবং রিসেট লিংকে ক্লিক করুন"
                : "পাসওয়ার্ড রিসেট করতে আপনার ইমেইল ঠিকানা লিখুন"
              }
            </CardDescription>
          </CardHeader>
          
          {!emailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="আপনার ইমেইল ঠিকানা লিখুন"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                রিসেট লিংক পাঠানো হয়েছে! আপনার ইমেইল চেক করুন এবং নির্দেশাবলী অনুসরণ করুন।
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link to="/login">লগইন পেজে ফিরে যান</Link>
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>অ্যাকাউন্ট অনুমোদনের জন্য যোগাযোগ করুন:</p>
          <p className="font-semibold text-green-700">০১৬৪৭৪৭০৮৪৯</p>
        </div>

        {/* Developer Watermark */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>ডেভেলপার: <a href="https://www.facebook.com/jakir.hossen.4928" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">জাকির হোসেন</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
