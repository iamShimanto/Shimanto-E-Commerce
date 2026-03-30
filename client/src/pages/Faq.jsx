import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import SEO from "../components/seo/SEO";

const faqData = [
  {
    question: "How can I place an order?",
    answer:
      "You can place an order by browsing our products, selecting your preferred item, and proceeding to checkout with the required information.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery times may vary depending on your location, but most orders are delivered within a few business days after confirmation.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Yes, eligible products can be returned or exchanged according to our return policy. Please make sure the product is unused and returned within the allowed period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept commonly used payment methods, including cash on delivery and available online payment options shown during checkout.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact our support team through the contact page or the phone number and email address provided on the website.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes, once your order is confirmed and shipped, you will receive the necessary tracking details if tracking is available.",
  },
];

const FaqItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="rounded-2xl border bg-background">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <h3 className="text-base font-semibold">{item.question}</h3>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSEO = {
    title: "FAQ - Best Online Shopping Store",
    description:
      "Find answers to common questions about orders, delivery, payments, returns, and account support at FashionHub BD. Get the help you need for a smooth and convenient shopping experience.",
    keywords:
      "faq fashion hub, shopping faq, delivery questions, return policy faq, payment help, customer support faq, online shopping help, order questions, fashion hub bd faq, ecommerce support",
    image: "https://e-commerce.shimanto.dev/faq-banner.jpg",
    url: "/faq",
    type: "website",
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SEO {...faqSEO} />
      <section className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
              Help Center
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Find answers to the most common questions about orders, delivery,
              payments, returns, and customer support.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-4 md:mt-12">
            {faqData.map((item, index) => (
              <FaqItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Faq;