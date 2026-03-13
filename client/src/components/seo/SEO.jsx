import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'Shimanto',
    section,
    tags = [],
    price,
    currency = 'BDT',
    availability,
    productId,
    brand,
    rating,
    reviewCount
}) => {
    const siteName = 'Your E-commerce Store';
    const siteUrl = 'https://e-commerce.shimanto.dev';
    const defaultImage = 'https://e-commerce.shimanto.dev/og.jpg';

    const seoImage = image || defaultImage;
    const canonicalUrl = url ? `${siteUrl}${url}` : siteUrl;

    // Schema.org markup for different page types
    const getSchemaMarkup = () => {
        let schema = {};

        if (type === 'product') {
            schema = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": title,
                "description": description,
                "image": seoImage,
                "sku": productId,
                "brand": {
                    "@type": "Brand",
                    "name": brand || siteName
                },
                "offers": {
                    "@type": "Offer",
                    "price": price,
                    "priceCurrency": currency,
                    "availability": availability === 'in stock'
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock"
                }
            };

            if (rating && reviewCount) {
                schema.aggregateRating = {
                    "@type": "AggregateRating",
                    "ratingValue": rating,
                    "reviewCount": reviewCount
                };
            }
        }
        else if (type === 'article' || type === 'blog') {
            schema = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": title,
                "description": description,
                "image": seoImage,
                "datePublished": publishedTime,
                "dateModified": modifiedTime || publishedTime,
                "author": {
                    "@type": "Person",
                    "name": author
                }
            };
        }
        else if (type === 'website') {
            schema = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": siteName,
                "url": siteUrl,
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${siteUrl}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            };
        }

        return JSON.stringify(schema);
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{`${title} | ${siteName}`}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={seoImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={seoImage} />

            {/* Article specific meta tags */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && section && (
                <meta property="article:section" content={section} />
            )}
            {type === 'article' && tags.map(tag => (
                <meta property="article:tag" content={tag} key={tag} />
            ))}

            {/* Product specific meta tags */}
            {type === 'product' && price && (
                <>
                    <meta property="product:price:amount" content={price} />
                    <meta property="product:price:currency" content={currency} />
                    <meta property="product:availability" content={availability} />
                </>
            )}

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {getSchemaMarkup()}
            </script>
        </Helmet>
    );
};

export default SEO;