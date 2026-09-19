// Seeds the SHYNISH showroom catalog (categories + products) from the single
// source of truth: lib/data/shynish-products.json
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Minimal .env loader (no deps)
try {
  const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(here, '../lib/data/shynish-products.json'), 'utf8'));

const prisma = new PrismaClient();

async function main() {
  const categories = new Map();
  for (const p of catalog) {
    if (p.category?.id) categories.set(p.category.id, p.category);
  }
  for (const c of categories.values()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { id: c.id, name: c.name, slug: c.slug },
    });
  }
  console.log(`Categories upserted: ${categories.size}`);

  for (const p of catalog) {
    const category = await prisma.category.findUnique({ where: { slug: p.category.slug } });
    const data = {
      title: p.title,
      slug: p.slug,
      descriptionHtml: p.descriptionHtml,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      inventory: p.inventory,
      status: 'ACTIVE',
      imageUrls: p.imageUrls,
      categoryId: category?.id || null,
      model3dUrl: p.model3dUrl || null,
      material: p.material,
      plating: p.plating,
      careInstructions: p.careInstructions,
      dimensions: p.dimensions,
      tryOnEnabled: Boolean(p.tryOnEnabled),
      tryOnBodyPart: p.tryOnBodyPart || null,
      tryOnConfig: p.tryOnConfig || null,
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { id: p.id, ...data },
    });
  }
  console.log(`Products upserted: ${catalog.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
