"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  "New arrivals now available",
  "Free delivery",
  "Shop now and save up to 30%",
];

export default function FeatureStrip() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-6 bg-zinc-50 border-y border-zinc-100">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <div className="relative h-8 w-full max-w-md overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-sm md:text-base font-medium tracking-wide text-zinc-800 uppercase">
                {features[currentIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-3">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-black w-4" : "bg-zinc-300 hover:bg-zinc-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
