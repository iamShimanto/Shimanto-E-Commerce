import HeroSection from "@/components/home/Hero-Section";

const bannerContent = [
  {
    id: 1,
    image: "/1.webp",
    title: "Discover New Arrivals",
    subtitle: "Upgrade your wardrobe with the latest trends.",
  },
  {
    id: 2,
    image: "/2.webp",
    title: "Summer Sale Up To 50%",
    subtitle: "Limited time offers on selected items.",
  },
  {
    id: 3,
    image: "/3.webp",
    title: "Free Shipping Worldwide",
    subtitle: "Fast delivery and easy returns on all orders.",
  },
]

const Page = () => {
  return (
    <>
      <HeroSection bannerContent={bannerContent} />
    </>
  );
};

export default Page;
