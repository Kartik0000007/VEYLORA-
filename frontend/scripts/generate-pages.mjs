/**
 * VEYLORA — static page composer
 * ---------------------------------------------------------------------------
 * Reads the original design mockups in /assets, keeps the editorial body of
 * each page, then wraps it with the shared responsive masthead, overlays,
 * footer, theme and motion controller.
 *
 * Run from the project root:
 *   node frontend/scripts/generate-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const assetsDir = path.join(projectRoot, "assets");
const frontendDir = path.join(projectRoot, "frontend");

const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, contents) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, "utf8");
};

const headPartial = read(path.join(frontendDir, "partials", "head.html"));
const headerPartial = read(path.join(frontendDir, "partials", "header.html"));
const overlaysPartial = read(path.join(frontendDir, "partials", "overlays.html"));
const footerPartial = read(path.join(frontendDir, "partials", "footer.html"));

const pages = [
  {
    source: "veylora_homepage",
    output: "index.html",
    page: "home",
    title: "Veylora — The Art of Everyday Style | Curated Luxury Discoveries",
    description:
      "Veylora is a curated fashion archive for the aesthetically minded. Discover quiet luxury, menswear, womenswear, footwear and accessories through an editorial lens, with verified Amazon.in discoveries."
  },
  {
    source: "veylora_men_s_fashion_collection",
    output: "men.html",
    page: "men",
    title: "Men's Archive — Veylora | Tailoring, Knitwear & Quiet Luxury",
    description:
      "The Veylora Men's Archive: an editorial edit of quiet-luxury tailoring, heavy knitwear, Horween leather and archival menswear discoveries, curated for the modern wardrobe."
  },
  {
    source: "veylora_women_s_fashion_collection",
    output: "women.html",
    page: "women",
    title: "Women's Edit — Veylora | Elevated Capsule Wardrobe",
    description:
      "Explore the Veylora Women's Edit: sculptural tailoring, refined knitwear, silk and elevated everyday pieces curated through a dark-editorial luxury lens."
  },
  {
    source: "veylora_comprehensive_clothing_catalog",
    output: "clothing.html",
    page: "clothing",
    title: "Clothing Catalogue — Veylora | Curated Garments & Textiles",
    description:
      "A comprehensive Veylora clothing catalogue of heirloom fabrics, architectural silhouettes and catwalk-adjacent essentials, with verified Amazon.in discoveries."
  },
  {
    source: "veylora_footwear_catalog_index",
    output: "footwear.html",
    page: "footwear",
    title: "Footwear Index — Veylora | Boots, Loafers & Sculptural Shoes",
    description:
      "The Veylora footwear index: hand-welted boots, sartorial oxfords, minimalist sneakers and sculptural silhouettes, curated for patina and permanence."
  },
  {
    source: "veylora_accessories_catalog_accoutrements",
    output: "accessories.html",
    page: "accessories",
    title: "Accessories — Veylora | Leather, Horology & Accoutrements",
    description:
      "Veylora accessories: archival watches, fine jewellery, leather goods and the quiet accoutrements that complete a considered wardrobe."
  },
  {
    source: "veylora_the_18_aesthetic_moods_style_directory",
    output: "aesthetics.html",
    page: "aesthetics",
    title: "The 18 Aesthetic Moods — Veylora | Style Directory",
    description:
      "Navigate the Veylora style directory: eighteen aesthetic moods from Quiet Luxury and Old Money Heritage to Dark Academia and Gorpcore, each with a curated archive."
  },
  {
    source: "veylora_trending_cult_discoveries_the_viral_pulse",
    output: "trending.html",
    page: "trending",
    title: "Trending Curiosities — Veylora | The Viral Pulse",
    description:
      "The Viral Pulse by Veylora: cult discoveries, viral grails and the pieces gathering momentum across TikTok, Instagram moodboards and the global style underground."
  },
  {
    source: "veylora_the_style_edit_editorial_articles_buying_guides",
    output: "style-edit.html",
    page: "the-style-edit",
    title: "The Style Edit — Veylora | Editorial Articles & Buying Guides",
    description:
      "The Style Edit: Veylora's editorial essays, fabric deep-dives and buying guides for the discerning wardrobe. Zero promotional clutter, only considered curation."
  },
  {
    source: "veylora_curated_search_results_filter_state",
    output: "search.html",
    page: "search",
    title: "Search the Archive — Veylora | Curated Results",
    description:
      "Search the Veylora archive by fibre, weight, silhouette or mood. Explore curated results with verified Amazon.in discoveries and editorially approved pieces."
  },
  {
    source: "veylora_empty_search_results_aesthetic_recommendations",
    output: "search-empty.html",
    page: "search",
    title: "No Results — Veylora | Aesthetic Recommendations",
    description:
      "No exact match in the Veylora archive. Explore adjacent aesthetic moods, relaxed search suggestions and a curated edit of pieces worth discovering."
  }
];

const decodeEntities = (value = "") =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”");

const stripTags = (value = "") =>
  decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const attrValue = (attrs, name) => {
  // Require a real attribute boundary so "alt" never matches inside "data-alt".
  const match = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? decodeEntities(match[1]) : "";
};

const escapeHtml = (value = "") =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* --------------------------------------------------------------------------
   Content extraction
   -------------------------------------------------------------------------- */
