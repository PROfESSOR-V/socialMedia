import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative md:sticky bottom-0 bg-[#111111] text-white pt-16 pb-8 md:py-16 h-auto md:h-screen md:max-h-[800px] flex flex-col justify-end md:justify-center w-full transition-transform duration-700">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          
          {/* Column 1: Follow us */}
          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wide">Follow us</h3>
            <div className="flex gap-3">
              <Link 
                href="https://www.instagram.com/aurelyn_beauty?igsh=bG1vMzI5Z3I2cjBh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#222222] rounded flex items-center justify-center hover:bg-[#333333] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" strokeWidth={1.5} />
              </Link>
              <Link 
                href="https://www.facebook.com/people/Aurelyn/61583305157502/?rdid=3u5ONjs1lR1AodXJ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1HB62ENoyS%2F" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#222222] rounded flex items-center justify-center hover:bg-[#333333] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Column 2: Need help? */}
          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wide">Need help?</h3>
            <div className="space-y-4 text-sm text-[#cccccc]">
              <p>
                <a href="mailto:support@aurelynbeauty.com" className="hover:text-white transition-colors">
                  support@aurelynbeauty.com
                </a>
              </p>
              <p>We're here to help! Reach out anytime.</p>
            </div>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-sm font-semibold mb-6 tracking-wide">Policies</h3>
            <ul className="space-y-4 text-sm text-[#cccccc]">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors block">Privacy policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-white transition-colors block">Refund policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors block">Terms of service</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors block">Shipping policy</Link></li>
              <li><Link href="/contact-information" className="hover:text-white transition-colors block">Contact information</Link></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom text */}
        <div className="text-xs text-[#888888] pt-8 md:pt-16 mt-4 border-t border-[#222222]">
          © {new Date().getFullYear()} AÚRELYÑ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
