"use client";

import Image from "next/image";
import { Check, Leaf, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export default function LowerBanner() {
  return (
    <section className="pt-4 pb-12 md:py-16 md:pb-24">
      <div className="px-0 sm:px-6 md:px-10 lg:px-16">
        <div className="relative w-full h-[450px] sm:h-[480px] md:h-auto md:min-h-[700px] lg:min-h-[800px]
                    rounded-none sm:rounded-[24px] md:rounded-[32px] overflow-hidden flex items-center">
          {/* Background Image */}
          <Image
            src="/assets/lower-banner.png"
            alt="Eco-friendly skincare"
            fill
            className="object-cover w-full h-full"
            priority
          />
          
          {/* Overlay - adjusting opacity for readability if needed, though image might be dark enough. 
              Adding a subtle gradient just in case. */}
          <div className="absolute inset-0 bg-black/40 md:bg-black/20" />

          {/* Content */}
          <div className="relative z-10 w-full max-w-xl p-6 md:p-12 lg:p-16 text-white ml-0 md:ml-8 lg:ml-12">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-serif text-[36px] md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-tight md:leading-tight"
            >
              Eco-Friendly, <br />
              <span className="italic">Skin-Friendly</span>
            </motion.h2>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-white/90 text-sm md:text-lg mb-6 md:mb-10 leading-relaxed max-w-[320px] md:max-w-full"
            >
              100% natural means every ingredient is carefully selected from nature to provide safe, effective, and gentle care for your skin.
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3 md:space-y-4"
            >
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 md:w-5 h-5 text-white" />
                <span className="font-medium text-[13px] md:text-base">No Harsh Chemicals</span>
              </div>
              <div className="flex items-center gap-3">
                <Leaf className="w-4 h-4 md:w-5 h-5 text-white" />
                <span className="font-medium text-[13px] md:text-base">Natural Goodness</span>
              </div>
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-4 h-4 md:w-5 h-5 text-white" />
                <span className="font-medium text-[13px] md:text-base">Ethically Sourced</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