function extractBody(html) {
  const headerEnd = html.toLowerCase().indexOf("</header>");
  const footerStart = html.toLowerCase().indexOf("<footer", Math.max(0, headerEnd));

  if (headerEnd === -1) {
    throw new Error("Could not find the closing </header> in the source design.");
  }

  const start = headerEnd + "</header>".length;
  const end = footerStart === -1 ? html.length : footerStart;
  return html.slice(start, end).trim();
}

/* --------------------------------------------------------------------------
   Small content repairs
   -------------------------------------------------------------------------- */
const summarizeAlt = (value = "") => {
  const cleaned = decodeEntities(value)
    .replace(/\b(?:strictly no|absolutely no|completely devoid of|without|no|zero)\s+(?:humans?|people|persons?|models?|mannequins?|faces?|human (?:presence|elements|figures?|silhouettes?))\b[^.]*\.?/gi, " ")
    .replace(/\b(?:no|zero)\s+(?:people|humans|models|persons)[^.]*\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const firstSentence = (cleaned.match(/^.*?[.!?](?=\s|$)/) || [cleaned])[0];
  const trimmed =
    firstSentence.length > 150
      ? `${firstSentence.slice(0, 147).replace(/\s+\S*$/, "")}…`
      : firstSentence;

  return trimmed.replace(/[.\s]+$/, "");
};

const articleAltText = (article = "") => {
  const heading = article.match(/<h[234]\b[^>]*>([\s\S]*?)<\/h[234]>/i);
  return heading ? stripTags(heading[1]) : "";
};

function repairImages(content) {
  let index = 0;

  // The exported mockups lower-case a few case-sensitive SVG attributes.
  const withSvgCase = content.replace(/\bviewbox=/gi, "viewBox=");

  // Images inside a product/article card inherit the card title as alt text.
  const articleRanges = [];
  for (const match of withSvgCase.matchAll(/<article\b[\s\S]*?<\/article>/gi)) {
    articleRanges.push({
      start: match.index,
      end: match.index + match[0].length,
      alt: articleAltText(match[0])
    });
  }

  return withSvgCase.replace(/<img\b[^>]*>/gi, (tag, offset) => {
    index += 1;
    let next = tag;

    if (/alt="[^"]*monogram[^"]*"/i.test(next)) {
      next = next.replace(/\bsrc="[^"]*"/i, 'src="assets/images/veylora-luxury-monogram-logo.png"');
    }

    if (index > 2 && !/\bloading=/i.test(next)) {
      next = next.replace(/<img\b/i, '<img loading="lazy"');
    }
    if (!/\bdecoding=/i.test(next)) {
      next = next.replace(/<img\b/i, '<img decoding="async"');
    }
    if (index === 1 && !/\bfetchpriority=/i.test(next)) {
      next = next.replace(/<img\b/i, '<img fetchpriority="high"');
    }

    // The mockups describe imagery through data-alt but never expose an alt
    // attribute. Screen readers were therefore announcing raw file names.
    if (!attrValue(next, "alt").trim()) {
      const range = articleRanges.find((entry) => offset >= entry.start && offset < entry.end);
      const candidate =
        (range && range.alt) || summarizeAlt(attrValue(next, "data-alt")) || "";
      const hasRealAlt = /(?:^|\s)alt\s*=\s*"[^"]*"/i.test(next);

      if (candidate) {
        if (hasRealAlt) {
          next = next.replace(
            /(^|\s)alt\s*=\s*"[^"]*"/i,
            `$1alt="${escapeHtml(candidate)}"`
          );
        } else {
          next = next.replace(/<img\b/i, `<img alt="${escapeHtml(candidate)}"`);
        }
      } else if (!hasRealAlt) {
        next = next.replace(/<img\b/i, '<img alt=""');
      }
    }

    return next;
  });
}

