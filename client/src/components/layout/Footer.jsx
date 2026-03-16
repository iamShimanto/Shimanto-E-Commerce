import { CreditCard, Facebook, Github, Instagram } from "lucide-react";
import { Link } from "react-router";

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Terms of use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
];

const shopLinks = [
  { label: "My Account", href: "/profile" },
  { label: "Checkout", href: "/checkout" },
  { label: "Cart", href: "/cart" },
];

function FooterLinkGroup({ title, links }) {
  return (
    <div>
      <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h3>

      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              className="text-sm text-zinc-600 transition-colors duration-300 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  return (
    <Link
      to={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <Icon size={18} />
    </Link>
  );
}

function PaymentBadge({ children }) {
  return (
    <div className="flex h-10 min-w-18 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
      {children}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_1fr]">
          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <CreditCard size={18} />
              </span>

              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Ecommerce
              </span>
            </Link>

            <p className="mt-6 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              DevCut is a YouTube channel for practical project-based learning.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <SocialLink
                href="https://github.com/iamShimanto"
                icon={Github}
                label="GitHub"
              />
              <SocialLink
                href="https://instagram.com"
                icon={Instagram}
                label="Instagram"
              />
              <SocialLink
                href="https://facebook.com/iamshimanto18"
                icon={Facebook}
                label="Facebook"
              />
            </div>
          </div>

          <FooterLinkGroup title="Support" links={supportLinks} />
          <FooterLinkGroup title="Company" links={companyLinks} />
          <FooterLinkGroup title="Shop" links={shopLinks} />

          {/* Payments */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Accepted Payments
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <PaymentBadge>Mastercard</PaymentBadge>
              <PaymentBadge>AMEX</PaymentBadge>
              <PaymentBadge>VISA</PaymentBadge>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            © 2023 DevCut. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
