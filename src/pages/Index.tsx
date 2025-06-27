import Hero from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield, Phone, Mail, MapPin, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ভোটার ব্যবস্থাপনা সিস্টেমের বৈশিষ্ট্য
            </h2>
            <p className="text-gray-600">
              আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-green-600" />,
                title: 'ভোটার ডাটা',
                desc: 'সহজে ভোটার তথ্য সংগ্রহ ও সংরক্ষণ'
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
                title: 'বিশ্লেষণ',
                desc: 'উন্নত বিশ্লেষণ ও রিপোর্ট তৈরি'
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-purple-600" />,
                title: 'SMS প্রচারণা',
                desc: 'লক্ষ্যভিত্তিক SMS প্রেরণ'
              },
              {
                icon: <Shield className="w-6 h-6 text-red-600" />,
                title: 'নিরাপত্তা',
                desc: 'উচ্চ নিরাপত্তা ও গোপনীয়তা'
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow text-center hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-opacity-10 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">
            আজই শুরু করুন
          </h2>
          <p className="text-lg mb-6">
            আমাদের ভোটার ব্যবস্থাপনা সিস্টেমে যোগ দিয়ে আপনার নির্বাচনী প্রচারণা আরও কার্যকর করুন
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!currentUser && (
              <>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/register">
                    <Users className="w-5 h-5 mr-2" /> নিবন্ধন করুন
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:text-green-600 hover:bg-white">
                  <Link to="/login">
                    <BarChart3 className="w-5 h-5 mr-2" /> লগইন করুন
                  </Link>
                </Button>
              </>
            )}
            {currentUser && (
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:text-green-600 hover:bg-white">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-5 h-5 mr-2" /> ড্যাশবোর্ডে যান
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">যোগাযোগ করুন</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 rounded-xl text-center">
              <Phone className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="font-semibold">০১৬৪৭৪৭০৮৪৯</p>
              <p className="text-sm text-gray-500">অ্যাকাউন্ট অনুমোদন</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl text-center">
              <Mail className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <p className="font-semibold">support@jamaat.org</p>
              <p className="text-sm text-gray-500">ইমেইল সাপোর্ট</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl text-center">
              <MapPin className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="font-semibold">ঢাকা, বাংলাদেশ</p>
              <p className="text-sm text-gray-500">কেন্দ্রীয় কার্যালয়</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <img
            src="/bangladesh-jamaat-e-islami-seeklogo.svg"
            alt="Jamaat Logo"
            className="w-14 h-14 mx-auto mb-2"
          />
          <h3 className="text-xl font-bold mb-1">জামায়াতে ইসলামী বাংলাদেশ</h3>
          <p className="text-gray-400 mb-6">ভোটার ব্যবস্থাপনা সিস্টেম</p>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-400 hover:text-white">লগইন</Link>
            <Link to="/register" className="text-gray-400 hover:text-white">নিবন্ধন</Link>
            <Link to="/forgot-password" className="text-gray-400 hover:text-white">পাসওয়ার্ড ভুলে গেছেন?</Link>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            © ২০২৫ জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।
            <br />
            Developed by <a href="https://www.facebook.com/jakir.hossen.4928" target="_blank" className="text-green-400 hover:underline">Jakir Hossen</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
