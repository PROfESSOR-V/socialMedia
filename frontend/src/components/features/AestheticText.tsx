"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AestheticText() {
  return (
    <section className="py-8 md:pt-12 md:pb-16 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif italic font-bold text-3xl md:text-5xl lg:text-6xl text-zinc-800 leading-tight md:leading-snug tracking-tight"
        >
          <span className="inline-block align-middle">Refresh your skin,</span>{" "}
          <span className="inline-block align-middle mx-2 relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden transform -rotate-6 border-2 border-white shadow-lg">
            <Image
              src="/assets/image 1.png"
              alt="Skin refresh"
              fill
              className="object-cover"
            />
          </span>{" "}
          <span className="inline-block align-middle">love yourself,</span>{" "}
          <span className="inline-block align-middle mx-2 relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden transform rotate-6 border-2 border-white shadow-lg">
            <Image
              src="/assets/image 2.png"
              alt="Self love"
              fill
              className="object-cover"
            />
          </span>{" "}
          <br className="hidden md:block" />
          <span className="inline-block align-middle">renew your glow.</span>{" "}
          <span className="inline-block align-middle mx-2 relative w-20 h-14 md:w-24 md:h-16 lg:w-28 lg:h-20 rounded-full overflow-hidden transform -rotate-3 border-2 border-white shadow-lg">
            <Image
              src="/assets/image 3.png"
              alt="Glow"
              fill
              className="object-cover"
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
