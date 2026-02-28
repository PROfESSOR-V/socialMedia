"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Leaf, Recycle, HeartHandshake, Feather, ScanFace, Heart } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section className="pt-8 pb-12 md:py-24 bg-[#f2f2ef] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-[600px] mx-auto text-center mb-8 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-[32px] md:text-5xl text-zinc-900 leading-[1.2] md:leading-tight"
          >
            Why Your Skin <br />
            <span className="italic text-zinc-600 font-light md:font-normal">Deserves the Best</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Video Section (Big Card) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[440px] lg:min-h-[850px] shadow-sm group"
          >
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            >
              <source src="/assets/video 1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Overlay for slight darkening */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Proven Effectiveness Card */}
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg max-w-[200px] md:max-w-xs transition-transform hover:scale-105 duration-300">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <div className="bg-zinc-900 text-white p-1 md:p-1.5 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h4 className="font-serif text-base md:text-lg text-zinc-900">Proven</h4>
                </div>
                <p className="font-serif text-lg md:text-xl italic text-zinc-900 mb-1 md:mb-2">Effectiveness</p>
                <p className="text-[10px] md:text-xs text-zinc-600 leading-relaxed line-clamp-2 md:line-clamp-none">
                    Every product is carefully crafted to meet the highest quality standards.
                </p>
            </div>
          </motion.div>

          {/* Right: Info Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6 md:gap-8">
            
            {/* Top Card: Eco-Friendly */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#e8e8e1] rounded-[32px] p-8 md:p-10 flex flex-row items-center gap-2 md:gap-6 relative overflow-hidden flex-1 min-h-[320px] sm:min-h-[340px] md:min-h-[400px]"
            >
               <div className="flex-1 z-10 w-full mb-auto mt-0 pt-0">
                  <div className="mb-4 md:mb-6">
                     <Recycle className="w-6 h-6 md:w-10 md:h-10 text-zinc-900 flex-shrink-0" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[32px] md:text-4xl lg:text-5xl text-zinc-900 mb-4 md:mb-4 leading-[1.1]">
                    Eco-Friendly <br />
                    <span className="italic font-light text-zinc-800">Packaging</span>
                  </h3>
                  <p className="text-[#5a5a5a] text-[13px] md:text-base leading-[1.6] max-w-[180px] sm:max-w-[220px] font-normal">
                    Eco-friendly materials <br className="block md:hidden"/>
                    designed to care <br className="block md:hidden"/>
                    for the planet as <br className="block md:hidden"/>
                    much as your skin.
                  </p>
               </div>
               <div className="w-[100px] h-[240px] md:w-40 md:h-72 absolute right-0 bottom-[-20px] md:relative md:self-auto md:right-auto md:bottom-auto">
                  <Image 
                    src="/assets/1000334012.png" 
                    alt="Eco Friendly Bottle" 
                    fill 
                    className="object-contain object-bottom md:object-center"
                  />
               </div>
            </motion.div>

            {/* Bottom Card: 100% Natural */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#414d3f] rounded-[32px] p-8 md:p-10 flex flex-row items-center gap-2 md:gap-6 relative overflow-hidden flex-1 min-h-[320px] sm:min-h-[340px] md:min-h-[400px] text-white"
            >
               <div className="w-[140px] sm:w-[160px] h-[300px] absolute left-[-30px] bottom-[-20px] md:relative md:w-40 md:h-[220px] md:flex-shrink-0 md:left-auto md:bottom-auto">
                  <Image 
                    src="/assets/1000334013.png" 
                    alt="Natural Ingredients" 
                    fill 
                    className="object-contain object-left-bottom md:object-center"
                  />
               </div>
               <div className="flex-1 z-10 pl-[100px] sm:pl-[120px] md:pl-0 flex flex-col justify-start h-full pt-1">
                   <div className="mb-4 md:mb-6">
                     <Leaf className="w-6 h-6 md:w-10 md:h-10 text-white flex-shrink-0" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-[32px] md:text-4xl lg:text-5xl mb-4 md:mb-4 leading-[1.1]">
                    100% Natural <br />
                    <span className="italic font-light text-white/90">100% You</span>
                  </h3>
                   <div className="space-y-3 pl-1">
                      <div className="flex items-center gap-2.5">
                        <Feather className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2} />
                        <span className="text-[14px] md:text-base font-medium text-white/95">No Harsh Chemicals</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Leaf className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2} />
                         <span className="text-[14px] md:text-base font-medium text-white/95">Plant-Based Goodness</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <HeartHandshake className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2} />
                         <span className="text-[14px] md:text-base font-medium text-white/95">Ethically Sourced</span>
                      </div>
                   </div>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
