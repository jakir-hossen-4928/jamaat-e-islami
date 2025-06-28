
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const VerificationLoading = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const steps = [
    { icon: User, text: 'ব্যবহারকারীর তথ্য যাচাই করা হচ্ছে...', duration: 1500 },
    { icon: Shield, text: 'নিরাপত্তা পরীক্ষা চলছে...', duration: 1000 },
    { icon: CheckCircle, text: 'সফলভাবে যাচাই সম্পন্ন!', duration: 800 }
  ];

  useEffect(() => {
    if (!userProfile || !userProfile.approved) {
      navigate('/pending-verification');
      return;
    }
  }, [navigate, userProfile]);

  useEffect(() => {
    if (!userProfile || !userProfile.approved) {
      navigate('/pending-verification');
      return;
    }

    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        // Navigate to dashboard after verification complete
        navigate('/admin/dashboard');
      }
    }, steps[step].duration);
    // Cleanup timer on component unmount or step change
    return () => clearTimeout(timer);
  }, [step, navigate, userProfile]);

  const CurrentIcon = steps[step].icon;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'সুপার অ্যাডমিন';
      case 'division_admin': return 'বিভাগীয় অ্যাডমিন';
      case 'district_admin': return 'জেলা অ্যাডমিন';
      case 'upazila_admin': return 'উপজেলা অ্যাডমিন';
      case 'union_admin': return 'ইউনিয়ন অ্যাডমিন';
      case 'village_admin': return 'গ্রাম অ্যাডমিন';
      default: return 'অজানা';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <img
              src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png"
              alt="Logo"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">স্বাগতম</h1>
            <p className="text-gray-600">জামায়াত-ই-ইসলামী বাংলাদেশ</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CurrentIcon className={`w-12 h-12 ${step === steps.length - 1 ? 'text-green-600' : 'text-blue-600'
                  } animate-pulse`} />
                {step === steps.length - 1 && (
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ping"></div>
                )}
              </div>
            </div>
            <p className="text-gray-700 font-medium">{steps[step].text}</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {step + 1} / {steps.length} সম্পন্ন
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>ব্যবহারকারী:</strong> {userProfile?.displayName}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>ভূমিকা:</strong> {userProfile?.role ? getRoleDisplayName(userProfile.role) : 'অজানা'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>স্ট্যাটাস:</strong> <span className="text-green-600">যাচাইকৃত</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationLoading;
