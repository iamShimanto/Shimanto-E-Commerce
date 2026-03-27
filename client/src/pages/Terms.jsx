import React from "react";
import SEO from "../components/seo/SEO";

const sections = [
    {
        title: "Acceptance of Terms",
        content:
            "By accessing and using this website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not use this website.",
    },
    {
        title: "Use of Services",
        content:
            "You agree to use our website and services only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the platform.",
    },
    {
        title: "Orders and Pricing",
        content:
            "All orders are subject to availability and confirmation. We reserve the right to update pricing, product details, or discontinue products at any time without prior notice.",
    },
    {
        title: "Payments",
        content:
            "Payments must be completed through the available payment methods at checkout. By submitting payment information, you confirm that you are authorized to use the selected payment method.",
    },
    {
        title: "Returns and Refunds",
        content:
            "Refunds and returns are handled according to our applicable return policy. Eligibility may depend on product condition, return timing, and other policy requirements.",
    },
    {
        title: "Limitation of Liability",
        content:
            "We are not responsible for any indirect, incidental, or consequential damages resulting from the use or inability to use our website, products, or services, to the extent permitted by law.",
    },
    {
        title: "Changes to These Terms",
        content:
            "We may revise these Terms and Conditions at any time. Updated terms will become effective once published on this page.",
    },
];

const Terms = () => {
    const termsSEO = {
        title: "Terms and Conditions - Best Online Shopping Store",
        description:
            "Read the Terms and Conditions of FashionHub BD to understand the rules, policies, and guidelines for using our website, placing orders, and accessing our services.",
        keywords:
            "terms and conditions fashion hub, website terms, shopping terms, ecommerce policy, user agreement, order terms, online store conditions, legal policy fashion hub, service terms, fashion hub bd terms",
        image: "https://e-commerce.shimanto.dev/terms-banner.jpg",
        url: "/terms",
        type: "website",
    };
    return (
        <>
            <SEO {...termsSEO} />
            <section className="min-h-screen py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl space-y-10">
                        <div className="text-center">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                                Terms
                            </p>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Terms and Conditions
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
                                These terms govern your access to and use of our website,
                                products, and services. Please review them carefully before
                                continuing.
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

export default Terms;   