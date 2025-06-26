
import Hero from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield } from 'lucide-react';

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
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">ভোটার ডাটা</h3>
              <p className="text-gray-600">সহজে ভোটার তথ্য সংগ্রহ ও সংরক্ষণ</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">বিশ্লেষণ</h3>
              <p className="text-gray-600">উন্নত বিশ্লেষণ ও রিপোর্ট তৈরি</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">SMS প্রচারণা</h3>
              <p className="text-gray-600">লক্ষ্যভিত্তিক SMS প্রেরণ</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">নিরাপত্তা</h3>
              <p className="text-gray-600">উচ্চ নিরাপত্তা ও গোপনীয়তা</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            আজই শুরু করুন
          </h2>
          <p className="text-xl mb-8">
            আমাদের ভোটার ব্যবস্থাপনা সিস্টেমে যোগ দিয়ে আপনার নির্বাচনী প্রচারণা আরও কার্যকর করুন
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">নিবন্ধন করুন</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600">
              <Link to="/login">লগইন করুন</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <img 
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" 
            alt="Jamaat-e-Islami Logo" 
            className="w-12 h-12 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">জামায়াতে ইসলামী বাংলাদেশ</h3>
          <p className="text-gray-400 mb-4">ভোটার ব্যবস্থাপনা সিস্টেম</p>
          <p className="text-sm text-gray-500">
            © ২০২৪ জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
