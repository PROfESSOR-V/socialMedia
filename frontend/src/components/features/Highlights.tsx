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
    // Removed bg-white so it takes the page background (#f2f2ef)
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-transparent hover:border-zinc-100 hover:shadow-sm transition-all"
            >
              <div className="mb-4 text-zinc-800">
                <item.icon strokeWidth={1.5} className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-medium text-zinc-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
