
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PendingVerification = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = "8801647470849";
    const message = encodeURIComponent("আসসালামু আলাইকুম। আমার ভোটার ব্যবস্থাপনা সিস্টেমের অ্যাকাউন্ট অনুমোদনের প্রয়োজন।");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800 text-xl">অনুমোদনের অপেক্ষায়</CardTitle>
            <CardDescription className="text-base">
              আপনার অ্যাকাউন্ট এডমিনের অনুমোদনের জন্য অপেক্ষমাণ
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 mb-3">
                আপনার রেজিস্ট্রেশন সফল হয়েছে। অ্যাডমিন আপনার অ্যাকাউন্ট অনুমোদন করলে আপনি সিস্টেমে প্রবেশ করতে পারবেন।
              </p>
              <p className="text-sm text-gray-600">
                দ্রুত অনুমোদনের জন্য নিচের WhatsApp নম্বরে যোগাযোগ করুন।
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">WhatsApp যোগাযোগ</span>
              </div>
              <p className="text-lg font-bold text-green-700 mb-2">০১৬৪৭৪৭০৮৪৯</p>
              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp এ যোগাযোগ করুন
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">অথবা কল করুন</span>
              </div>
              <a 
                href="tel:+8801647470849" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ০১৬৪৭৪৭০৮৪৯
              </a>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                লগআউট করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingVerification;
