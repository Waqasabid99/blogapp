import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

const Footer = ({ categories }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-(--bg-primary) border-t border-(--border-light) pt-16 pb-8">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="heading-3 text-(--text-primary) italic mb-4 block"
            >
              NEWZONE
            </Link>
            <p className="text-sm text-(--text-muted) mb-6 leading-relaxed">
              Your go-to source for the latest insights, stories, and ideas from
              our community of writers and thinkers.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 rounded-full bg-(--bg-secondary) text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-(--bg-secondary) text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-(--bg-secondary) text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://github.com/Waqasabid99"
                className="p-2 rounded-full bg-(--bg-secondary) text-(--text-secondary) hover:text-(--brand-primary) hover:bg-(--brand-primary)/10 transition-colors"
                aria-label="Github"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[17px] text-base font-semibold text-(--text-primary) mb-6">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-base font-semibold text-(--text-primary) mb-6">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          {categories.length > 0 ? (
            <div>
              <h4 className="text-base font-semibold text-(--text-primary) mb-6">
                Categories
              </h4>
              <ul className="flex flex-col gap-3">
                {categories?.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/blog/${category.slug}`}
                      className="text-sm text-(--text-muted) hover:text-(--brand-primary) transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-(--border-light) flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-(--text-muted)">
            &copy; {currentYear} NEWZONE. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-(--text-muted)">
            <span>Crafted with passion for readers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
