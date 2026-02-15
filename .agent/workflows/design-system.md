---
description: Design system rules for the patient portal prototype — governs layout, spacing, navigation, typography, grids, cards, and responsive behavior across all pages.
---

# Patient Portal Design System

## 1. Layout Architecture

### Desktop (≥769px)
- **Sidebar**: Fixed left, 280px wide, full viewport height
- **Main content wrapper**: `margin-left: 280px`, padding `2.5rem`
- **Content max-width**: `1200px`, centered with `margin: 0 auto`
- **Back button**: Floated left beside the page title (`.desktop-back-wrapper` with `float: left`). Never renders as a separate row.

### Mobile (≤768px)
- **Header**: Sticky top, 60px height, contains logo (left) + notification bell + profile icon (right)
- **No hamburger menu** on mobile — replaced by profile icon linking to `/profile`
- **No back button in mobile header** — back navigation on mobile is handled IN-PAGE (see Section 3)
- **Bottom tab bar**: Fixed bottom, 5 tabs: Home, Care, Community, Records, Coverage
- **Content padding**: `1.25rem 1rem` via `.app-main`
- **Bottom padding**: `80px` on `.main-content-wrapper` to clear the bottom nav

### Breakpoints
| Token | Value | Usage |
|-------|-------|-------|
| Mobile | `max-width: 768px` | Hide desktop elements, show mobile nav |
| Desktop | `min-width: 769px` | Show sidebar, hide mobile nav |
| Wide desktop | `min-width: 1024px` | Multi-column grids for content pages |

---

## 2. CSS Variables (from `index.css :root`)

### Colors
```
--color-primary: #DC602A (brand orange)
--color-secondary: #0d9488 (teal accent)
--color-background: #f8fafc
--color-surface: #ffffff
--color-text: #1e293b
--color-text-muted: #64748b
--color-border: #e2e8f0
```

### Spacing & Radii
```
--radius: 12px (cards, inputs)
--radius-lg: 16px (larger cards)
--radius-xl: 20px (hero sections)
--header-height: 64px
```

### Shadows
```
--shadow-sm: 0 1px 3px rgba(0,0,0,0.05) — cards at rest
--shadow-md: 0 4px 12px rgba(0,0,0,0.08) — cards on hover
--shadow-lg: 0 10px 30px rgba(0,0,0,0.1) — modals, floating elements
```

### Transitions
```
--transition-fast: 0.15s ease
--transition-normal: 0.25s ease
--transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 3. Navigation & Back Buttons

### Pillar Pages (no back button)
These are top-level destinations that correspond to bottom nav tabs:
```
/dashboard, /visits, /community, /health, /coverage, /profile, /apps, /, /appointments, /visits/consult-now
```
Defined in `pillarPaths` array in `Layout.tsx`.

### Sub-pages (show back button)
Any route NOT in `pillarPaths` shows a back button:
- **Desktop**: Floated circle button beside the page title (rendered in `Layout.tsx` inside `.app-main`)
- **Mobile**: Each sub-page component should render its own back button INSIDE the page content, using the page header pattern:

```tsx
// Mobile sub-page header pattern
<header className="page-header">
  <button className="mobile-back-btn" onClick={() => navigate(-1)}>
    <ChevronLeft size={20} />
  </button>
  <div className="header-text">
    <h2>Page Title</h2>
    <p className="page-subtitle">Optional subtitle</p>
  </div>
</header>
```

### Rules
- ❌ Never put a back button in the mobile sticky header bar
- ❌ Never trap users on a sub-page without a way to go back
- ✅ Desktop back button is rendered by `Layout.tsx` automatically
- ✅ Mobile back button is rendered by individual page components in their page-header

---

## 4. Page Headers

### Structure
Every page should have a consistent header:
```html
<header class="page-header">
  <div class="header-text">
    <h2>Page Title</h2>
    <p class="page-subtitle">Brief description</p>
  </div>
