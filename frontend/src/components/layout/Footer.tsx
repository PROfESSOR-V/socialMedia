import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-primary">AÚRELYÑ</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium skincare rooted in nature, backed by science.
              Reveal your inner radiance.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">All Products</Link></li>
              <li><Link href="#" className="hover:text-primary">Best Sellers</Link></li>
              <li><Link href="#" className="hover:text-primary">Kits & Sets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary">Sustainability</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Newsletter</h4>
            <p className="mt-4 text-sm text-muted-foreground">
              Subscribe for exclusive offers and skincare tips.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AÚRELYÑ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
