export default function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trendicore',
    url: 'https://trendicore.net',
    logo: 'https://trendicore.net/favicon.ico',
    description: 'Plataforma de curación de tendencias en moda y tecnología. Productos verificados de Amazon y Shein.',
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
    </>
  );
}
