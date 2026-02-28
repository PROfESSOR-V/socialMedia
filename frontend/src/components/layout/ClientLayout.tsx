"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import FeedbackSection from "../features/FeedbackSection";
import CartDrawer from "../features/CartDrawer";
import AuthModal from "../ui/AuthModal";
import MessageModal from "../ui/MessageModal";
import PageTransition from "./PageTransition";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-zinc-50">{children}</main>;
  }

  return (
    <>
      <div className="page-content">
        <Header />
        <PageTransition>
          <main className="min-h-screen">{children}</main>
        </PageTransition>
      </div>

      <CartDrawer />
      <AuthModal />
      <MessageModal />

      <section className="footer-reveal">
        <FeedbackSection />
        <Footer />
      </section>
    </>
  );
}
