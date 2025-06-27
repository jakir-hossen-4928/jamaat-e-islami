import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const Gallery = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const images = [
        { url: "https://i.ibb.co/JRpJQ2L6/jamat-main-2.jpg", alt: "Campaign Image 1" },
        { url: "https://i.ibb.co/99tHm1hs/jamat-main-1.jpg", alt: "Campaign Image 2" },
        { url: "https://i.ibb.co/WNX98LRX/jamat3.jpg", alt: "Campaign Image 3" },
        { url: "https://i.ibb.co/tj06qkc/jamat2.jpg", alt: "Campaign Image 4" },
        { url: "https://i.ibb.co/wkCY6Vr/jamat1.jpg", alt: "Campaign Image 5" },
    ];

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const slideVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const buttonVariants = {
        hover: { scale: 1.1, rotate: 5 },
        tap: { scale: 0.95 },
    };

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        onSelect();
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (!emblaApi || !isPlaying) return;
        const interval = setInterval(() => {
            emblaApi.scrollNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [emblaApi, isPlaying]);

    const togglePlay = () => setIsPlaying((prev) => !prev);
    const scrollPrev = () => emblaApi?.scrollPrev();
    const scrollNext = () => emblaApi?.scrollNext();

    return (
        <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative bg-gradient-to-r from-green-600 to-emerald-600 py-8 sm:py-10 lg:py-12 overflow-hidden"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full filter blur-xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full filter blur-xl animate-pulse delay-700" />
            </div>

            {/* Heading */}
            <div className="text-center mb-6 sm:mb-8">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md"
                >
                    আমাদের গ্যালারি
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-1 text-sm sm:text-base text-white/90"
                >
                    আমাদের নির্বাচনী প্রচারণার স্মরণীয় মুহূর্ত
                </motion.p>
            </div>

            {/* Carousel */}
            <div className="relative max-w-4xl mx-auto px-2 sm:px-4">
                <div ref={emblaRef} className="overflow-hidden rounded-xl shadow-lg">
                    <motion.div className="flex" layout>
                        {images.map((image, index) => (
                            <motion.div
                                key={index}
                                variants={slideVariants}
                                initial="hidden"
                                animate={index === selectedIndex ? "visible" : "hidden"}
                                className="flex-[0_0-100%] min-w-0"
                            >
                                <Card className="border-0 shadow-none bg-transparent">
                                    <CardContent className="p-0">
                                        <img
                                            src={image.url}
                                            alt={image.alt}
                                            className="w-full h-64 sm:h-72 lg:h-80 object-cover rounded-xl transform transition-transform hover:scale-105"
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Navigation Buttons */}
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={scrollPrev}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-green-800 text-white p-1 sm:p-2 rounded-full shadow-lg z-10"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={scrollNext}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-green-800 text-white p-1 sm:p-2 rounded-full shadow-lg z-10"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>

                {/* Play/Pause Button */}
                <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={togglePlay}
                    className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-green-700 text-white p-1 sm:p-2 rounded-full shadow-lg z-10"
                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                >
                    {isPlaying ? (
                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                        <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                </motion.button>
            </div>

            {/* Progress Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center gap-1 sm:gap-2 mt-4 sm:mt-6"
            >
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === selectedIndex
                                ? "bg-white scale-125 shadow-md"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </motion.div>
        </motion.section>
    );
};

export default Gallery;