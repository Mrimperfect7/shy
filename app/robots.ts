import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://esharanatural.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/account/',
        '/checkout/',
        '/cart/',
        '/login/',
        '/influencer/',
        '/ref/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
