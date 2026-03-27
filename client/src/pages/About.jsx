import React from "react";
import SEO from "../components/seo/SEO";

const highlights = [
  {
    title: "Our Mission",
    description:
      "Our mission is to make online shopping simple, reliable, and enjoyable by offering carefully selected products, a smooth user experience, and dependable customer support.",
  },
  {
    title: "What We Offer",
    description:
      "We provide a curated collection of quality products designed to meet the needs of modern customers who value style, convenience, and confidence in every purchase.",
  },
  {
    title: "Customer First",
    description:
      "We place our customers at the center of everything we do, from product selection and pricing to delivery, support, and after-sales service.",
  },
];

const About = () => {
  const aboutSEO = {
    title: "About Us - Best Online Shopping Store",
    description:
      "Learn more about FashionHub BD, our mission, our values, and our commitment to delivering a reliable and enjoyable online shopping experience.",
    keywords:
      "about FashionHub BD, about us, ecommerce brand, online shopping store, company information, shopping experience, customer-first brand",
    image: "https://e-commerce.shimanto.dev/about-banner.jpg",
    url: "/about",
    type: "website",
  };
  return (
    <>
      <SEO {...aboutSEO} />
      <section className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                About Us
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                We’re Building a Better Shopping Experience
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                We are committed to delivering a seamless online shopping
                experience through quality products, thoughtful service, and a
                customer-focused approach that puts trust and convenience first.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map((item, index) => (
                <article key={index} className="rounded-2xl border p-6">
                  <h2 className="text-lg font-semibold sm:text-xl">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 opacity-80 sm:text-base">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border p-6 sm:p-8 md:p-10">
              <div className="grid gap-8 md:grid-cols-2 md:gap-10">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Who We Are
                  </h2>
                  <p className="mt-4 text-sm leading-7 opacity-80 sm:text-base">
                    We are an online shopping platform dedicated to bringing
                    customers a trusted destination for discovering quality
                    products across a range of categories. Our goal is to combine
                    convenience, reliability, and a modern shopping experience in
                    one place.
                  </p>
                  <p className="mt-4 text-sm leading-7 opacity-80 sm:text-base">
                    From browsing to checkout, we focus on creating a journey that
                    feels smooth, transparent, and customer-friendly at every
                    step.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Why Choose Us
                  </h2>
                  <ul className="mt-4 space-y-3 text-sm leading-7 opacity-80 sm:text-base">
                    <li>Carefully selected products with a focus on quality</li>
                    <li>Simple and user-friendly shopping experience</li>
                    <li>Reliable order processing and customer support</li>
                    <li>Transparent policies for trust and confidence</li>
                    <li>Continuous improvement based on customer needs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-6 text-center sm:p-8 md:p-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Our Commitment
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                We believe great ecommerce is not only about products — it is
                about trust, service, and consistency. We are committed to
                improving every part of the customer experience so that every
                visit feels easy, helpful, and worthwhile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About; 