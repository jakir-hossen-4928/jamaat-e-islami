
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/usePageTitle';
import { Clock, Home } from 'lucide-react';

const PendingVerification = () => {
  usePageTitle('অনুমোদনের অপেক্ষায় - জামায়াতে ইসলামী');

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile?.approved) {
      navigate('/dashboard');
    }
  }, [currentUser, userProfile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/public/bangladesh-jamaat-e-islami-seeklogo.svg"
              alt="জামায়াতে ইসলামী"
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-xl text-gray-900">
            অনুমোদনের অপেক্ষায়
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!
            </p>
            <p className="text-gray-600">
              অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।
            </p>
            <p className="text-sm text-gray-500">
              অনুমোদন পেলে আপনি ইমেইল নোটিফিকেশন পাবেন।
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">পরবর্তী পদক্ষেপ:</h4>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• অ্যাডমিনের অনুমোদনের অপেক্ষা করুন</li>
              <li>• আপনার ইমেইল চেক করুন</li>
              <li>• অনুমোদন পেলে লগইন করুন</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Home className="w-4 h-4 mr-2" />
              হোমে ফিরুন
            </Button>

            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              লগইন পেজে যান
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingVerification;
