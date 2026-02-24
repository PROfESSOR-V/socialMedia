"use client";

import { motion } from "framer-motion";
import { Leaf, Award, Recycle } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Ingredients sourced directly from nature, free from harmful chemicals.",
  },
  {
    icon: Award,
    title: "Dermatologist Tested",
    description: "Clinically proven formulas that are safe and effective for all skin types.",
  },
  {
    icon: Recycle,
    title: "Eco-Friendly Packaging",
    description: "Sustainable packaging materials to minimize our environmental footprint.",
  },
];

export default function Features() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-medium text-primary">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
