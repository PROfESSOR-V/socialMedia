"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ElementType } from "react";
import { blurIn, fadeIn, slideUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  el?: ElementType;
  className?: string;
  once?: boolean;
  animation?: "blur" | "fade" | "slide";
  delay?: number;
}

export const AnimatedText = ({
  text,
  el: Wrapper = "p",
  className,
  once = true,
  animation = "blur",
  delay = 0,
}: AnimatedTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5, once });

  let containerVariant = staggerContainer;
  let childVariant: Variants = blurIn;

  if (animation === "fade") childVariant = fadeIn;
  if (animation === "slide") childVariant = slideUp;

  // Split text into words
  const words = text.split(" ");

  const Component = Wrapper as any;

  return (
    <Component ref={ref} className={cn("inline-block", className)}>
      <motion.span
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
        }}
        aria-hidden
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={childVariant}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
      <span className="sr-only">{text}</span>
    </Component>
  );
};
