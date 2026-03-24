import SEO from '../components/seo/SEO';
import Banner from '../components/home/Banner';
import Category from '../components/home/Category';

const Home = () => {
  const homeSEO = {
    title: 'Home - Best Online Shopping Store',
    description: 'Discover the latest fashion trends at FashionHub BD. Shop trendy clothing, and accessories for men, women, and kids. ✓Free Shipping ✓Easy Returns ✓Cash on Delivery. New arrivals every week!',
    keywords: 'fashion Bangladesh, online clothing store, dress shop, men fashion, women fashion, kids wear, trendy clothes, branded outfits, fashion shopping, buy clothes online, Dhaka fashion, Bangladeshi clothing brand',
    image: 'https://e-commerce.shimanto.dev/home-banner.jpg',
    url: '/',
    type: 'website'
  };

  return (
    <>
      <SEO {...homeSEO} />
      <Banner />
      <Category />
    </>
  )
}

export default Home