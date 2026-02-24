"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { blurIn, slideUp } from "@/lib/animations";

const slides = [
  {
    id: 1,
    image: "/assets/Banner 1_page-0001.jpg",
    title: (
      <>
        Refresh <br />
        <span className="italic font-light">Your Skin</span>
      </>
    ),
    description: "Skincare stripped to the essentials — clean, effective, and made with nature in mind.",
    cta: "Shop Now",
    align: "left",
  },
  {
    id: 2,
    image: "/assets/Banner 2_page-0001.jpg",
    title: (
      <>
        Daily <br />
        <span className="italic font-light">Rituals</span>
      </>
    ),
    description: "Elevate your routine with products that care for your skin and the planet.",
    cta: "Shop Now",
    align: "left",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotation removed per user request


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[65vh] md:h-screen w-full overflow-hidden bg-[#EAE8E4]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }} // Smooth crossfade
          className="absolute inset-0 h-full w-full"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slides[currentSlide].image}
              alt="Hero Banner"
              fill
              className="object-cover object-[75%_top] sm:object-center"
              priority
            />
             <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full items-center px-6 sm:px-12 lg:px-24 pt-20">
            <div className="max-w-3xl text-white">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.2 } },
                }}
              >
                <motion.h1
                  variants={blurIn}
                  className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[1.0] sm:leading-[0.9] tracking-tight"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                <div className="mt-6 sm:mt-8 max-w-md text-base sm:text-lg text-white/90 leading-relaxed font-light">
                   <AnimatedText 
                      text={slides[currentSlide].description} 
                      className="text-white/90"
                      animation="blur"
                      delay={0.4}
                   />
                </div>

                <motion.div
                  variants={slideUp}
                  className="mt-10"
                >
                  <Link
                    href="/products"
                    className="inline-block border-b border-white pb-1 text-sm uppercase tracking-widest text-white hover:opacity-80 transition-opacity"
                  >
                    {slides[currentSlide].cta}
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors hidden md:block"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors px-3 py-3 bg-black/20 rounded-md backdrop-blur-sm hidden md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-all shadow-sm ${
              currentSlide === index ? "bg-white scale-125" : "bg-white/40 hover:bg-white"
            }`}
          />
        ))}
      </div>

       {/* Right Side Scroll Text */}
       <div className="absolute bottom-10 right-10 z-20 hidden md:block">
        <span className="font-serif italic text-white/80 text-lg">Scroll Down</span>
      </div>
    </section>
  );
}
