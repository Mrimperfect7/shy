import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shynish.com';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/under-480`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/creator-collab`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  // Dynamic routes
  try {
    const [products, categories, dbArticles, seoMetadata] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.journalArticle.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.seoMetadata.findMany({
        select: { entityType: true, entityId: true, robotsIndex: true }
      })
    ]);

    const isIndexed = (type: string, id: string) => {
      const seo = seoMetadata.find(s => s.entityType === type && s.entityId === id);
      return seo ? seo.robotsIndex : true;
    };

    const productUrls: MetadataRoute.Sitemap = products
      .filter(p => isIndexed("PRODUCT", p.slug))
      .map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'daily',
        priority: 0.9,
      }));

    const categoryUrls: MetadataRoute.Sitemap = categories
      .filter(c => isIndexed("CATEGORY", c.slug))
      .map((cat) => ({
        url: `${baseUrl}/collections/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.85,
      }));

    // Fallback static article slugs if not in DB yet
    const fallbackArticleSlugs = [
      "pvd-gold-vs-regular-gold-plating",
      "art-of-everyday-chain-layering",
      "complete-jewellery-care-guide",
    ];

    const dbSlugs = new Set(dbArticles.map((a) => a.slug));
    const articleUrls: MetadataRoute.Sitemap = [
      ...dbArticles.map((article) => ({
        url: `${baseUrl}/journal/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
      ...fallbackArticleSlugs
        .filter((slug) => !dbSlugs.has(slug))
        .map((slug) => ({
          url: `${baseUrl}/journal/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.75,
        })),
    ].filter(a => isIndexed("ARTICLE", a.url.split('/').pop() || ''));

    const filteredRoutes = routes.filter(r => {
      const path = new URL(r.url).pathname.replace(/^\//, '') || 'home';
      return isIndexed("PAGE", path);
    });

    return [...filteredRoutes, ...productUrls, ...categoryUrls, ...articleUrls];
  } catch (error) {
    console.error("Failed to generate sitemap for dynamic items", error);
    return routes;
  }
}
