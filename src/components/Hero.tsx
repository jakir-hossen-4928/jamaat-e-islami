
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, BarChart3, Shield, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Hero = () => {
  const { currentUser } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  const slides = [
    {
      image: "https://i.ibb.co/JRpJQ2L6/jamat-main-2.jpg",
      title: "জামায়াতে ইসলামী বাংলাদেশ",
      subtitle: "ন্যায়বিচার ও সুশাসনের জন্য",
      description: "একটি ন্যায়পরায়ণ ও কল্যাণকর সমাজ গড়তে আমাদের সাথে থাকুন"
    },
    {
      image: "https://i.ibb.co/99tHm1hs/jamat-main-1.jpg",
      title: "ভোটার ব্যবস্থাপনা সিস্টেম",
      subtitle: "আধুনিক প্রযুক্তির সাহায্যে",
      description: "নির্বাচনী প্রচারণা পরিচালনা করুন দক্ষতার সাথে"
    },
    {
      image: "https://i.ibb.co/WNX98LRX/jamat3.jpg",
      title: "একসাথে এগিয়ে চলি",
      subtitle: "উন্নত বাংলাদেশ গড়ার প্রত্যয়ে",
      description: "সবার অংশগ্রহণে গড়ব স্বপ্নের বাংলাদেশ"
    },
    {
      image: "https://i.ibb.co/tj06qkc/jamat2.jpg",
      title: "যুব শক্তির সাথে",
      subtitle: "নতুন বাংলাদেশের স্বপ্ন",
      description: "তারুণ্যের শক্তিতে এগিয়ে চলেছে দেশ"
    },
    {
      image: "https://i.ibb.co/wkCY6Vr/jamat1.jpg",
      title: "গণতান্ত্রিক মূল্যবোধ",
      subtitle: "সকলের অংশগ্রহণে উন্নতি",
      description: "প্রকৃত গণতন্ত্রের পথে এগিয়ে চলুন আমাদের সাথে"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
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
    <div className="relative">
      {/* Hero Slideshow */}
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gradient-to-br from-green-900 to-green-700">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 z-10 opacity-5">
          <div className="h-full w-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30l15-15v30l-15-15zm0 0l-15-15v30l15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Logo - Fixed position */}
        <motion.div 
          className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg"
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
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" 
            alt="Jamaat-e-Islami Logo" 
            className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
            loading="eager"
          />
        </motion.div>

        {/* Swiper Slideshow */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            el: '.swiper-pagination-custom',
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                
                {/* Content */}
                <motion.div 
                  className="absolute inset-x-4 bottom-16 sm:bottom-24 md:bottom-32 text-white"
                  variants={containerVariants}
                  initial="hidden"
                  animate={isLoaded ? "visible" : "hidden"}
                >
                  <div className="max-w-4xl mx-auto text-center">
                    {/* Islamic Star Decoration */}
                    <motion.div 
                      className="flex justify-center mb-4"
                      variants={itemVariants}
                    >
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 sm:w-6 sm:h-6 text-green-400 fill-current" />
                        <div className="w-8 sm:w-12 h-0.5 bg-green-400"></div>
                        <Star className="w-4 h-4 sm:w-6 sm:h-6 text-green-400 fill-current" />
                      </div>
                    </motion.div>
                    
                    <motion.h1 
                      className="text-xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 drop-shadow-2xl"
                      variants={itemVariants}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      className="text-sm sm:text-lg md:text-2xl mb-2 sm:mb-4 drop-shadow-lg text-green-200"
                      variants={itemVariants}
                    >
                      {slide.subtitle}
                    </motion.p>
                    <motion.p 
                      className="text-xs sm:text-sm md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90"
                      variants={itemVariants}
                    >
                      {slide.description}
                    </motion.p>
                    
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                      variants={itemVariants}
                    >
                      {!currentUser ? (
                        <>
                          <Button 
                            size="lg" 
                            className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
                            asChild
                          >
                            <Link to="/register">
                              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Request Access
                            </Link>
                          </Button>
                          <Button 
                            size="lg" 
                            variant="outline" 
                            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-green-700 shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
                            asChild
                          >
                            <Link to="/login">
                              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Login
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="lg" 
                          className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full px-6 sm:px-8"
                          asChild
                        >
                          <Link to="/dashboard">
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Go to Dashboard
                          </Link>
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full p-2 sm:p-3 z-20 transition-all duration-200">
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
        
        <button className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full p-2 sm:p-3 z-20 transition-all duration-200">
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Custom Pagination */}
        <div className="swiper-pagination-custom absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20"></div>
      </div>

      {/* Stats Section */}
      <motion.div 
        className="bg-gradient-to-r from-green-800 to-green-600 py-8 sm:py-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center text-white">
            <motion.div 
              className="transform hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">১০০+</div>
              <div className="text-green-200 text-sm sm:text-base">সক্রিয় সদস্য</div>
            </motion.div>
            <motion.div 
              className="transform hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">৫০+</div>
              <div className="text-green-200 text-sm sm:text-base">এলাকায় কার্যক্রম</div>
            </motion.div>
            <motion.div 
              className="transform hover:scale-105 transition-transform duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">২৪/৭</div>
              <div className="text-green-200 text-sm sm:text-base">সেবা প্রদান</div>
            </motion.div>
          </div>
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
