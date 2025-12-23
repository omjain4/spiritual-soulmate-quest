import { Link } from "react-router-dom";
import { Heart, Mail, ArrowUpRight, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Careers", href: "/careers" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Safety Tips", href: "/trust-safety" },
      { label: "Community Guidelines", href: "/guidelines" },
      { label: "Contact Us", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="bg-foreground">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="font-serif text-2xl font-light text-white">Jain Jodi</span>
            </Link>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
              The dating app designed to be deleted. Find meaningful connections based on 
              shared values, spiritual compatibility, and what truly matters.
            </p>
            
            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-sm font-medium text-white">Stay updated</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
                />
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-foreground transition-transform hover:scale-105">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Company Links */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-widest text-white/40">Company</h4>
              <ul className="mt-6 space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-widest text-white/40">Support</h4>
              <ul className="mt-6 space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-widest text-white/40">Legal</h4>
              <ul className="mt-6 space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row md:px-12 lg:px-20">
          <p className="text-sm text-white/40">
            © {currentYear} Jain Jodi. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-white/30 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;