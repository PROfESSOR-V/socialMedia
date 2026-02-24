"use client";

import Image from "next/image";
import { Check, Leaf, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export default function LowerBanner() {
  return (
    <section className="py-16 pb-24">
      <div className="px-6 md:px-10 lg:px-16">
        <div className="relative w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px]
                    rounded-[32px] overflow-hidden flex items-center">
          {/* Background Image */}
          <Image
            src="/assets/lower-banner.png"
            alt="Eco-friendly skincare"
            fill
            className="object-cover"
            priority
          />
          
          {/* Overlay - adjusting opacity for readability if needed, though image might be dark enough. 
              Adding a subtle gradient just in case. */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="relative z-10 max-w-xl p-8 md:p-12 lg:p-16 text-white ml-0 md:ml-8 lg:ml-12">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
            >
              Eco-Friendly, <br />
              <span className="italic">Skin-Friendly</span>
            </motion.h2>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-white/90 text-lg mb-10 leading-relaxed"
            >
              100% natural means every ingredient is carefully selected from nature to provide safe, effective, and gentle care for your skin.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-white" />
                <span className="font-medium">No Harsh Chemicals</span>
              </div>
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-white" />
                <span className="font-medium">Natural Goodness</span>
              </div>
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-5 h-5 text-white" />
                <span className="font-medium">Ethically Sourced</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