</header>
```

### Typography
- Page title (`h2`): `1.5rem` weight `800`, color `var(--color-text)`
- Subtitle: `0.875rem`, color `var(--color-text-muted)`
- Section heading (`h3`): `1rem` weight `700`

---

## 5. Grids & Cards

### Hub Pages (Care, Records)
Uses `.hub-grid` from `HubPage.css`:
- **Desktop**: `repeat(auto-fill, minmax(280px, 1fr))`, gap `1.5rem`
- **Mobile (≤600px)**: `repeat(2, 1fr)`, gap `0.75rem`
- Cards use the `<ServiceCard>` component

### Event Tiles (Community)
- **Mobile (≤640px)**: 2-column grid, event cards stack vertically (image on top, content below)
- **Desktop (≥1024px)**: 2-column grid for events, 3-column grid for featured cards
- Cards need adequate padding: minimum `0.75rem` inner padding
- Image thumbnails: `min-height: 100px` on mobile, `160px` on desktop

### Card Spacing Rules
| Element | Minimum padding |
|---------|----------------|
| Card inner padding | `1rem` |
| Grid gap (desktop) | `1rem–1.5rem` |
| Grid gap (mobile) | `0.75rem` |
| Card border-radius | `var(--radius)` = 12px |
| Card hover | `translateY(-2px)` + `box-shadow: var(--shadow-md)` |

---

## 6. Content Containers

### Standard Page Container
```css
.page-container {
  max-width: 800px;  /* Single-purpose pages */
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}
```

### Wide Page Container (dashboard, hub pages)
```css
.wide-container {
  max-width: 1200px;
  margin: 0 auto;
}
```

### Container max-widths by page type
| Page Type | Desktop max-width |
|-----------|------------------|
| Dashboard | 1200px |
| Hub pages (Care, Records) | 1200px |
| Coverage / Financial | 1200px |
| Profile | 960px |
| Appointments | 1200px |
| Detail pages | 800px |
| Booking flows | 640px |

---

## 7. Forms & Inputs

### Search Inputs
```css
.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem; /* Room for icon */
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.9rem;
  background: var(--color-surface);
}
```
- Always use `box-sizing: border-box`
- Search icon positioned absolute at `left: 0.75rem`
- Must not overlap with filter tabs below — add `margin-bottom: 1rem`

### Filter Pills / Tabs
- Horizontal scroll on mobile, wrapping on desktop
- Active state: solid background `var(--color-primary)`, white text
- Inactive: border `1px solid var(--color-border)`, transparent background
- Gap between pills: `0.5rem`
- Margin below search: `1rem`

---

## 8. Typography Scale

### Minimum Font Sizes
- **Body text**: 14px (0.875rem)
- **Small text / metadata**: 12px (0.75rem)
- **Badges, pills, labels**: 11px minimum enforced via `max()` in `index.css`
- **Nav labels**: 11px minimum

### Font Weights
```
400 — Body text
500 — Sub-labels
600 — Buttons, links
700 — Section headings, card titles
800 — Page titles (h2)
900 — Hero text only
```

---

## 9. Responsive Patterns

### Mobile-First Approach
1. Write base styles for mobile
2. Use `@media (min-width: 1024px)` for desktop enhancements
3. Never use `!important` unless overriding framework conflicts

### Common Grid Transformations
| Element | Mobile | Desktop |
|---------|--------|---------|
| Quick actions | `repeat(2, 1fr)` | `repeat(4, 1fr)` |
| Hub grid | `repeat(2, 1fr)` | `auto-fill, minmax(280px, 1fr)` |
| Event tiles | `repeat(2, 1fr)` vertical | `repeat(2, 1fr)` horizontal |
| Featured cards | Horizontal scroll | `repeat(3, 1fr)` grid |
| Coverage cards | Horizontal scroll | Stacked column |

---

## 10. Class Naming

### Visibility Classes (defined in `Layout.css`)
- `.desktop-only` — Hidden on mobile (`max-width: 768px`)
- `.mobile-only` — Hidden on desktop (`min-width: 769px`), lives inside the desktop media query

### Page-Specific Containers
Each page should have its own unique container class:
- ✅ `.dashboard-container`, `.community-container`, `.financial-container`
- ❌ Never reuse another page's container class (e.g. don't use `.profile-container` on Coverage page)

---

## 11. Event Detail Pages

### Mobile
- Full-width stacked layout: hero image → content → CTA
- Content padding: `1.5rem`
- Bottom padding: `160px` (for fixed CTA + bottom nav)

### Desktop (≥1024px)
- Side-by-side: hero image (40%) | content (60%)
- Hero image sticky, full height
- Content padding: `2.5rem 3rem`
- CTA fixed to bottom of content column

### Back Button
- Uses the global Layout.tsx desktop back button (floated beside title)
- Mobile: render own back button in `.detail-header`

---

## 12. Accessibility Checklist
- [ ] All interactive elements have `aria-label`
- [ ] Minimum tap target: 44×44px on mobile
- [ ] Color contrast: 4.5:1 minimum for text
- [ ] Font size floor: 11px minimum everywhere
- [ ] Focus states on all interactive elements
- [ ] Unique `id` attributes on form elements
