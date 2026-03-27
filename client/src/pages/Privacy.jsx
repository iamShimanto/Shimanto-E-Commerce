import React from "react";
import SEO from "../components/seo/SEO";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We may collect personal information such as your name, email address, phone number, shipping address, and payment-related details when you place an order, create an account, or contact us.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to process orders, provide customer support, improve our services, personalize your experience, and communicate important updates related to your account or purchases.",
  },
  {
    title: "Cookies and Tracking Technologies",
    content:
      "We may use cookies and similar technologies to enhance website functionality, remember your preferences, analyze traffic, and improve the overall user experience.",
  },
  {
    title: "Sharing of Information",
    content:
      "We do not sell your personal information. However, we may share necessary information with trusted service providers, payment processors, and delivery partners to complete transactions and operate our services effectively.",
  },
  {
    title: "Data Security",
    content:
      "We take reasonable security measures to protect your personal information from unauthorized access, misuse, disclosure, or alteration. However, no method of transmission over the internet is completely secure.",
  },
  {
    title: "Your Rights and Choices",
    content:
      "You may have the right to access, update, or request deletion of your personal information, subject to applicable laws and legitimate business requirements.",
  },
  {
    title: "Third-Party Links",
    content:
      "Our website may contain links to third-party websites. We are not responsible for the privacy practices, content, or policies of those external websites.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will become effective once posted on this page. Continued use of the website after such changes indicates your acceptance of the updated policy.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions or concerns about this Privacy Policy or how your information is handled, please contact us through the support channels available on our website.",
  },
];

const Privacy = () => {
  const privacySEO = {
    title: "Privacy Policy - Best Online Shopping Store",
    description:
      "Read the Privacy Policy of FashionHub BD to understand how we collect, use, protect, and manage your personal information.",
    keywords:
      "FashionHub BD privacy policy, privacy policy, data protection, personal information, user privacy, ecommerce privacy, website privacy",
    image: "https://e-commerce.shimanto.dev/privacy-banner.jpg",
    url: "/privacy",
    type: "website",
  };
  return (
    <>
      <SEO {...privacySEO} />
      <section className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                Privacy
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Privacy Policy
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
                This Privacy Policy explains how we collect, use, protect, and
                manage your personal information when you use our website and
                services.
              </p>
            </div>

            <div className="space-y-5">
              {sections.map((section, index) => (
                <article key={index} className="rounded-2xl border p-5 sm:p-6">
                  <h2 className="text-lg font-semibold sm:text-xl">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 opacity-80 sm:text-base">
                    {section.content}
                  </p>
                </article>
              ))}
            </div>

            <div className="border-t pt-5">
              <p className="text-sm opacity-70">
                Last updated: <span className="font-medium">March 2026</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacy;