
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MessageCircle, Phone, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/lib/usePageTitle';
import { motion } from 'framer-motion';

const PendingVerification = () => {
  usePageTitle('অনুমোদনের অপেক্ষায়');
  
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = "8801647470849";
    const message = encodeURIComponent("আসসালামু আলাইকুম। আমার ভোটার ব্যবস্থাপনা সিস্টেমের অ্যাকাউন্ট অনুমোদনের প্রয়োজন।");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent("অ্যাকাউন্ট অনুমোদনের জন্য আবেদন");
    const body = encodeURIComponent("আসসালামু আলাইকুম,\n\nআমার ভোটার ব্যবস্থাপনা সিস্টেমের অ্যাকাউন্ট অনুমোদনের প্রয়োজন।\n\nধন্যবাদ");
    window.open(`mailto:mdjakirkhan4928@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 p-4">
      <motion.div
        className="w-full max-w-md sm:max-w-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 sm:p-8">
            <motion.div variants={itemVariants}>
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <CardTitle className="text-white text-xl sm:text-2xl font-bold">
                অনুমোদনের অপেক্ষায়
              </CardTitle>
              <CardDescription className="text-orange-100 text-base sm:text-lg mt-2">
                আপনার অ্যাকাউন্ট এডমিনের অনুমোদনের জন্য অপেক্ষমাণ
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">রেজিস্ট্রেশন সফল!</h3>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      আপনার রেজিস্ট্রেশন সফল হয়েছে। অ্যাডমিন আপনার অ্যাকাউন্ট অনুমোদন করলে আপনি সিস্টেমে প্রবেশ করতে পারবেন।
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-lg">
                  💡 দ্রুত অনুমোদনের জন্য নিচের যোগাযোগ মাধ্যমগুলি ব্যবহার করুন।
                </p>
              </div>
            </motion.div>

            {/* Contact Options */}
            <div className="space-y-4">
              {/* WhatsApp Contact */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-green-800 text-base sm:text-lg">WhatsApp যোগাযোগ</span>
                        <p className="text-sm text-green-600">তাৎক্ষণিক সাপোর্ট</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-700 mb-3 text-center">০১৬৪৭৪৭০৮৪৯</p>
                  <Button 
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-3"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp এ যোগাযোগ করুন
                  </Button>
                </div>
              </motion.div>

              {/* Email Contact */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-blue-800 text-base sm:text-lg">ইমেইল সাপোর্ট</span>
                        <p className="text-sm text-blue-600">বিস্তারিত বার্তার জন্য</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-blue-700 mb-3 text-center break-all">
                    mdjakirkhan4928@gmail.com
                  </p>
                  <Button 
                    onClick={handleEmailContact}
                    variant="outline"
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-3"
                    size="lg"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    ইমেইল পাঠান
                  </Button>
                </div>
              </motion.div>

              {/* Phone Contact */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="font-bold text-purple-800 text-base sm:text-lg block">সরাসরি কল করুন</span>
                      <p className="text-sm text-purple-600">জরুরি প্রয়োজনে</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <a 
                      href="tel:+8801647470849" 
                      className="text-lg sm:text-xl font-bold text-purple-700 hover:text-purple-900 transition-colors duration-200 underline decoration-2 underline-offset-4"
                    >
                      ০১৬৪৭৪৭০৮৪৯
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Logout Button */}
            <motion.div variants={itemVariants} className="pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 py-3"
                size="lg"
              >
                লগআউট করুন
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">সাহায্য প্রয়োজন?</span>
            </p>
            <p className="text-xs text-gray-500">
              অনুমোদন প্রক্রিয়া সাধারণত ২৪ ঘন্টার মধ্যে সম্পন্ন হয়। দ্রুত সাহায্যের জন্য WhatsApp ব্যবহার করুন।
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PendingVerification;
