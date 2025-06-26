
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://i.ibb.co/JRpJQ2L6/jamat-main-2.jpg",
      title: "জামায়াতে ইসলামী বাংলাদেশ",
      subtitle: "ন্যায়বিচার ও সুশাসনের জন্য"
    },
    {
      image: "https://i.ibb.co/99tHm1hs/jamat-main-1.jpg",
      title: "গ্রামীণ প্রচারণা",
      subtitle: "জনগণের সেবায় নিবেদিত"
    },
    {
      image: "https://i.ibb.co/WNX98LRX/jamat3.jpg",
      title: "একসাথে এগিয়ে চলি",
      subtitle: "উন্নত বাংলাদেশ গড়ার প্রত্যয়ে"
    },
    {
      image: "https://i.ibb.co/tj06qkc/jamat2.jpg",
      title: "যুব শক্তির সাথে",
      subtitle: "নতুন বাংলাদেশের স্বপ্ন"
    },
    {
      image: "https://i.ibb.co/wkCY6Vr/jamat1.jpg",
      title: "গণতান্ত্রিক মূল্যবোধ",
      subtitle: "সকলের অংশগ্রহণে উন্নতি"
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
    <div className="relative h-screen w-full overflow-hidden">
      {/* Logo */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 rounded-full p-2">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-20 left-4 right-4 text-white text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl mb-6 drop-shadow-lg">
                {slide.subtitle}
              </p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                আমাদের সাথে যোগ দিন
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
