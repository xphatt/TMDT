---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/globals.css","app/components/TeaShop.tsx"]
---

# Surface brief: storefront

- Scope: `app/page.tsx` and the storefront flow it owns.
- Mode: Persuade in the first viewport, then Operate for catalogue, customisation, cart and checkout.
- Audience and job: Vietnamese customers choosing a drink quickly on touch devices, confirming every option and completing a simulated order without ambiguity.
- Primary action: `Đặt ngay` opens the catalogue; the persistent cart action reveals item count and total.
- Proof/content: realistic mock drinks, ingredient descriptions and explicit simulated-payment copy. No invented testimonials, delivery metrics or commercial proof.
- Approved comp: `.impeccable/mocks/homepage-comp-b.png`.
- Chosen direction: modern Vietnamese tea tray. A horizontal jade ingredient counter anchors the hero; cup-ring lines and sparse pearl dots provide quiet brand texture.
- Memorable moment: the hero drink rises through the jade counter while category labels sit along its lower edge like physical tea-tray markers.
- Responsive strategy: at under 768px the hero becomes one column, product stage stays above category controls, controls remain at least 44px tall and checkout becomes a linear flow.
- Constraints: light theme, cool off-white, deep jade and tea green, one mandarin CTA, no purple gradients, glassmorphism, heavy shadows or repeated equal-card sections.

## Comp inventory

| Ingredient | Commitment | Medium |
| --- | --- | --- |
| Navigation | Single line, wordmark left, concise links, cart state right | Semantic HTML and CSS |
| Hero copy | Large rounded display type, two-line maximum, orange primary action | Semantic HTML and CSS |
| Product stage | One tall brown-sugar milk tea crossing the jade counter boundary | Generated raster with transparent or clean light background |
| Ingredient counter | Wide jade field, tea/pearls/milk facts grouped without card chrome | Semantic HTML, CSS and raster product accents |
| Category tray | Four touch targets integrated into one horizontal rail | Semantic buttons and CSS |
| Product shelf | One wide featured item plus smaller supporting items, varied widths | Generated raster crops, semantic HTML and CSS |
| Secondary imagery | Tea leaves, jasmine, ceramic pot and pearls on jade stone | Generated raster |
| Social card | Cohesive 1200x630 brand card with exact Vietnamese title | Generated raster |
| CTA | Mandarin fill, pill geometry, visible focus and pressed feedback | Semantic button and CSS |

## Component grammar

- Radii: 16px for product surfaces, 10px for fields, full-pill only for buttons and filter chips.
- Lines: 1px jade-tinted borders, no thick side accents.
- Elevation: rare, soft green-tinted offset shadows only for sticky navigation and cart drawer.
- Type ramp: display 42-72px desktop and 40-48px mobile; section heading 30-44px; body 16-18px; labels 14-16px.
- Motion: one staged hero entrance and responsive drawer transitions; all disabled under reduced motion.
- Browser surfaces: jade selection, orange focus ring, themed scrollbar and underlines.

## Direction contract

THESIS: A modern Vietnamese tea tray turns browsing into choosing ingredients, refusing the generic centered hero and repeated equal-card catalogue.
OWN-WORLD: Cool off-white paper, deep jade counter fields, tea green lines, one mandarin action color, cup rings and sparse pearl dots; rounded display lettering and quiet utility controls.
STORY: Meet the fresh drink, scan ingredients, choose a category, customise a cup, review the cart and confirm a simulated order.
FIRST VIEWPORT: One-line nav above a 42/58 split; copy sits left, a tall drink breaks into the jade counter right, categories lock to the counter edge and the orange action stays visible.
FORM: Tea-tray counter direction, candidate 5, seed 3ea9c562.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
