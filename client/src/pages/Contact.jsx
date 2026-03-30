import React from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import SEO from "../components/seo/SEO";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+880 1234-567890",
    description: "Reach us during business hours for quick assistance.",
  },
  {
    icon: Mail,
    title: "Email",
    value: "contact@shimanto.dev",
    description: "Send us your questions anytime and we’ll get back to you.",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Dhaka, Bangladesh",
    description: "Our team operates from our main office location.",
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: "Sat - Thu, 9:00 AM - 8:00 PM",
    description: "Customer support is available during these hours.",
  },
];

const Contact = () => {
  const contactSEO = {
    title: "Contact Us - Best Online Shopping Store",
    description:
      "Get in touch with FashionHub BD for questions about orders, delivery, returns, products, and customer support.",
    keywords:
      "contact FashionHub BD, customer support, contact us, ecommerce support, order help, delivery support, shopping assistance",
    image: "https://e-commerce.shimanto.dev/contact-banner.jpg",
    url: "/contact",
    type: "website",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log("Form Data:", data);

      reset();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const inputClass =
    "w-full rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none transition";
  const errorClass = "mt-2 text-sm text-red-500";

  return (
    <>
      <SEO {...contactSEO} />
      <section className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">
                Contact
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Get in Touch With Us
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 opacity-80 sm:text-base">
                We are here to help with your questions about orders, products,
                delivery, returns, and general support. Reach out to us through
                any of the contact methods below.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border p-6 sm:p-8">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Send Us a Message
                </h2>
                <p className="mt-3 text-sm leading-7 opacity-80 sm:text-base">
                  Fill out the form below and our team will respond as soon as
                  possible.
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-8 space-y-5"
                  noValidate
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your first name"
                        className={inputClass}
                        {...register("firstName", {
                          required: "First name is required",
                          minLength: {
                            value: 2,
                            message: "First name must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.firstName && (
                        <p className={errorClass}>{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your last name"
                        className={inputClass}
                        {...register("lastName", {
                          required: "Last name is required",
                          minLength: {
                            value: 2,
                            message: "Last name must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.lastName && (
                        <p className={errorClass}>{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className={inputClass}
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className={errorClass}>{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Enter message subject"
                      className={inputClass}
                      {...register("subject", {
                        required: "Subject is required",
                        minLength: {
                          value: 5,
                          message: "Subject must be at least 5 characters",
                        },
                      })}
                    />
                    {errors.subject && (
                      <p className={errorClass}>{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write your message here..."
                      className={`${inputClass} resize-none`}
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 20,
                          message: "Message must be at least 20 characters",
                        },
                      })}
                    />
                    {errors.message && (
                      <p className={errorClass}>{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex rounded-2xl border px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border p-6 sm:p-8">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Contact Information
                  </h2>
                  <p className="mt-3 text-sm leading-7 opacity-80 sm:text-base">
                    Prefer direct contact? Use the details below to reach our
                    support team.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {contactInfo.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <article key={index} className="rounded-2xl border p-5">
                          <div className="flex items-start gap-4">
                            <div className="rounded-xl border p-3">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-sm font-medium">
                                {item.value}
                              </p>
                              <p className="mt-2 text-sm leading-6 opacity-70">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border p-6 sm:p-8">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Need Quick Help?
                  </h2>
                  <p className="mt-3 text-sm leading-7 opacity-80 sm:text-base">
                    For faster support, please include your order details,
                    contact information, and a clear description of your issue
                    when reaching out to us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;