/* --------------------------------------------------------------------------
   Responsive editorial refinements applied to every rebuild
   -------------------------------------------------------------------------- */
const PRODUCT_PAGES = new Set(["men", "women", "clothing", "footwear", "accessories", "trending", "search"]);

function applyResponsivePass(content, page) {
  let next = content;

  // A token used by the women's edit did not exist under this name.
  next = next.replace(/\bgap-space-gutter\b/g, "gap-gutter");

  // Icon-only controls often ship with a `title` but no programmatic name.
  // Promote the tooltip to an aria-label so screen readers get a stable label.
  next = next.replace(/<button\b[^>]*>/gi, (tag) => {
    if (/(?:^|\s)aria-label(?:ledby)?\s*=/i.test(tag)) return tag;
    const title = attrValue(tag, "title");
    if (!title) return tag;
    return tag.replace(/<button\b/i, `<button aria-label="${escapeHtml(title)}"`);
  });

  // Relaxation suggestions are toggles, not one-shot buttons.
  next = next.replace(
    /<button class="(px-3\.5 py-2 bg-surface-container[^"]*)"/g,
    '<button class="$1 relax-chip" aria-pressed="false"'
  );

  // Search and sort controls need programmatic labels, not just placeholders.
  next = next.replace(/<input\b[^>]*>/gi, (tag) => {
    if (!/\btype\s*=\s*"(?:text|search)"/i.test(tag)) return tag;
    if (/(?:^|\s)aria-label\s*=/i.test(tag)) return tag;
    return tag.replace(/<input\b/i, '<input aria-label="Search the Veylora archive"');
  });
  next = next.replace(/<select\b[^>]*>/gi, (tag) => {
    if (/(?:^|\s)aria-label\s*=/i.test(tag)) return tag;
    return tag.replace(/<select\b/i, '<select aria-label="Sort and refine results"');
  });

  // Display headlines use the smaller editorial cut on phones.
  next = next.replace(
    /<h1 class="font-headline-hero text-headline-hero\b/g,
    '<h1 class="font-headline-hero text-headline-hero-mobile sm:text-headline-hero'
  );

  // The decorative astrolabe must never create a 700px overflow paint area.
  next = next.replace(
    /<svg class="w-\[700px\] h-\[700px\] animate-spin"/g,
    '<svg class="vey-astrolabe animate-spin"'
  );
  next = next.replace(/pointer-events-none opacity-20/g, "pointer-events-none vey-astrolabe-wrap");

  // Wider product grids on large desktop canvases.
  if (PRODUCT_PAGES.has(page)) {
    next = next.replace(/class="([^"]*\bxl:grid-cols-3\b[^"]*)"/g, (full, classes) => {
      if (/\bmin-\[1440px\]:grid-cols-4\b/.test(classes)) return full;
      return `class="${classes} min-[1440px]:grid-cols-4"`;
    });
  }

  // Homepage hero and statistics.
  if (page === "home") {
    next = next.replace(
      /<section class="relative w-full overflow-hidden bg-surface-container-lowest/,
      '<section class="vey-hero-bleed relative w-full overflow-hidden bg-surface-container-lowest'
    );
    next = next.replace(
      /<section class="w-full py-space-xl/g,
      '<section class="vey-section w-full py-space-xl'
    );
    next = next.replace(
      /<div class="grid grid-cols-2 md:grid-cols-4 gap-space-md text-center divide-x-0">/,
      '<div class="hero-stats grid grid-cols-2 md:grid-cols-4 gap-x-space-md gap-y-space-sm text-center">'
    );
    next = next.replace(
      /(<span class="[^"]*)">12,000\+<\/span>/,
      '$1 vey-count" data-count-to="12000" data-suffix="+">12,000+</span>'
    );
    next = next.replace(
      /(<span class="[^"]*)">18 Aesthetics<\/span>/,
      '$1 vey-count" data-count-to="18" data-suffix=" Aesthetics">18 Aesthetics</span>'
    );
  }

  // Catalogue filter panels need a landmark name for assistive technology.
  next = next.replace(/<aside\b([^>]*)>/gi, (full, attrs) => {
    if (!/lg:col-span-3/.test(attrs) || /\baria-label\s*=/.test(attrs)) return full;
    return `<aside${attrs} aria-label="Product filters">`;
  });

  return next;
}

