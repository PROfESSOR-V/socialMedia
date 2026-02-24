"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonial() {
  return (
    <section className="py-24 bg-white text-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center gap-1 mb-8 text-accent">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          
          <blockquote className="font-serif text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-8">
            &ldquo;It feels healthier, smoother & more radiant than ever. Simply transformative.&rdquo;
          </blockquote>
          
          <div className="flex flex-col items-center">
            <cite className="not-italic font-medium text-lg text-primary">Sarah Mitchell</cite>
            <span className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              Verified Buyer <span className="h-1 w-1 rounded-full bg-accent inline-block" />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
