
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PendingVerification = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">অনুমোদনের অপেক্ষায়</CardTitle>
            <CardDescription>
              আপনার অ্যাকাউন্ট এডমিনের অনুমোদনের জন্য অপেক্ষমাণ
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              আপনার রেজিস্ট্রেশন সফল হয়েছে। অ্যাডমিন আপনার অ্যাকাউন্ট অনুমোদন করলে আপনি সিস্টেমে প্রবেশ করতে পারবেন।
            </p>
            <p className="text-sm text-gray-500">
              অনুমোদনের জন্য অনুগ্রহ করে অপেক্ষা করুন।
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              লগআউট করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingVerification;