function normalizeMainLandmarks(content) {
  const parts = content.split(/(<main\b[^>]*>|<\/main>)/gi);
  let depth = 0;
  let opened = 0;

  const normalized = parts.map((part) => {
    if (/^<main\b/i.test(part)) {
      opened += 1;

      if (opened === 1) {
        depth = 1;
        return /\bid\s*=/.test(part)
          ? part
          : part.replace(/^<main\b/i, '<main id="main-content" tabindex="-1"');
      }

      depth += 1;
      return part.replace(/^<main\b/i, "<section");
    }

    if (/^<\/main>$/i.test(part)) {
      depth = Math.max(0, depth - 1);
      return depth === 0 ? part : "</section>";
    }

    return part;
  });

  return normalized.join("");
}

function addRevealAttributes(content) {
  return content.replace(/<article\b(?![^>]*\bdata-reveal\b)/gi, "<article data-reveal");
}

function addCardLinks(content, page) {
  if (page !== "home") return content;

  return content.replace(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi, (full, attrs, inner) => {
    if (/<a\b/i.test(inner) || /<(button|input|select|form)\b/i.test(inner)) return full;

    const title = stripTags(
      (inner.match(/<h[234]\b[^>]*>([\s\S]*?)<\/h[234]>/i) || [])[1] || ""
    );
    const id = (attrs.match(/\bid="([^"]*)"/i) || [])[1] || "";

    let href = "style-edit.html";
    if (id === "men-archive") href = "men.html";
    else if (id === "women-edit") href = "women.html";

    let nextAttrs = attrs;
    if (!/\bclass="[^"]*\brelative\b/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\bclass="([^"]*)"/i, 'class="$1 relative"');
    }

    return `<article${nextAttrs}><a class="absolute inset-0 z-10" href="${href}" aria-label="${escapeHtml(title || "Explore this Veylora edit")}"></a>${inner}</article>`;
  });
}

function stripConflictingScripts(content) {
  let next = content;

  // The original design config is replaced by assets/js/tailwind-theme.js
  next = next.replace(
    /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?tailwind\s*\.\s*config[\s\S]*?<\/script>/gi,
    ""
  );

  // The men's page ships its own heart toggle; main.js owns that behaviour.
  next = next.replace(
    /document\.querySelectorAll\('button\[aria-label="Add to Wishlist"\]'\)/g,
    "document.querySelectorAll('button[aria-label=\"Add to Wishlist\"][data-native-heart]')"
  );

  // The women's page swaps the masthead logo for a remote mockup asset.
  next = next.replace(/\.includes\('IMAGE_6'\)/g, ".includes('veylora-luxury-monogram-logo')");

  // The empty-search mockup ships a second controller for clear / reset /
  // relaxation chips. main.js owns those behaviours so state stays coherent
  // across every page and the chips can expose aria-pressed.
  next = next.replace(
    /<script>\s*\/\/ Simple client-side micro-interactions[\s\S]*?<\/script>/gi,
    ""
  );

  return next;
}

/* --------------------------------------------------------------------------
   Link repairs: every call to action must lead somewhere real
   -------------------------------------------------------------------------- */
const PAGE_LABELS = {
  home: "home",
  men: "men",
  women: "women",
  clothing: "clothing",
  footwear: "footwear",
  accessories: "accessories",
  aesthetics: "aesthetics",
  trending: "trending",
  "the-style-edit": "the-style-edit"
};

