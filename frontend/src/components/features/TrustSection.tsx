"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check, Leaf, Recycle, Heart } from "lucide-react";

export default function TrustSection() {
  return (
    <section>
      {/* Feature Banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-primary text-secondary px-6 py-16 sm:px-12 lg:py-24"
        >
          <div className="absolute inset-0 opacity-10">
             {/* Abstract pattern or image could go here */}
              <Image
                src="/assets/unwatermarked_Gemini_Generated_Image_y74u0vy74u0vy74u.png"
                alt="Background Pattern"
                fill
                className="object-cover"
              />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div>
                <h2 className="font-serif text-3xl sm:text-4xl mb-6">Eco-Friendly, <br/> <span className="italic">Skin-Friendly</span></h2>
                <p className="text-secondary/80 max-w-md mb-8">
                    Our commitment goes beyond just skincare. We ensure every ingredient is ethically sourced and every package is designed to minimize environmental impact.
                </p>
                <div className="space-y-4">
                    {[
                        { icon: Check, text: "No Harsh Chemicals" },
                        { icon: Leaf, text: "Plant-Based Goodness" },
                        { icon: Recycle, text: "Ethically Sourced" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="p-1 rounded-full bg-accent/20 text-accent">
                                <item.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>
             </div>
             
             {/* Decorative element implementation if needed */}
          </div>
        </motion.div>
      </div>

      {/* Trust Split Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        <div className="relative h-full min-h-[400px]">
           <Image 
             src="/assets/1000334019.png" // Using a product image as placeholder for "close-up skincare image"
             alt="Close up skin texture"
             fill
             className="object-cover animate-kenburns" // Hypothetical animation class, or just static
           />
           {/* Floating Card */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="absolute bottom-12 left-12 bg-white/90 backdrop-blur rounded-lg p-6 max-w-xs shadow-lg"
           >
              <h4 className="font-serif text-xl text-primary mb-2">Pure & Potent</h4>
              <p className="text-sm text-muted-foreground">Formulated with 100% active botanicals for visible results.</p>
           </motion.div>
        </div>
        
        <div className="bg-[#E8E8E4] flex flex-col justify-center items-center text-center p-12 md:p-24">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6 }}
            >
                <div className="mb-6 flex justify-center text-primary">
                    <Heart className="h-12 w-12 fill-current opacity-20" />
                </div>
                <h2 className="font-serif text-5xl md:text-7xl text-primary leading-none mb-4">
                    100% <span className="italic block mt-2">Natural</span>
                </h2>
                <h2 className="font-serif text-5xl md:text-7xl text-primary/40 leading-none">
                    100% <span className="italic block mt-2">You</span>
                </h2>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
