
import Hero from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ভোটার ব্যবস্থাপনা সিস্টেমের বৈশিষ্ট্য
            </h2>
            <p className="text-lg text-gray-600">
              আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ভোটার ডাটা</h3>
              <p className="text-gray-600">সহজে ভোটার তথ্য সংগ্রহ ও সংরক্ষণ</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">বিশ্লেষণ</h3>
              <p className="text-gray-600">উন্নত বিশ্লেষণ ও রিপোর্ট তৈরি</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">SMS প্রচারণা</h3>
              <p className="text-gray-600">লক্ষ্যভিত্তিক SMS প্রেরণ</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">নিরাপত্তা</h3>
              <p className="text-gray-600">উচ্চ নিরাপত্তা ও গোপনীয়তা</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            যোগাযোগ করুন
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">অ্যাকাউন্ট অনুমোদন</h3>
              <p className="text-green-700 font-semibold">০১৬৪৭৪৭০৮৪৯</p>
              <p className="text-sm text-gray-600 mt-1">সকাল ৯টা - রাত ৯টা</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">ইমেইল সাপোর্ট</h3>
              <p className="text-blue-700">support@jamaat.org</p>
              <p className="text-sm text-gray-600 mt-1">২ৄ ঘন্টার মধ্যে উত্তর</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">কেন্দ্রীয় কার্যালয়</h3>
              <p className="text-purple-700">ঢাকা, বাংলাদেশ</p>
              <p className="text-sm text-gray-600 mt-1">সরাসরি যোগাযোগ</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            আজই শুরু করুন
          </h2>
          <p className="text-xl mb-8 opacity-90">
            আমাদের ভোটার ব্যবস্থাপনা সিস্টেমে যোগ দিয়ে আপনার নির্বাচনী প্রচারণা আরও কার্যকর করুন
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="transform hover:scale-105 transition-transform duration-200">
              <Link to="/register">
                <Users className="w-5 h-5 mr-2" />
                নিবন্ধন করুন
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600 transform hover:scale-105 transition-all duration-200">
              <Link to="/login">
                <BarChart3 className="w-5 h-5 mr-2" />
                লগইন করুন
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" 
              alt="Jamaat-e-Islami Logo" 
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-2xl font-semibold mb-2">জামায়াতে ইসলামী বাংলাদেশ</h3>
            <p className="text-gray-400 mb-6">ভোটার ব্যবস্থাপনা সিস্টেম</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-3">যোগাযোগ</h4>
              <p className="text-gray-400 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                ০১৬৪৭৪৭০৮৪৯
              </p>
              <p className="text-gray-400">
                <Mail className="w-4 h-4 inline mr-2" />
                support@jamaat.org
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold mb-3">গুরুত্বপূর্ণ লিংক</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-gray-400 hover:text-white transition-colors">লগইন</Link>
                <Link to="/register" className="block text-gray-400 hover:text-white transition-colors">নিবন্ধন</Link>
                <Link to="/forgot-password" className="block text-gray-400 hover:text-white transition-colors">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-3">ডেভেলপার</h4>
              <p className="text-gray-400 mb-2">জাকির হোসেন</p>
              <a 
                href="https://www.facebook.com/jakir.hossen.4928" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Facebook
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-gray-500">
              © ২০২৫ জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Developed by <a href="https://www.facebook.com/jakir.hossen.4928" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Jakir Hossen</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