const categoryHref = (text) => {
  const value = ` ${text.toLowerCase()} `;
  if (/\bwomen'?s?\b|\bwoman\b|\bwomenswear\b/.test(value)) return "women.html";
  if (/\bmen'?s?\b|\bman\b|\bmenswear\b/.test(value)) return "men.html";
  if (/\bfootwear\b|\bshoes?\b|\bsneakers?\b|\bboots?\b|\bloafers?\b|\bsandals?\b|\bheels?\b/.test(value)) return "footwear.html";
  if (/\baccessor(?:y|ies)\b|\bjewell?ery\b|\bwatches?\b|\bhorology\b|\bbags?\b|\bbelts?\b|\bscar(?:f|ves)\b|\bsunglasses\b/.test(value)) return "accessories.html";
  if (/\bclothing\b|\bapparel\b|\bgarments?\b|\btailoring\b|\bknitwear\b|\bcoats?\b|\bjackets?\b|\btrousers?\b|\bdress(?:es)?\b/.test(value)) return "clothing.html";
  if (/\baesthetics?\b|\bmoods?\b|\barchetypes?\b/.test(value)) return "aesthetics.html";
  if (/\btrending\b|\bviral\b|\bpulse\b/.test(value)) return "trending.html";
  if (/\bstyle edit\b|\beditorial\b|\bdispatch(?:es)?\b|\bjournal\b|\bguides?\b/.test(value)) return "style-edit.html";
  return null;
};

const exactHref = (label) => {
  const key = label.toLowerCase().replace(/\s+/g, " ").trim();
  const map = new Map([
    ["home", "index.html"],
    ["all collections", "clothing.html"],
    ["all clothing", "clothing.html"],
    ["search archive", "search.html"],
    ["explore all dispatches", "style-edit.html"],
    ["discovery archive", "index.html"],
    ["all men's", "men.html"],
    ["all womens", "women.html"],
    ["view all 12 aesthetic edits", "aesthetics.html"],
    ["view curation ↗", "aesthetics.html#archetype-1"]
  ]);
  return map.get(key) || null;
};

function repairLinks(content, page) {
  let next = content;

  // Homepage editorial gateways now open their proper archives.
  next = next.replace(/href="#men-archive"/gi, 'href="men.html"');
  next = next.replace(/href="#women-edit"/gi, 'href="women.html"');

  next = next.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs, inner, offset) => {
    if (!/\bhref\s*=\s*"#"/i.test(attrs)) return full;
    if (/\bdata-soon\b/i.test(attrs)) return full;

    const plain = stripTags(inner);
    const aria = attrValue(attrs, "aria-label");
    const alt = attrValue(inner, "alt");
    const label = [plain, aria, alt].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    const lowLabel = label.toLowerCase();

    // Nearest editorial heading gives product / mood context for the link.
    const before = content.slice(Math.max(0, offset - 3400), offset);
    const headings = [...before.matchAll(/<h[234]\b[^>]*>([\s\S]*?)<\/h[234]>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    const contextHeading = headings.length ? headings[headings.length - 1] : "";

    const isAmazon = /amazon/i.test(label);
    let href = null;
    let extraAttrs = "";

    if (isAmazon) {
      const query = contextHeading || (plain && !/amazon/i.test(plain) ? plain : "curated luxury fashion");
      href = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
      extraAttrs = ' target="_blank" rel="noopener noreferrer sponsored"';
    } else {
      href = exactHref(plain) || exactHref(label);
    }

    if (!href && /^explore\b/i.test(plain) && /archive/i.test(plain)) {
      const query = contextHeading || plain;
      href = `search.html?q=${encodeURIComponent(query.slice(0, 140))}`;
    }

    if (!href) {
      const detected = categoryHref(`${label} ${contextHeading}`);
      if (detected) href = detected;
    }

    if (!href && page === "men" && /\b(overshirts|heavy knits|tailored trousers|horology|leather boots|minimalist hoodies|grooming)\b/i.test(label)) {
      href = "men.html";
    }

    if (!href) {
      const query = contextHeading || plain || aria || alt || "curated fashion";
      href = `search.html?q=${encodeURIComponent(query.slice(0, 140))}`;
    }

    let repairedAttrs = attrs
      .replace(/\bhref\s*=\s*"#"/i, `href="${href}"`)
      .replace(/\s(target|rel)\s*=\s*"[^"]*"/gi, "");

    repairedAttrs = `${repairedAttrs}${extraAttrs}`;

    return `<a${repairedAttrs}>${inner}</a>`;
  });

  // Any residual dead link becomes a graceful placeholder rather than a jump.
  next = next.replace(/<a\b([^>]*)\bhref\s*=\s*"#"\s*([^>]*)>/gi, (full, before, after) => {
    if (/\bdata-soon\b/i.test(full)) return full;
    return `<a${before}href="#" data-soon="An upcoming Veylora edit"${after}>`;
  });

  // Commerce leaves the editorial site in a new tab, cleanly.
  next = next.replace(/<a\b([^>]*href\s*=\s*"https:\/\/www\.amazon\.in[^"]*"[^>]*)>/gi, (full, attrs) => {
    if (/\btarget\s*=/i.test(attrs)) return full;
    return `<a${attrs} target="_blank" rel="noopener noreferrer sponsored">`;
  });

  return next;
}

/* --------------------------------------------------------------------------
   Page-specific enrichment
   -------------------------------------------------------------------------- */
function enrichPage(content, page) {
  let next = content;

  if (page.output === "search.html") {
    next = next.replace(
      /<input class="w-full bg-surface-container-high/,
      '<input id="page-search-input" class="w-full bg-surface-container-high'
    );
    next = next.replace(
      /<span class="text-primary font-bold">QUERY: ([\s\S]*?)<\/span>/,
      '<span class="text-primary font-bold" data-query-chip>QUERY: $1</span>'
    );
  }

  if (page.output === "search-empty.html") {
    // Five columns at 1024px leaves each card too narrow. Three columns at
    // tablet width, five only when there is room on a wide desktop.
    next = next.replace(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6",
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6"
    );

    // The mockup hard-codes the query in the breadcrumb and diagnostic copy.
    // Mark both so main.js can replace them with the real ?q= value.
    next = next.replace(
      /<span class="text-primary font-semibold">QUERY: ([\s\S]*?)<\/span>/,
      '<span class="text-primary font-semibold" id="breadcrumb-query">QUERY: $1</span>'
    );
    next = next.replace(
      /<span class="text-primary italic">("[\s\S]*?")<\/span>/,
      '<span class="text-primary italic" data-query-quote>$1</span>'
    );

    // The secondary action was a dead <button>. Point it at a real archive.
    next = next.replace(
      /<button\b([^>]*)>(\s*<span>CATALOG INDEX<\/span>[\s\S]*?)<\/button>/i,
      '<a href="accessories.html"$1>$2</a>'
    );
    next = next.replace(
      /<button\b([^>]*)>(\s*<span>RE-SCAN CATALOG<\/span>)/i,
      '<button data-rescan$1>$2'
    );

    // Two large actions cannot share a 320–375px row without wrapping.
    // Stack them on phones and centre each label.
    next = next.replace(
      '<div class="flex items-center gap-3 shrink-0">',
      '<div class="search-empty-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">'
    );

    // The design's page padding belongs on the content wrapper, not on the
    // main landmark, so rounded sections can bleed to the page gutter.
    next = next.replace(
      /<main class="([^"]*)"([^>]*)><div class="flex flex-col w-full">/,
      (full, classes, attrs) => {
        const cleaned = classes.replace(/\s*\bpx-margin\b\s*/, " ").replace(/\s+/g, " ").trim();
        return `<main class="${cleaned}"${attrs}><div class="flex flex-col w-full px-margin">`;
      }
    );
  }

  return next;
}

