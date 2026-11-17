---
name: Dark Editorial Luxury Discovery
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393b'
  surface-container-lowest: '#0d0e10'
  surface-container-low: '#1b1c1e'
  surface-container: '#1f2022'
  surface-container-high: '#292a2c'
  surface-container-highest: '#343537'
  on-surface: '#e3e2e5'
  on-surface-variant: '#d0c5b7'
  inverse-surface: '#e3e2e5'
  inverse-on-surface: '#303033'
  outline: '#998f82'
  outline-variant: '#4d463b'
  surface-tint: '#e1c290'
  primary: '#e2c391'
  on-primary: '#402d08'
  primary-container: '#c5a878'
  on-primary-container: '#513d17'
  inverse-primary: '#725b32'
  secondary: '#c6c6cb'
  on-secondary: '#2f3035'
  secondary-container: '#4a4b50'
  on-secondary-container: '#bbbbc1'
  tertiary: '#c5c7cf'
  on-tertiary: '#2d3037'
  tertiary-container: '#aaacb4'
  on-tertiary-container: '#3d4047'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#fedeaa'
  primary-fixed-dim: '#e1c290'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#58431c'
  secondary-fixed: '#e2e2e8'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1c20'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#e1e2ea'
  tertiary-fixed-dim: '#c4c6ce'
  on-tertiary-fixed: '#191c21'
  on-tertiary-fixed-variant: '#44474d'
  background: '#121315'
  on-background: '#e3e2e5'
  surface-variant: '#343537'
typography:
  headline-hero:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.15em
  label-caps-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.18em
  metadata:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the ethos of quiet luxury, high-end editorial curation, and tactile object appreciation. Designed for discerning shoppers seeking elevated everyday essentials, the visual language marries the gravitas of European fashion periodicals with the seamless discovery mechanics of digital commerce.

### Brand Personality & Philosophy
- **Restrained Opulence:** Luxury communicated through spatial breathing room, disciplined typography, and precise gold linework rather than heavy ornamentation.
- **Curated Object Obsession:** The discovery experience treats items as sculptural artifacts. Adhering strictly to a no-human visual doctrine, visual assets are limited to high-detail flat-lays, product photography, leather goods, footwear, precision timepieces, folded cashmere, and material macro-textures.
- **Editorial Authority:** Confident, serif-driven headlines paired with architectural, wide-tracked sans-serif metadata.

### Design Movement
The aesthetic synthesizes **Dark Haute Couture Editorial** and **Modern Architectural Minimalism**:
- Deep, light-absorbing noir surfaces layered with crisp, hairline graphite borders (1px) and selective champagne gold highlights.
- Orbiting circular motif geometries derived from luxury horology and astronomical astrolabes, subtly framing card corners and badge containers.
- Transparent affiliate mechanics for discovery, presenting outbound commerce transitions with high-trust dignity and polished tactile micro-interactions.

## Colors

The palette relies on a tonal hierarchy of dark values, punctuated by subtle metallic champagne gold and softened ivory text to eliminate harsh visual glare on dark screens.

### Palette Architecture
- **Canvas / Deep Black (`#090A0C`):** The primary environment ground. Absorbs ambient light and allows neutral product photography to command attention.
- **Surface / Charcoal (`#17191D`):** Background layer for cards, sticky sidebars, header bars, and modal sheets.
- **Border & Divide / Graphite (`#24262B`):** Structural hairlines, dividing lines, card outlines, and base element separations.
- **Hover & Interaction / Gunmetal (`#292C32`):** Interactive resting states, hovered chip surfaces, range slider track fills, and input well backgrounds.
- **Accent / Champagne Gold (`#C5A878`):** Restrained focal points: circular badges, active tab underlines, focal CTA accents, active rating stars, and outbound arrow indicators.
- **Text Primary / Warm Ivory (`#EEECE6`):** Editorial headlines, card titles, key values, offering contrast without the stark severity of pure white.
- **Text Secondary / Muted Taupe (`#A69A89`):** Metadata, category tags, filter count badges, editorial subtitles, breadcrumbs, and legal affiliate disclaimers.

