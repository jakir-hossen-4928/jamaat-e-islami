
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Users, BarChart3, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Hero = () => {
  const { currentUser, userProfile } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel images - using placeholder images for Islamic culture and election themes
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=1200&h=600&fit=crop",
      title: "ভোটার ব্যবস্থাপনা সিস্টেম",
      subtitle: "আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা"
    },
    {
      url: "https://images.unsplash.com/photo-1517491978816-9de84ba2ef5e?w=1200&h=600&fit=crop",
      title: "গণতান্ত্রিক প্রক্রিয়া",
      subtitle: "স্বচ্ছ ও নিরপেক্ষ নির্বাচনের জন্য"
    },
    {
      url: "https://images.unsplash.com/photo-1529258283598-8d6fe60b27f4?w=1200&h=600&fit=crop",
      title: "সামাজিক দায়বদ্ধতা",
      subtitle: "একটি উন্নত সমাজ গঠনে আমাদের অংশগ্রহণ"
    }
  ];

  const fadeInUp = {
    hidden: { 
      y: 30, 
      opacity: 0 
    },
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      {/* Logo Animation */}
      <motion.div 
        className="absolute top-4 left-4 z-20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring" as const, 
          stiffness: 260, 
          damping: 20,
          delay: 0.5 
        }}
      >
        <img
          src="/bangladesh-jamaat-e-islami-seeklogo.svg"
          alt="Jamaat-e-Islami Bangladesh"
          className="w-12 h-12 sm:w-16 sm:h-16 filter brightness-0 invert"
          loading="eager"
        />
      </motion.div>

      {/* Background Carousel */}
      <div className="absolute inset-0">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          loop={true}
          onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
          className="w-full h-full"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/60 to-transparent" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <motion.div 
              className="text-white space-y-4 sm:space-y-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-block px-3 py-1 bg-green-600/30 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-green-400/30 mb-4">
                  জামায়াতে ইসলামী বাংলাদেশ
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                variants={fadeInUp}
              >
                {heroImages[currentSlide]?.title || "ভোটার ব্যবস্থাপনা সিস্টেম"}
              </motion.h1>
              
              <motion.p 
                className="text-base sm:text-lg lg:text-xl text-green-100 max-w-2xl leading-relaxed"
                variants={fadeInUp}
              >
                {heroImages[currentSlide]?.subtitle || "আধুনিক প্রযুক্তির সাহায্যে নির্বাচনী প্রচারণা পরিচালনা করুন। ভোটার তথ্য সংগ্রহ, বিশ্লেষণ এবং কার্যকর যোগাযোগের জন্য একটি সম্পূর্ণ সমাধান।"}
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
                variants={fadeInUp}
              >
                {!currentUser ? (
                  <>
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-white text-green-800 hover:bg-green-50 hover:text-green-900 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8 font-semibold"
                    >
                      <Link to="/register" className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" /> 
                        Request Access
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline" 
                      className="text-white border-white/50 hover:text-green-800 hover:bg-white hover:border-white backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8 font-semibold"
                    >
                      <Link to="/login" className="flex items-center justify-center gap-2">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                        Login
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-white text-green-800 hover:bg-green-50 hover:text-green-900 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8 font-semibold"
                  >
                    <Link to="/dashboard" className="flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                      Dashboard
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 pt-6 sm:pt-8"
                variants={fadeInUp}
              >
                {[
                  { icon: Users, label: 'ভোটার', value: '১০,০০০+' },
                  { icon: Shield, label: 'নিরাপত্তা', value: '১০০%' },
                  { icon: MessageSquare, label: 'SMS', value: '৫০,০০০+' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-300" />
                    <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-green-200">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Features Cards */}
            <motion.div 
              className="lg:pl-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="grid gap-4 sm:gap-6">
                {[
                  {
                    icon: Users,
                    title: 'ভোটার ডাটাবেস',
                    desc: 'সহজে ভোটার তথ্য সংগ্রহ ও পরিচালনা',
                    color: 'bg-white/10 hover:bg-white/20'
                  },
                  {
                    icon: BarChart3,
                    title: 'বিশ্লেষণ ও রিপোর্ট',
                    desc: 'উন্নত বিশ্লেষণ ও তথ্যভিত্তিক সিদ্ধান্ত',
                    color: 'bg-white/10 hover:bg-white/20'
                  },
                  {
                    icon: MessageSquare,
                    title: 'SMS ক্যাম্পেইন',
                    desc: 'লক্ষ্যভিত্তিক যোগাযোগ ও প্রচারণা',
                    color: 'bg-white/10 hover:bg-white/20'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`${feature.color} backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-300 mb-3" />
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-2">{feature.title}</h3>
                    <p className="text-green-100 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Developer Credit */}
      <motion.div 
        className="absolute bottom-4 right-4 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
          <p className="text-white text-xs">
            Developed by{' '}
            <a 
              href="https://www.facebook.com/jakir.hossen.4928" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 font-medium transition-colors"
            >
              Jakir Hossen
            </a>
          </p>
        </div>
      </motion.div>

      {/* Custom Swiper Styles */}
      <style>
        {`
          .swiper-pagination-bullet-custom {
            width: 12px;
            height: 12px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .swiper-pagination-bullet-active-custom {
            background: #16a34a;
            transform: scale(1.25);
          }
        `}
      </style>
    </div>
  );
};

export default Hero;
