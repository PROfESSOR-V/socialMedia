"use client";

import { Leaf, Heart, CheckCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";

const highlights = [
  {
    icon: Leaf,
    title: "Natural Formula",
    description: "Crafted with pure, skin-loving ingredients for ultimate care.",
  },
  {
    icon: Heart,
    title: "Cruelty-Free",
    description: "Our products are never tested on animals, guaranteed ethical.",
  },
  {
    icon: CheckCircle,
    title: "Expert Approved",
    description: "Carefully tested to ensure safety and visible results.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Delivered to your doorstep with no extra costs worldwide.",
  },
];

export default function Highlights() {
  return (
    // Adjust top and bottom padding to reduce gap from top banner
    <section className="pt-10 pb-16 md:py-16">
      <div className="container mx-auto px-6 sm:px-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mx-auto max-w-sm sm:max-w-none">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center px-6 py-8 md:p-8 rounded-[20px] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/[0.03] hover:border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="mb-5 text-zinc-800">
                <item.icon strokeWidth={1.25} className="w-8 h-8 md:w-9 md:h-9" />
              </div>
              <h3 className="text-[15px] md:text-base font-serif font-medium uppercase tracking-widest text-zinc-900 mb-3">
                {item.title}
              </h3>
              <p className="text-[14px] text-zinc-500 leading-relaxed max-w-[240px]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