/* --------------------------------------------------------------------------
   Compose
   -------------------------------------------------------------------------- */
let composed = 0;

for (const page of pages) {
  const sourceFile = path.join(assetsDir, page.source, "code.html");
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Missing source design: ${sourceFile}`);
  }

  let content = extractBody(read(sourceFile));
  content = stripConflictingScripts(content);
  content = repairLinks(content, page.page);
  content = enrichPage(content, page);
  content = applyResponsivePass(content, page.page);
  content = repairImages(content);
  content = addCardLinks(content, page.page);
  content = addRevealAttributes(content);
  content = normalizeMainLandmarks(content);

  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth dark">
<head>
${headPartial
  .replaceAll("{{TITLE}}", escapeHtml(page.title))
  .replaceAll("{{DESCRIPTION}}", escapeHtml(page.description))}
</head>
<body data-page="${page.page}" class="bg-background text-on-surface font-body-md antialiased selection:bg-primary selection:text-on-primary">
${overlaysPartial}
${headerPartial}
${content.trim()}
${footerPartial}
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;

  write(path.join(frontendDir, page.output), html);
  composed += 1;
  console.log(`  ✓ ${page.output.padEnd(16)} ← assets/${page.source}/code.html`);
}

console.log(`\nComposed ${composed} pages inside /frontend.`);
