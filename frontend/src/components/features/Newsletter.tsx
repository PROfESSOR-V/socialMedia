"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Newsletter() {
  return (
    <section className="py-24 bg-[#f2f2ef] px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-[1400px]">
        <div className="bg-[#3e4c3d] rounded-[2rem] md:rounded-[50px] p-6 md:p-14 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[350px] md:min-h-[700px]">
          
          {/* Content */}
          <div className="relative z-10 max-w-xl w-full pt-4 md:pt-0">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white mb-3 md:mb-6 leading-tight"
            >
              Stay Updated, <br />
              <span className="italic text-white/90">Stay Radiant</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/80 text-sm md:text-xl mb-6 md:mb-10 max-w-lg font-light"
            >
              Be the first to know about new products, offers, and skincare tips.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-full p-1.5 pl-6 flex flex-row items-center max-w-md shadow-2xl gap-2 md:gap-0"
            >
              <input 
                type="email" 
                placeholder="Your Email" 
                className="flex-1 bg-transparent border-none outline-none text-zinc-800 placeholder:text-zinc-400 text-sm md:text-base"
              />
              <button className="bg-[#5c6c5b] hover:bg-[#4a5849] text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base font-medium transition-colors flex-shrink-0">
                Subscribe
              </button>
            </motion.div>
          </div>

          {/* Image Section */}
          <div className="absolute right-0 bottom-0 top-0 w-full md:w-[55%] lg:w-[50%] pointer-events-none hidden md:block">
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-full w-full"
            >
                <Image 
                    src="/assets/1000334014.png"
                    alt="Lotion Bottle with Leaves"
                    fill
                    className="object-contain object-center"
                />
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
