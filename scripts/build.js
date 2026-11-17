/**
 * Veylora Static Site Build Script
 * 
 * Fetches content from the backend API and generates static HTML/JSON files
 * for the main website. Run this before deploying to Vercel.
 * 
 * Usage:
 *   API_BASE=https://veylora-backend.onrender.com node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const OUT_DIR = path.join(__dirname, '../website/frontend/data');

async function fetchFromAPI(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API ${endpoint} returned ${res.status}`);
  return res.json();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function priceFormat(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// Generate product card HTML
function productCard(p, catName) {
  return `
    <div class="group bg-surface-container-low rounded overflow-hidden flex flex-col shadow-md transition-all duration-300 hover:shadow-2xl hover:bg-surface-container">
      <div class="relative aspect-[4/5] bg-surface-container-high overflow-hidden">
        <img alt="${p.name}" decoding="async" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${p.image_url}"/>
        <span class="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-2 py-0.5 rounded font-metadata text-metadata text-on-surface-variant">${catName}</span>
        ${p.is_featured ? `<span class="absolute top-3 right-3 bg-surface-container-lowest/90 px-2 py-0.5 rounded flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[14px]">bolt</span><span class="font-metadata text-metadata text-primary font-bold">Prime</span></span>` : ''}
      </div>
      <div class="p-space-md flex flex-col justify-between flex-1">
        <div>
          <span class="font-label-caps-sm text-label-caps-sm text-outline uppercase tracking-wider">${p.brand || 'Veylora'}</span>
          <h4 class="font-headline-sm text-headline-sm text-on-surface mt-0.5 line-clamp-1">${p.name}</h4>
          <div class="flex items-baseline gap-2 mt-space-xs">
            <span class="font-headline-sm text-headline-sm text-primary">₹${Number(p.price).toLocaleString()}</span>
            ${p.original_price ? `<span class="font-metadata text-metadata text-outline line-through">₹${Number(p.original_price).toLocaleString()}</span>` : ''}
          </div>
        </div>
        <a class="mt-space-md w-full py-2.5 rounded bg-primary text-on-primary font-label-caps-sm text-label-caps-sm tracking-[0.16em] uppercase flex items-center justify-center gap-space-xs hover:bg-primary-fixed transition-colors active:scale-95 shadow-sm" href="${p.affiliate_url}" target="_blank" rel="noopener noreferrer sponsored">
          <span>View on Amazon.in</span>
          <span class="material-symbols-outlined text-[15px]">arrow_outward</span>
        </a>
      </div>
    </div>
  `;
}

async function build() {
  console.log('🚀 Starting Veylora static build...');
  console.log(`API Base: ${API_BASE}`);

  // Fetch data from API
  const [categories, products, settings] = await Promise.all([
    fetchFromAPI('/api/categories?active=false'),
    fetchFromAPI('/api/products?active=false'),
    fetchFromAPI('/api/settings'),
  ]);

  console.log(`Loaded ${categories.length} categories, ${products.length} products`);

  // Create output directory
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Write JSON data files
  fs.writeFileSync(path.join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'settings.json'), JSON.stringify(settings, null, 2));
  console.log('✓ JSON data files written');

  // Group products by category
  const productsByCategory = {};
  products.forEach(p => {
    const cid = p.category_id || 'uncategorized';
    if (!productsByCategory[cid]) productsByCategory[cid] = [];
    productsByCategory[cid].push(p);
  });

  // Generate category-specific JSON for each category page
  categories.forEach(cat => {
    const catProducts = productsByCategory[cat.id] || [];
    fs.writeFileSync(
      path.join(OUT_DIR, `category-${cat.slug}.json`),
      JSON.stringify({ category: cat, products: catProducts }, null, 2)
    );
  });

  // Generate featured products JSON
  const featured = products.filter(p => p.is_featured);
  fs.writeFileSync(
    path.join(OUT_DIR, 'featured.json'),
    JSON.stringify(featured, null, 2)
  );

  console.log('✓ Category data files written');
  console.log('✅ Build complete. Static data ready in website/frontend/data/');
}

build().catch(err => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
