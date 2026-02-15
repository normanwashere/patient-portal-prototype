---
description: Living checklist of past mistakes and missed patterns — MUST be reviewed before implementing any feature or making changes to avoid repeating errors.
---

# Lessons Learned — Pre-Implementation Checklist

> **When to use:** Read this file BEFORE implementing any feature, fix, or refactoring. Each item below is a real mistake that was made and caught by the user. Treat every item as a mandatory check.

---

## 1. React State vs. URL Synchronization

**What went wrong:** `AppointmentBooking.tsx` used `useState` lazy initializers to read URL query params, but when the URL changed (e.g., toggling sidebar links), the component didn't remount and stale state persisted.

**Rule:** If a component reads from `location.search`, `location.state`, or URL params:
- [ ] Add a `useEffect` that watches the relevant URL part (`location.search`, `location.pathname`, etc.)
- [ ] Reset ALL dependent state when the URL changes, not just the primary state
- [ ] Test by navigating to the same route with different params via sidebar/links

---

## 2. CSS Float Causes Click-Through Issues

**What went wrong:** `.desktop-back-wrapper` used `float: left` to position the back button inline with page titles. The floated element was overlapped by subsequent content, making clicks unreliable.

**Rule:** Never use `float` for interactive elements:
- [ ] Use `display: flex` or `display: grid` for positioning
- [ ] Always add `position: relative; z-index: 10` to clickable elements that overlap other content
- [ ] Test that buttons are actually clickable after CSS changes, not just visually present

---

## 3. CSS Scope Leaking Between Pages

**What went wrong:** `Financial.tsx` used `className="profile-container"` which inherited Profile's 2-column desktop grid, breaking the Coverage page layout.

**Rule:** Every page must use its own container class:
- [ ] Never reuse another page's container class (e.g., `.profile-container`, `.dashboard-container`)
- [ ] Create a unique `.[pagename]-container` class for each page
- [ ] Check if the new class inherits any global rules that might break layout

---

## 4. Media Query Structure — Orphaned Braces

**What went wrong:** `.mobile-only` was supposed to be inside `@media (min-width: 769px)` but was outside due to an orphaned closing `}`. This made ALL mobile elements hidden globally.

**Rule:** After editing CSS media queries:
- [ ] Verify the brace count matches (every `{` has a corresponding `}`)
- [ ] Check that visibility classes (`.mobile-only`, `.desktop-only`) are inside their correct media query
- [ ] Run the app on both mobile and desktop viewports to verify elements show/hide correctly

---

## 5. `box-sizing: border-box` on Inputs

**What went wrong:** Search input in Medical History had `width: 100%` with padding, causing it to overflow its container because `box-sizing` wasn't set.

**Rule:** For any input/search element:
- [ ] Always add `box-sizing: border-box` to elements with `width: 100%` and padding
- [ ] Remove redundant inline padding wrappers if the parent container already handles padding
- [ ] Test on mobile widths (375px) where overflow is most visible

---

## 6. Sidebar Link → Component State Mismatch

**What went wrong:** Sidebar "Book Teleconsult" used `?type=teleconsult` as a query param, but the component only read from `location.state.type`. The fix required checking both sources.

**Rule:** When adding sidebar/navigation links:
- [ ] Verify the target component reads from the same source the link writes to (query params vs. state)
- [ ] Prefer query params for sidebar links (they're bookmarkable and shareable)
- [ ] Always check `location.state` first, then fall back to `searchParams`

---

## 7. Mobile Navigation Consistency

**What went wrong:** Back button was removed from mobile header but no replacement was added in-page, leaving users trapped on sub-pages with no way to go back.

**Rule:** When modifying navigation elements:
- [ ] If removing a nav element from one location, add a replacement elsewhere
- [ ] Mobile sub-pages MUST always have a back button (via `Layout.tsx` mobile-back-strip or in-page)
- [ ] Pillar pages (top-level tabs) should NOT show back buttons
- [ ] Test navigation on both mobile AND desktop after changes

---

## 8. Grid `!important` Overrides Create Duplicates

**What went wrong:** `Dashboard.css` had duplicated `@media` blocks both forcing `grid-template-columns: 1fr !important`, making it hard to change the mobile grid layout.

**Rule:** When editing grid/layout CSS:
- [ ] Search for duplicate media query blocks targeting the same selector
- [ ] Remove `!important` — fix specificity issues at the source instead
- [ ] After changing a grid rule, search for other rules that might override it

---

## 9. Desktop Layout Must Be Tested Too

**What went wrong:** Multiple issues (Coverage layout, back button clicks, consult toggle) were only caught when the user tested on desktop. Development focused primarily on mobile.

**Rule:** After any change:
- [ ] Test on desktop viewport (≥1024px) with sidebar visible
- [ ] Test on mobile viewport (≤768px) with bottom nav visible
- [ ] Specifically test interactive elements (buttons, links, toggles) on desktop
- [ ] Check that desktop grids don't have empty columns or misaligned sections

---

## 10. CSS `:first-of-type` / `:nth-child` Selectors Are Fragile

**What went wrong:** `.financial-container .finance-section:first-of-type` was used to swap grid columns, but the selector broke when the page structure changed slightly.

**Rule:**
- [ ] Avoid `:first-of-type` and `:nth-child` for layout-critical positioning
- [ ] Use explicit class names or `grid-area` names instead
- [ ] If you must use structural selectors, document which DOM structure they depend on

---

## Quick Pre-Flight Checklist

Before submitting any change, run through these:

```
□ Does any component read from URL params? → Add useEffect to sync
□ Did I change any CSS positioning? → Test clicks on desktop
□ Did I add/modify a container class? → Verify it's unique to this page
□ Did I edit a media query? → Count braces, test both viewports
□ Did I add an input with width:100%? → Add box-sizing: border-box
□ Did I change navigation? → Test back/forward on both mobile & desktop
□ Did I use !important? → Find and fix the specificity issue instead
□ Did I test on BOTH mobile AND desktop? → Do it now
```
