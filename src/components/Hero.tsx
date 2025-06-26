
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://i.ibb.co/JRpJQ2L6/jamat-main-2.jpg",
      title: "জামায়াতে ইসলামী বাংলাদেশ",
      subtitle: "ন্যায়বিচার ও সুশাসনের জন্য",
      description: "একটি ন্যায়পরায়ণ ও কল্যাণকর সমাজ গড়তে আমাদের সাথে থাকুন"
    },
    {
      image: "https://i.ibb.co/99tHm1hs/jamat-main-1.jpg",
      title: "গ্রামীণ প্রচারণা",
      subtitle: "জনগণের সেবায় নিবেদিত",
      description: "প্রতিটি গ্রামে পৌঁছে দিচ্ছি পরিবর্তনের বার্তা"
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
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative">
      {/* Hero Slideshow */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 z-10 opacity-10">
          <div className="h-full w-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30l15-15v30l-15-15zm0 0l-15-15v30l15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Logo */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <img 
            src="https://i.ibb.co/6Rt79ScS/bangladesh-jamaat-e-islami-seeklogo.png" 
            alt="Jamaat-e-Islami Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Slideshow */}
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              
              {/* Content */}
              <div className="absolute inset-x-4 bottom-24 md:bottom-32 text-white">
                <div className="max-w-4xl mx-auto text-center">
                  {/* Islamic Star Decoration */}
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="w-6 h-6 text-green-400 fill-current" />
                      <div className="w-12 h-0.5 bg-green-400"></div>
                      <Star className="w-6 h-6 text-green-400 fill-current" />
                    </div>
                  </div>
                  
                  <h1 className="text-2xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-2xl mb-4 drop-shadow-lg text-green-200">
                    {slide.subtitle}
                  </p>
                  <p className="text-sm md:text-lg mb-8 max-w-2xl mx-auto opacity-90">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
                      asChild
                    >
                      <Link to="/register">
                        <Users className="w-5 h-5 mr-2" />
                        আমাদের সাথে যোগ দিন
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-green-700 shadow-xl transform hover:scale-105 transition-all duration-200"
                      asChild
                    >
                      <Link to="/login">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        ড্যাশবোর্ড
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-green-400 scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl md:text-4xl font-bold mb-2">১০০+</div>
              <div className="text-green-200">সক্রিয় সদস্য</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl md:text-4xl font-bold mb-2">৫০+</div>
              <div className="text-green-200">এলাকায় কার্যক্রম</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <div className="text-3xl md:text-4xl font-bold mb-2">২৪/৭</div>
              <div className="text-green-200">সেবা প্রদান</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
