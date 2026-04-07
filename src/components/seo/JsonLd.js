export default function JsonLd({ products = [] }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trendicore',
    url: 'https://trendicore.net',
    logo: 'https://trendicore.net/favicon.ico',
    description: 'Plataforma de selección de tendencias en moda y tecnología. Productos verificados de Amazon y Shein.',
    sameAs: [
      'https://instagram.com/trendicore',
      'https://tiktok.com/@trendicore',
      'https://x.com/trendicore',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trendicore',
    url: 'https://trendicore.net',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://trendicore.net/tienda?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Generate ItemList schema from products if provided
  const productListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.slice(0, 10).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image_url,
        description: product.description || product.title,
        url: `https://trendicore.net/api/track-click?id=${product.id}`,
        brand: {
          '@type': 'Brand',
          name: product.affiliate_source === 'amazon' ? 'Amazon' : 
                product.affiliate_source === 'shein' ? 'Shein' : 'Trendicore',
        },
        ...(product.price > 0 ? {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          }
        } : {}),
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {productListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      )}
    </>
  );
}
