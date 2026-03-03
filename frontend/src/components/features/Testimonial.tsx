"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Testimonial() {
  return (
    <section className="bg-[#f6f6f4] py-16 md:py-24 text-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container mx-auto px-6 max-w-[700px]"
      >
        <div className="flex justify-center gap-1.5 mb-6 md:mb-8 text-[#111111]">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 md:h-6 md:w-6 fill-current stroke-none" />
          ))}
        </div>
        
        <blockquote className="font-serif text-[28px] sm:text-3xl md:text-[40px] text-[#111111] leading-[1.3] mb-8 md:mb-12">
          "It feels healthier, smoother & more radiant than ever. Simply transformative."
        </blockquote>
        
        <div className="flex flex-col items-center">
          <cite className="not-italic font-serif text-lg md:text-xl text-[#111111] font-medium tracking-wide">Sarah Mitchell</cite>
          <span className="text-xs md:text-sm text-zinc-600 mt-2 flex items-center justify-center gap-1 uppercase tracking-wider font-medium">
            Verified Buyer <span className="h-1 w-1 rounded-full bg-zinc-400 inline-block ml-1" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
