
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { usePageTitle } from '@/lib/usePageTitle';
import { Loader2 } from 'lucide-react';

const VerificationLoading = () => {
  usePageTitle('যাচাই করা হচ্ছে - জামায়াতে ইসলামী');

  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/login');
      } else if (userProfile?.approved) {
        navigate('/dashboard');
      } else {
        navigate('/pending-verification');
      }
    }
  }, [currentUser, userProfile, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="text-center py-12 space-y-6">
          <div className="flex justify-center">
            <img
              src="/public/bangladesh-jamaat-e-islami-seeklogo.svg"
              alt="জামায়াতে ইসলামী"
              className="w-16 h-16"
            />
          </div>

          <div className="space-y-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">
              যাচাই করা হচ্ছে...
            </h2>
            <p className="text-gray-600">
              আপনার অ্যাকাউন্টের অবস্থা পরীক্ষা করা হচ্ছে
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationLoading;