### Functional States
- **Card Border Normal:** `1px solid #24262B`
- **Card Border Active / Featured:** `1px solid rgba(197, 168, 120, 0.4)` with an ambient gold diffusion glow.
- **Affiliate Tag Glow:** `rgba(197, 168, 120, 0.12)` ambient backdrop for third-party discovery badges.

## Typography

The typographic hierarchy bridges classic haute horlogerie editorial spreads and clean digital filtering ergonomics.

### Type Pairings
- **Display & Headings:** `Playfair Display` brings literary poise, transitional serif contrast, and classic poise. Used for collection titles, product names, editorial pull quotes, and major category headings.
- **Interface, Body & Controls:** `Plus Jakarta Sans` provides geometric clarity in small sizes, optimal legibility within multi-level filter sidebars, and crisp rendering against deep charcoal backdrops.

### Rules of Usage
- **Uppercase Kerning:** All navigation links, subsection labels, category eyebrow headers, button titles, and filter accordion titles must be set in uppercase with tracking between `0.15em` and `0.18em`.
- **Editorial Subtitles:** Rendered in `Muted Taupe (#A69A89)`, providing subtle contrast beneath `Warm Ivory (#EEECE6)` serif headers.
- **Numbers & Prices:** Currency symbols, pricing figures, and item inventory tallies utilize tabular lining figures within `Plus Jakarta Sans` for clean vertical alignment.

## Layout & Spacing

The layout balances architectural discipline with catalog discovery efficiency. It utilizes a desktop 12-column asymmetric grid split between a sticky editorial control panel and a responsive product grid.

### Desktop Structure (1200px+)
- **Total Canvas Max Width:** 1680px with centered margin offset.
- **Sidebar Allocation:** 3 columns (approx. 280px–320px fixed-fluid width), sticky positioned `top: 2rem`, housing accordion filters, price sliders, and material chips.
- **Product Gallery Allocation:** 9 columns, dynamically switching between a 3-column and 4-column item grid with 24px (`1.5rem`) gutters.
- **Page Canvas Margins:** 40px (`2.5rem`) horizontal margins.

### Tablet Structure (768px - 1199px)
- **Grid Layout:** 2-column or 3-column product flow with 20px gutters.
- **Filter Panel:** Transforms into a top horizontal drawer or sticky bottom sheet triggered via a segmented "Filters & Refinements" button.
- **Page Canvas Margins:** 24px (`1.5rem`).

### Mobile Breakpoint (<768px)
- **Grid Layout:** Single column (curated editorial spotlight) or 2-column staggered layout with 12px gutters.
- **Page Canvas Margins:** 16px (`1rem`).
- **Touch Targets:** Minimum 44px vertical height for all chip selectors and clickable filters.

### Rhythmic Cadence
Components use the 4px baseline system. Vertical space between card sections (`space-xl`) provides breathing room reminiscent of print luxury magazines.

## Elevation & Depth

Visual hierarchy is maintained through subtle tonal gradation and micro-borders rather than intrusive drop shadows. Surfaces appear as matte lacquered materials set under diffused light.

### Depth Hierarchy
1. **Level 0 (Base Canvas):** `#090A0C` (Deep Black) – Completely flat, absorbs background distraction.
2. **Level 1 (Card & Section Surfaces):** `#17191D` (Charcoal) – Outlined with `1px solid #24262B`. No shadow in resting state.
3. **Level 2 (Hovered Cards & Interactive Controls):** `#17191D` with subtle champagne edge illumination:
   - Outline: `1px solid rgba(197, 168, 120, 0.35)`
   - Box Shadow: `0 8px 32px -8px rgba(0, 0, 0, 0.8), 0 0 16px -4px rgba(197, 168, 120, 0.08)`
4. **Level 3 (Sticky Navigation & Filter Drawers):** Backdrop-filter glassmorphism:
   - Background: `rgba(23, 25, 29, 0.88)`
   - Filter: `blur(16px)`
   - Border-bottom: `1px solid #24262B`
5. **Level 4 (Modals & Outbound Discovery Drawers):** `#17191D` supported by deep inset shadows:
   - Box Shadow: `0 24px 64px -12px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(197, 168, 120, 0.25)`

## Shapes

The geometric vocabulary balances architectural precision with organic curves, drawing inspiration from high-end packaging and fine watchmaking.

