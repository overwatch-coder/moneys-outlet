import { footerLinks } from "@/lib/data";
import {
  FaFacebookF as Facebook,
  FaTwitter as Twitter,
  FaInstagram as Instagram,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-20 pb-10">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-8">
            <img
              src="/logos/logo.png"
              alt="Money's Outlet"
              className="h-16 md:h-20 w-auto object-contain transition-all duration-300"
            />
          </div>

          <p className="max-w-md text-muted mb-12 leading-relaxed">
            Top-tier sneakers and premium apparel. Where high-end style meets
            unbeatable value.
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-xs font-bold uppercase tracking-[0.2em] mb-16 text-muted">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.url}
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex gap-6 mb-12">
            <Link
              to="#"
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              to="#"
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              to="#"
              className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>

          <div className="text-[10px] text-muted tracking-widest uppercase">
            © {new Date().getFullYear()} Money's Outlet. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
