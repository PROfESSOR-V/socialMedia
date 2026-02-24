"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const concerns = [
  {
    id: 1,
    image: "/assets/sub-banner1.webp",
    label: "Dark Spots",
  },
  {
    id: 2,
    image: "/assets/sub-banner2.webp",
    label: "Anti-Aging",
  },
  {
    id: 3,
    image: "/assets/sub-banner3.webp",
    label: "Acne-Prone",
  },
];

export default function SkinConcern() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-black">
            Skin Concern
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {concerns.map((concern, index) => (
            <motion.div
              key={concern.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col items-center group"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-6 shadow-sm">
                <Image
                  src={concern.image}
                  alt={concern.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-bold text-black border-b border-transparent group-hover:border-black transition-all pb-1">
                {concern.label}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
