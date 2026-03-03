import dynamic from 'next/dynamic';

import Hero from "@/components/features/Hero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Footer from "@/components/layout/Footer"; // Explicit import

const ProductCategories = dynamic(() => import("@/components/features/ProductCategories"));
const TrustSection = dynamic(() => import("@/components/features/TrustSection"));
const Testimonial = dynamic(() => import("@/components/features/Testimonial"));
const Highlights = dynamic(() => import("@/components/features/Highlights"));
const AestheticText = dynamic(() => import("@/components/features/AestheticText"));
const LowerBanner = dynamic(() => import("@/components/features/LowerBanner"));
const WhyChooseUs = dynamic(() => import("@/components/features/WhyChooseUs"));
const TestimonialProduct = dynamic(() => import("@/components/features/TestimonialProduct"));
const Newsletter = dynamic(() => import("@/components/features/Newsletter"));

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <AnimatedSection delay={0.1}>
        <Highlights />
      </AnimatedSection>
      <AnimatedSection>
        <AestheticText />
      </AnimatedSection>
      <AnimatedSection>
        <ProductCategories />
      </AnimatedSection>
      <AnimatedSection animation="scale" viewportAmount={0.5}>
        <LowerBanner />
      </AnimatedSection>
      <AnimatedSection>
        <WhyChooseUs />
      </AnimatedSection>
      <AnimatedSection>
        <TestimonialProduct />
      </AnimatedSection>
      <AnimatedSection animation="fade">
        <Newsletter />
      </AnimatedSection>
      <AnimatedSection>
        <Testimonial />
      </AnimatedSection>
    </main>
  );
}
