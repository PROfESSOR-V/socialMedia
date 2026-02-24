"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { fadeIn, slideUp, scaleIn, blurIn } from "@/lib/animations";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "none";
  animation?: "fade" | "slide" | "scale" | "blur";
  once?: boolean;
  viewportAmount?: number;
}

export const AnimatedSection = ({
  children,
  className,
  delay = 0,
  animation = "slide",
  once = true,
  viewportAmount = 0.3,
}: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: viewportAmount, once });

  let variant: Variants = slideUp;
  if (animation === "fade") variant = fadeIn;
  if (animation === "scale") variant = scaleIn;
  if (animation === "blur") variant = blurIn;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variant}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
