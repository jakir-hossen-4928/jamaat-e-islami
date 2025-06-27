
import Hero from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield, Phone, Mail, MapPin, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { lazy, Suspense } from 'react';

// Lazy load non-critical components
const LazyHero = lazy(() => import('@/components/Hero'));

const Index = () => {
  const { currentUser } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const features = [
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />,
      title: 'ভোটার ডাটা',
      desc: 'সহজে ভোটার তথ্য সংগ্রহ ও সংরক্ষণ',
      color: 'green'
    },
    {
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
      title: 'বিশ্লেষণ',
      desc: 'উন্নত বিশ্লেষণ ও রিপোর্ট তৈরি',
      color: 'blue'
    },
    {
      icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />,
      title: 'SMS প্রচারণা',
      desc: 'লক্ষ্যভিত্তিক SMS প্রেরণ',
      color: 'purple'
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />,
      title: 'নিরাপত্তা',
      desc: 'উচ্চ নিরাপত্তা ও গোপনীয়তা',
      color: 'red'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Suspense */}
      <Suspense fallback={
        <div className="h-[400px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }>
        <Hero />
      </Suspense>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              ভোটার ব্যবস্থাপনা সিস্টেমের বৈশিষ্ট্য
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন দক্ষতার সাথে
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-${item.color}-50 mx-auto mb-3 sm:mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-12 sm:py-16 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            আজই শুরু করুন
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            আমাদের ভোটার ব্যবস্থাপনা সিস্টেমে যোগ দিয়ে আপনার নির্বাচনী প্রচারণা আরও কার্যকর করুন
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {!currentUser ? (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-green-700 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
                >
                  <Link to="/register">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                    Request Access
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:text-green-600 hover:bg-white shadow-lg transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
                >
                  <Link to="/login">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                    Login
                  </Link>
                </Button>
              </>
            ) : (
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:text-green-600 hover:bg-white shadow-lg transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> 
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        className="py-12 sm:py-16 px-4 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            যোগাযোগ করুন
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Phone className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-green-600 mb-2 sm:mb-3" />,
                title: "০১৬৪৭৪৭০৮৪৯",
                subtitle: "অ্যাকাউন্ট অনুমোদন",
                bg: "bg-green-50"
              },
              {
                icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-blue-600 mb-2 sm:mb-3" />,
                title: "support@jamaat.org",
                subtitle: "ইমেইল সাপোর্ট",
                bg: "bg-blue-50"
              },
              {
                icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-purple-600 mb-2 sm:mb-3" />,
                title: "ঢাকা, বাংলাদেশ",
                subtitle: "কেন্দ্রীয় কার্যালয়",
                bg: "bg-purple-50"
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`p-4 sm:p-6 ${item.bg} rounded-xl text-center hover:shadow-lg transition-all duration-300 cursor-pointer`}
              >
                {item.icon}
                <p className="font-semibold text-sm sm:text-base">{item.title}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10 px-4">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/bangladesh-jamaat-e-islami-seeklogo.svg"
            alt="Jamaat Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4"
            loading="lazy"
          />
          <h3 className="text-lg sm:text-xl font-bold mb-2">জামায়াতে ইসলামী বাংলাদেশ</h3>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">ভোটার ব্যবস্থাপনা সিস্টেম</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">লগইন</Link>
            <Link to="/register" className="text-gray-400 hover:text-white transition-colors">নিবন্ধন</Link>
            <Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors">পাসওয়ার্ড ভুলে গেছেন?</Link>
          </div>
          <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
            <p>© ২০২৫ জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।</p>
            <p className="mt-2">
              Developed by <a href="https://www.facebook.com/jakir.hossen.4928" target="_blank" className="text-green-400 hover:underline transition-colors">Jakir Hossen</a>
            </p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};

export default Index;
