import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BarChart3, MessageSquare, Shield, Phone, Mail, MapPin, Menu, X, LayoutDashboard, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { usePageTitle } from '@/lib/usePageTitle';

const Index = () => {
  usePageTitle('জামায়াতে ইসলামী বাংলাদেশ, কাকৈর খোলা, চৌদ্দগ্রাম শাখা');

  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats = [
    { number: '১০,০০০+', label: 'ভোটার', icon: <Users className="w-8 h-8" /> },
    { number: '১০০%', label: 'নিরাপত্তা', icon: <Shield className="w-8 h-8" /> },
    { number: '৫০,০০০+', label: 'SMS', icon: <MessageSquare className="w-8 h-8" /> }
  ];

  const features = [
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: 'ভোটার ডাটা ব্যবস্থাপনা',
      desc: 'সহজে ভোটার তথ্য সংগ্রহ, সংরক্ষণ ও পরিচালনা করুন। আধুনিক প্রযুক্তির মাধ্যমে ডেটা নিরাপদ রাখুন।',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      title: 'উন্নত বিশ্লেষণ',
      desc: 'ডেটা বিশ্লেষণ ও রিপোর্ট তৈরি করে কার্যকর সিদ্ধান্ত নিন। গ্রাফিক্যাল চার্ট ও পরিসংখ্যান দেখুন।',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-purple-600" />,
      title: 'SMS প্রচারণা',
      desc: 'লক্ষ্যভিত্তিক SMS পাঠিয়ে ভোটারদের সাথে যোগাযোগ রাখুন। একসাথে হাজারো মানুষের কাছে পৌঁছান।',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: 'নিরাপত্তা ও গোপনীয়তা',
      desc: 'উচ্চ নিরাপত্তা ব্যবস্থায় সকল তথ্য সুরক্ষিত রাখুন। এনক্রিপশন ও নিরাপদ ডেটাবেস ব্যবহার করুন।',
      color: 'from-red-500 to-red-600'
    }
  ];

  const navItems = [
    { name: 'হোম', href: '#home' },
    { name: 'বৈশিষ্ট্য', href: '#features' },
    { name: 'যোগাযোগ', href: '#contact' },
    { name: 'ডকুমেন্টেশন', href: '/docs' }, // Added documentation link
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                alt="Jamaat Logo"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-bold text-green-800 leading-tight">
                  জামায়াতে ইসলামী বাংলাদেশ
                </span>
                <span className="text-xs sm:text-sm text-gray-600 leading-tight">
                  কাকৈর খোলা, চৌদ্দগ্রাম শাখা
                </span>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  // If it's an external link (starts with /), use Link, else use <a>
                  {...(item.href.startsWith('/') ? { as: Link, to: item.href } : {})}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
                </motion.a>
              ))}
              <div className="flex items-center space-x-3">
                {!currentUser ? (
                  <>
                    <Button asChild variant="outline" size="sm" className="hover:bg-green-50">
                      <Link to="/login">লগইন</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                      <Link to="/register">নিবন্ধন</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                    <Link to="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      ড্যাশবোর্ড
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t bg-white/95 backdrop-blur-md"
            >
              <div className="space-y-3">
                {navItems.map((item) => (
                  item.href.startsWith('/') ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block py-3 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  )
                ))}
                <div className="px-4 pt-4 border-t space-y-3">
                  {!currentUser ? (
                    <>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to="/login">লগইন</Link>
                      </Button>
                      <Button asChild size="sm" className="w-full bg-gradient-to-r from-green-600 to-green-700">
                        <Link to="/register">নিবন্ধন</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-green-600 to-green-700">
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        ড্যাশবোর্ড
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              className="text-center lg:text-left order-2 lg:order-1"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                  ✨ আজই শুরু করুন
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  <span className="text-green-600">ভোটার ব্যবস্থাপনা</span>
                  <br />
                  সিস্টেম
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  জামায়াতে ইসলামী বাংলাদেশ কাকৈর খোলা, চৌদ্দগ্রাম শাখার জন্য আধুনিক ভোটার তথ্য ব্যবস্থাপনা ও প্রচারণা সিস্টেম
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-4 sm:gap-8 mb-8"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2 text-green-600">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-base sm:text-lg"
                >
                  <Link to="/register">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    এখনই যোগ দিন
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-base sm:text-lg"
                >
                  <Link to="#features">
                    বৈশিষ্ট্য দেখুন
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="w-full max-w-md sm:max-w-lg mx-auto">
                  <div className="relative bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 sm:p-12 shadow-2xl">
                    <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full opacity-50"></div>
                    <div className="absolute top-8 right-8 w-2 h-2 bg-white rounded-full opacity-30"></div>
                    <div className="text-center text-white">
                      <div className="mb-6">
                        <img
                          src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                          alt="Logo"
                          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto filter brightness-0 invert"
                        />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-4">
                        ডিজিটাল ভোটার
                        <br />
                        ব্যবস্থাপনা
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span className="text-sm sm:text-base">ভোটার তথ্য</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span className="text-sm sm:text-base">ডেটা বিশ্লেষণ</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm sm:text-base">SMS প্রচার</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-pink-400 rounded-full opacity-80 animate-pulse"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
              🚀 বৈশিষ্ট্যসমূহ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ভোটার ব্যবস্থাপনা সিস্টেমের বৈশিষ্ট্য
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন দক্ষতা ও কার্যকারিতার সাথে
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                    {feature.desc}
                  </p>
                  <div className="mt-6">
                    <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-200">
                      <span className="text-sm">আরও জানুন</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24 px-4 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
              📞 যোগাযোগ
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              যোগাযোগ করুন
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              আমাদের সাথে যোগাযোগ করুন যেকোনো সাহায্যের জন্য
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Phone className="w-8 h-8 text-green-600" />,
                title: "ফোন নম্বর",
                info: "০১৬৪৭৪৭০৮৪৯",
                subtitle: "অ্যাকাউন্ট অনুমোদনের জন্য",
                bg: "from-green-50 to-green-100",
                href: "tel:+8801647470849"
              },
              {
                icon: <Mail className="w-8 h-8 text-blue-600" />,
                title: "ইমেইল",
                info: "mdjakirkhan4928@gmail.com",
                subtitle: "সাধারণ সাপোর্টের জন্য",
                bg: "from-blue-50 to-blue-100",
                href: "mailto:mdjakirkhan4928@gmail.com"
              },
              {
                icon: <MapPin className="w-8 h-8 text-purple-600" />,
                title: "ঠিকানা",
                info: "কাকৈর খোলা, চৌদ্দগ্রাম",
                subtitle: "কুমিল্লা, বাংলাদেশ",
                bg: "from-purple-50 to-purple-100"
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className={`bg-gradient-to-br ${contact.bg} p-6 sm:p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 border border-white/50`}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    {contact.icon}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">{contact.title}</h3>
                {contact.href ? (
                  <a
                    href={contact.href}
                    className="text-lg sm:text-xl font-semibold text-gray-800 hover:text-green-600 transition-colors block mb-2 break-all"
                  >
                    {contact.info}
                  </a>
                ) : (
                  <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{contact.info}</p>
                )}
                <p className="text-sm sm:text-base text-gray-600">{contact.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/bangladesh-jamaat-e-islami-seeklogo.svg"
                  alt="Jamaat Logo"
                  className="w-12 h-12 filter brightness-0 invert"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">জামায়াতে ইসলামী বাংলাদেশ</h3>
                  <p className="text-gray-400">কাকৈর খোলা, চৌদ্দগ্রাম শাখা</p>
                  <p className="text-gray-400 text-sm">ভোটার ব্যবস্থাপনা সিস্টেম</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনার জন্য একটি সম্পূর্ণ সমাধান।
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">বিশ্বস্ত সেবা</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">নিরাপদ সিস্টেম</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">দ্রুত লিংক</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"><span className="mr-2">→</span>লগইন</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"><span className="mr-2">→</span>নিবন্ধন</Link></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"><span className="mr-2">→</span>বৈশিষ্ট্য</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"><span className="mr-2">→</span>যোগাযোগ</a></li>
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"><span className="mr-2">→</span>ডকুমেন্টেশন</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">যোগাযোগের তথ্য</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 mt-1 text-green-400" />
                  <div>
                    <p className="font-medium">০১৬৪৭৪৭০৮৪৯</p>
                    <p className="text-xs">সাপোর্ট লাইন</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 mt-1 text-blue-400" />
                  <div>
                    <p className="font-medium break-all">mdjakirkhan4928@gmail.com</p>
                    <p className="text-xs">ইমেইল সাপোর্ট</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 mt-1 text-purple-400" />
                  <div>
                    <p className="font-medium">কাকৈর খোলা, চৌদ্দগ্রাম</p>
                    <p className="text-xs">কুমিল্লা, বাংলাদেশ</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-gray-400 text-center sm:text-left">
                © ২০২৫ জামায়াতে ইসলামী বাংলাদেশ, কাকৈর খোলা, চৌদ্দগ্রাম শাখা। সকল অধিকার সংরক্ষিত।
              </p>
              <p className="text-sm text-gray-500 text-center sm:text-right">
                Developed with ❤️ by{' '}
                <a
                  href="https://www.facebook.com/jakir.hossen.4928"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  Jakir Hossen
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
