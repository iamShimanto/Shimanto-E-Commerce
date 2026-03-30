import React from "react";
import { Link } from "react-router";
import SEO from "../components/seo/SEO";

const openings = [
    {
        title: "Frontend Developer",
        type: "Full-time",
        location: "Remote / Dhaka, Bangladesh",
        description:
            "We are looking for a frontend developer with strong experience in modern JavaScript, React, and responsive UI development to help us build seamless customer experiences.",
    },
    {
        title: "Backend Developer",
        type: "Full-time",
        location: "Remote / Dhaka, Bangladesh",
        description:
            "Join our engineering team to build scalable backend systems, APIs, and services that power a reliable and efficient ecommerce platform.",
    },
    {
        title: "Customer Support Executive",
        type: "Full-time",
        location: "On-site / Dhaka, Bangladesh",
        description:
            "Help us deliver excellent customer experiences by assisting users with orders, delivery questions, returns, and general support inquiries.",
    },
];

const values = [
    {
        title: "Growth",
        description:
            "We believe in continuous learning, improvement, and creating opportunities for every team member to grow professionally.",
    },
    {
        title: "Ownership",
        description:
            "We value people who take initiative, solve problems responsibly, and contribute meaningfully to the success of the team.",
    },
    {
        title: "Collaboration",
        description:
            "We work together with transparency, respect, and shared goals to build better experiences for our customers.",
    },
];

const Careers = () => {
    const careersSEO = {
        title: "Careers - Best Online Shopping Store",
        description:
            "Explore career opportunities at FashionHub BD and join our team to help build a better online shopping experience.",
        keywords:
            "FashionHub BD careers, jobs, hiring, career opportunities, ecommerce jobs, frontend developer jobs, backend developer jobs, customer support jobs",
        image: "https://e-commerce.shimanto.dev/careers-banner.jpg",
        url: "/careers",
        type: "website",
    };
    return (
        <>
            <SEO {...careersSEO} />
            <section className="min-h-screen py-12 md:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl space-y-12">
                        <div className="text-center">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                                Careers
                            </p>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                Build Your Career With Us
                            </h1>
                            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                                Join our team and help us create a better ecommerce experience
                                through innovation, service, and a shared commitment to quality.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {values.map((item, index) => (
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
                            <div className="max-w-3xl">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Why Work With Us
                                </h2>
                                <p className="mt-4 text-sm leading-7 opacity-80 sm:text-base">
                                    We are building more than just an online store. We are building
                                    a team that values creativity, accountability, and meaningful
                                    impact. Whether you work in engineering, operations, marketing,
                                    or customer support, your work will directly contribute to a
                                    better experience for our customers.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Open Positions
                                </h2>
                                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
                                    Explore current opportunities and find a role that matches your
                                    skills, experience, and career goals.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {openings.map((job, index) => (
                                    <article key={index} className="rounded-2xl border p-6">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold tracking-tight">
                                                    {job.title}
                                                </h3>
                                                <div className="mt-2 flex flex-wrap gap-2 text-sm opacity-75">
                                                    <span className="rounded-full border px-3 py-1">
                                                        {job.type}
                                                    </span>
                                                    <span className="rounded-full border px-3 py-1">
                                                        {job.location}
                                                    </span>
                                                </div>
                                                <p className="mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                                                    {job.description}
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                <button
                                                    type="button"
                                                    className="inline-flex rounded-2xl border px-5 py-3 text-sm font-semibold transition"
                                                >
                                                    Apply Now
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border p-6 text-center sm:p-8 md:p-10">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Don’t See the Right Role?
                            </h2>
                            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                                We are always interested in connecting with talented people. If
                                you believe you can add value to our team, feel free to reach out
                                and share your profile with us.
                            </p>
                            <Link
                                to={"/contact"}
                                className="mt-6 inline-flex rounded-2xl border px-6 py-3 text-sm font-semibold transition"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Careers;