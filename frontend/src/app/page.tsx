import Hero from "@/components/features/Hero";
import ProductCategories from "@/components/features/ProductCategories";
import TrustSection from "@/components/features/TrustSection";
import Testimonial from "@/components/features/Testimonial";
import Highlights from "@/components/features/Highlights";
import AestheticText from "@/components/features/AestheticText";
import LowerBanner from "@/components/features/LowerBanner";
import Footer from "@/components/layout/Footer"; // Explicit import

import WhyChooseUs from "@/components/features/WhyChooseUs";
import TestimonialProduct from "@/components/features/TestimonialProduct";
import Newsletter from "@/components/features/Newsletter";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

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
