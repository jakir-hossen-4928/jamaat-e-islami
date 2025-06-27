
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield, Phone, Mail, MapPin, Menu, X, ExternalLink, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Hero from '@/components/Hero';

const Index = () => {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: 'ভোটার ডাটা ব্যবস্থাপনা',
      desc: 'সহজে ভোটার তথ্য সংগ্রহ, সংরক্ষণ ও পরিচালনা করুন'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
      title: 'উন্নত বিশ্লেষণ',
      desc: 'ডেটা বিশ্লেষণ ও রিপোর্ট তৈরি করে কার্যকর সিদ্ধান্ত নিন'
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: 'SMS প্রচারণা',
      desc: 'লক্ষ্যভিত্তিক SMS পাঠিয়ে ভোটারদের সাথে যোগাযোগ রাখুন'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'নিরাপত্তা ও গোপনীয়তা',
      desc: 'উচ্চ নিরাপত্তা ব্যবস্থায় সকল তথ্য সুরক্ষিত রাখুন'
    }
  ];

  const navItems = [
    { name: 'হোম', href: '/' },
    { name: 'বৈশিষ্ট্য', href: '#features' },
    { name: 'যোগাযোগ', href: '#contact' },
    ...(currentUser ? [{ name: 'ড্যাশবোর্ড', href: '/dashboard' }] : [])
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                alt="Jamaat Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-green-800">ভোটার ব্যবস্থাপনা</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {!currentUser ? (
                <div className="flex items-center space-x-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">লগইন</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link to="/register">নিবন্ধন</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    ড্যাশবোর্ড
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!currentUser ? (
                <div className="flex flex-col space-y-2 mt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">লগইন</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link to="/register">নিবন্ধন</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 mt-4">
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    ড্যাশবোর্ড
                  </Link>
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16">
        <Hero />
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ভোটার ব্যবস্থাপনা সিস্টেমের বৈশিষ্ট্য
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন দক্ষতা ও কার্যকারিতার সাথে
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              যোগাযোগ করুন
            </h2>
            <p className="text-lg text-gray-600">
              আমাদের সাথে যোগাযোগ করুন যেকোনো সাহায্যের জন্য
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Phone className="w-8 h-8 text-green-600" />,
                title: "ফোন নম্বর",
                info: "০১৬৪৭৪৭০৮৪৯",
                subtitle: "অ্যাকাউন্ট অনুমোদনের জন্য",
                bg: "bg-green-50",
                href: "tel:+8801647470849"
              },
              {
                icon: <Mail className="w-8 h-8 text-blue-600" />,
                title: "ইমেইল",
                info: "support@jamaat.org",
                subtitle: "সাধারণ সাপোর্টের জন্য",
                bg: "bg-blue-50",
                href: "mailto:support@jamaat.org"
              },
              {
                icon: <MapPin className="w-8 h-8 text-purple-600" />,
                title: "ঠিকানা",
                info: "ঢাকা, বাংলাদেশ",
                subtitle: "কেন্দ্রীয় কার্যালয়",
                bg: "bg-purple-50"
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`${contact.bg} p-8 rounded-xl text-center hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex justify-center mb-4">
                  {contact.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{contact.title}</h3>
                {contact.href ? (
                  <a 
                    href={contact.href}
                    className="text-lg font-medium text-gray-800 hover:text-green-600 transition-colors block mb-2"
                  >
                    {contact.info}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-gray-800 mb-2">{contact.info}</p>
                )}
                <p className="text-sm text-gray-600">{contact.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                  alt="Jamaat Logo"
                  className="w-12 h-12 filter brightness-0 invert"
                />
                <div>
                  <h3 className="text-xl font-bold">জামায়াতে ইসলামী বাংলাদেশ</h3>
                  <p className="text-gray-400">ভোটার ব্যবস্থাপনা সিস্টেম</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনার জন্য একটি সম্পূর্ণ সমাধান।
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">লগইন</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">নিবন্ধন</Link></li>
                <li><Link to="/forgot-password" className="text-gray-400 hover:text-white transition-colors">পাসওয়ার্ড ভুলে গেছেন?</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">যোগাযোগ</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>০১৬৪৭৪৭০৮৪৯</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@jamaat.org</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>ঢাকা, বাংলাদেশ</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 mb-2">© ২০২৫ জামায়াতে ইসলামী বাংলাদেশ। সকল অধিকার সংরক্ষিত।</p>
            <p className="text-sm text-gray-500">
              Developed by{' '}
              <a 
                href="https://www.facebook.com/jakir.hossen.4928" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                Jakir Hossen
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