### Corner Radii
- **Level 1 (Soft):** Product cards, input wells, filter accordions, and dropdown menus utilize a crisp `4px` (`0.25rem`) radius. This retains a refined editorial identity without feeling sterile.
- **Pill Exception (Badges & Chips):** Category filter chips, affiliate status badges, and price tags utilize a full pill radius (`9999px`) to visually soften interactive elements against the rectangular geometry of product images.

### Emblem Geometric Accents
- Subtle circular hairline geometry (echoing the brand's celestial ring motif) is applied as faint SVG overlays (`rgba(197, 168, 120, 0.08)`) within hero banners, category divider endpoints, and empty-state placeholders.

## Components

### 1. Product Discovery Card
- **Structure:**
  - Aspect ratio 4:5 image container on `#17191D` charcoal base.
  - Image rules: Strict studio flat-lay, accessory crop, texture closeup, or folded apparel on neutral dark or raw stone backgrounds. No human models.
  - Hover state: Sub-millimeter smooth scale transition (`transform: scale(1.03)` over `450ms cubic-bezier(0.16, 1, 0.3, 1)`).
- **Metadata Stack:**
  - Micro-eyebrow category in `label-caps-sm` (`#A69A89`).
  - Item Title in `headline-sm` (`#EEECE6`).
  - Price indicator in `Plus Jakarta Sans` Medium (`#EEECE6`).
- **Affiliate Target Action:**
  - Discreet, elegant action bar anchored at the bottom: "DISCOVER ON AMAZON" button accompanied by an angled external link vector icon (`↗`).

### 2. Buttons
- **Primary Affiliate CTA ("View on Amazon.in"):**
  - Background: Solid Champagne Gold (`#C5A878`).
  - Text: `#090A0C` (Deep Black), font `label-caps-lg`, bold weight.
  - Micro-details: Subtle sheen hover animation; active press scale `0.98`. Includes an unobtrusive Amazon external link icon.
- **Secondary / Filter Reset Button:**
  - Background: Transparent.
  - Border: `1px solid #24262B`.
  - Text: Warm Ivory (`#EEECE6`), transitions to Champagne Gold on hover.
  - Hover: Background `#292C32`, Border `rgba(197, 168, 120, 0.3)`.
- **Text Action:**
  - Muted Taupe uppercase text with an animated 1px gold underline that expands from center on hover.

### 3. Filter Chips & Pill Selectors
- **Default State:**
  - Background: `#17191D`.
  - Border: `1px solid #24262B`.
  - Text: `#A69A89` in `label-caps-sm`.
  - Padding: 6px 14px.
- **Selected State:**
  - Background: `#292C32`.
  - Border: `1px solid #C5A878`.
  - Text: `#EEECE6`.
  - Suffix Badge: Tiny count dot or numerical counter wrapped in `#17191D`.

### 4. Sticky Editorial Filter Accordion
- **Container:** Left sidebar, background transparent, separated by hairline dividers (`1px solid #24262B`).
- **Accordion Header:** Clean serif or tracking-wide sans text with an ultra-thin expand/collapse plus-minus icon (`+` / `−`) colored `#C5A878`.
- **Range Sliders:**
  - Track: 2px height, `#24262B`.
  - Active Fill: `#C5A878`.
  - Thumb: 14px solid circle in `#EEECE6` with a `2px solid #C5A878` border ring and subtle dark drop shadow.
- **Checkboxes:**
  - Square 16px with `2px` roundedness.
  - Background `#17191D`, border `1px solid #24262B`.
  - Checked state: `#C5A878` fill with `#090A0C` checkmark mark.

### 5. Input Fields (Search & Newsletter)
- **Container:** `#17191D` fill with inset 1px border `#24262B`.
- **Typography:** `#EEECE6` body text; placeholder in `#A69A89`.
- **Focus State:** Border shifts smoothly to `#C5A878`; soft focus halo `0 0 0 1px #C5A878`.

### 6. Affiliate Transparency Notice
- **Presentation:** A refined footer and card-level disclaimer.
- **Styling:** Set in `metadata` size, tracking `0.04em`, colored `#A69A89`.
- **Copy Standard:** "Curated independently. As an Amazon Associate, we earn from qualifying purchases at no additional cost to you."