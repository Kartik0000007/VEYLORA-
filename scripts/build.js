/**
 * Veylora Static Site Build Script
 * 
 * Fetches content from the backend API and generates static JSON data files
 * for the public website. Run this before deploying to Cloudflare Pages.
 * 
 * Usage:
 *   API_BASE=https://api.veylora.example.com node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const OUT_DIR = path.join(__dirname, '..', 'website', 'frontend', 'data');

// Atomic write: write to temp file then rename
function atomicWrite(filePath, data) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, data, 'utf8');
  fs.renameSync(tmp, filePath);
}

async function fetchFromAPI(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API ${endpoint} returned ${res.status}`);
  }
  const data = await res.json();
  return data;
}

function stripAdminFields(products) {
  return products.map((p) => {
    const {
      id, category_id, name, slug, description, brand, price, original_price,
      currency, affiliate_url, image_url, is_active, is_featured, sort_order,
      target_audience, aesthetic, product_type, tags, product_source,
      affiliate_network, availability_status, last_price_verified,
      last_content_update, seo_title, seo_description, created_at, updated_at,
    } = p;
    return {
      id, category_id, name, slug, description, brand, price, original_price,
      currency, affiliate_url, image_url, is_active, is_featured, sort_order,
      target_audience, aesthetic, product_type, tags, product_source,
      affiliate_network, availability_status, last_price_verified,
      last_content_update, seo_title, seo_description, created_at, updated_at,
    };
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function build() {
  console.log('🚀 Starting Veylora static build...');
  console.log(`API Base: ${API_BASE}`);

  // Fetch data from API — public endpoints only return active products/categories
  const [categories, products, settings] = await Promise.all([
    fetchFromAPI('/api/categories'),
    fetchFromAPI('/api/products'),
    fetchFromAPI('/api/settings'),
  ]);

  // Filter to active products only (defensive — API should already do this)
  const activeProducts = products.filter((p) => p.is_active !== false);
  const featuredProducts = activeProducts.filter((p) => p.is_featured === true);

  console.log(
    `Loaded ${categories.length} categories, ${activeProducts.length} active products, ${featuredProducts.length} featured`
  );

  // Create output directory
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Strip admin-only fields from public output
  const publicProducts = stripAdminFields(activeProducts);
  const publicCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.image_url,
    is_active: c.is_active,
    sort_order: c.sort_order,
    seo_title: c.seo_title,
    seo_description: c.seo_description,
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));

  // Write JSON data files atomically
  atomicWrite(path.join(OUT_DIR, 'categories.json'), JSON.stringify(publicCategories, null, 2));
  atomicWrite(path.join(OUT_DIR, 'products.json'), JSON.stringify(publicProducts, null, 2));
  atomicWrite(path.join(OUT_DIR, 'settings.json'), JSON.stringify(settings, null, 2));
  atomicWrite(
    path.join(OUT_DIR, 'featured.json'),
    JSON.stringify(stripAdminFields(featuredProducts), null, 2)
  );

  console.log('✓ Core JSON data files written');

  // Group products by category for category-specific files
  const productsByCategory = {};
  activeProducts.forEach((p) => {
    const cid = p.category_id || 'uncategorized';
    if (!productsByCategory[cid]) productsByCategory[cid] = [];
    productsByCategory[cid].push(p);
  });

  // Generate category-specific JSON files
  publicCategories.forEach((cat) => {
    const catProducts = productsByCategory[cat.id] || [];
    atomicWrite(
      path.join(OUT_DIR, `category-${cat.slug}.json`),
      JSON.stringify(
        {
          category: cat,
          products: stripAdminFields(catProducts),
        },
        null,
        2
      )
    );
  });

  // Generate collections: featured, new, aesthetic-based
  const aestheticSet = new Set();
  activeProducts.forEach((p) => {
    if (p.aesthetic) aestheticSet.add(p.aesthetic);
  });

  const collections = {
    featured: stripAdminFields(featuredProducts),
    newest: stripAdminFields(
      [...activeProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20)
    ),
    aesthetics: Array.from(aestheticSet).map((aesthetic) => ({
      name: aesthetic,
      slug: slugify(aesthetic),
      products: stripAdminFields(
        activeProducts.filter((p) => p.aesthetic === aesthetic)
      ),
    })),
  };

  atomicWrite(path.join(OUT_DIR, 'collections.json'), JSON.stringify(collections, null, 2));
  console.log('✓ Collections JSON written');

  // Build summary
  const recordCounts = {
    categories: publicCategories.length,
    products: publicProducts.length,
    featured: featuredProducts.length,
    settings: Object.keys(settings).length,
    collections: collections.aesthetics.length + 2,
  };
  console.log('📊 Build summary:', JSON.stringify(recordCounts, null, 2));
  console.log('✅ Build complete. Static data ready in website/frontend/data/');
}

build().catch((err) => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
