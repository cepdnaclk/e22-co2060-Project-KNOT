---
name: KNOT Technical
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae1'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fb'
  surface-container: '#ecedf5'
  surface-container-high: '#e6e8ef'
  surface-container-highest: '#e0e2ea'
  on-surface: '#191c21'
  on-surface-variant: '#414752'
  inverse-surface: '#2d3036'
  inverse-on-surface: '#eff0f8'
  outline: '#717783'
  outline-variant: '#c1c7d3'
  surface-tint: '#005fac'
  primary: '#005da8'
  on-primary: '#ffffff'
  primary-container: '#2276cb'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#8b4c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#af6100'
  on-tertiary-container: '#fffbff'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004884'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#ffb779'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6c3a00'
  background: '#f8f9ff'
  on-background: '#191c21'
  surface-variant: '#e0e2ea'
  background-light: '#f6f7f8'
  background-dark: '#121920'
  success: '#10b981'
  warning: '#f59e0b'
  info: '#3b82f6'
  slate-text: '#0f172a'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-xs:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
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
  container-max: 1280px
  gutter: 1.5rem
  section-gap: 2rem
  card-padding: 1.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
---

## Brand & Style
The brand personality is **Technical, Reliable, and Precise**. It is designed for operational environments where clarity and efficiency are paramount. The aesthetic follows a **Modern Corporate** approach with subtle **Technical** accents (like the Space Grotesk display font and animated status indicators).

The goal is to evoke a sense of controlled urgency—providing clear data visualization and actionable tasks without overwhelming the user. The style utilizes high-clarity information density, structured data grids, and a systematic color-coding for status and priority.

## Colors
The palette is centered around a trustworthy **Azure Primary (#2d7dd2)**. It uses a neutral slate scale for typography and borders to maintain a professional, clean environment.

- **Status Colors:** Use specific semantic hues for high-glanceability: Red for High Priority/Critical, Orange for Open/Pending, Blue for In-Progress/Medium, and Emerald for Resolved/Low.
- **Surface Strategy:** In light mode, use `#ffffff` for cards and `#f6f7f8` for the global background to create a subtle separation of layers.
- **Translucency:** Utilize the primary color at 10% opacity (`#2d7dd21a`) for soft backgrounds on chips, buttons, and hover states.

## Typography
The system uses **Space Grotesk** across all roles to lean into its technical, geometric character. 

- **Hierarchy:** Large display titles use a bold weight with tight letter-spacing. 
- **Data Density:** Table headers and small labels use an uppercase style with increased letter-spacing to improve readability at small sizes.
- **Contextual weights:** Use `font-bold` (700) for primary identifiers (like locations) and `text-slate-500` for secondary metadata to create clear vertical rhythm in lists.

## Layout & Spacing
The layout employs a **Fixed Grid** approach for the main content area, centered with a maximum width of 1280px and responsive horizontal margins (16px on mobile, 32px on desktop).

- **Grid System:** Use a standard 12-column grid for complex layouts. Dashboard widgets should span 3 columns on desktop, 6 on tablet, and 12 on mobile.
- **Vertical Rhythm:** A consistent 32px (2rem) gap is used between major page sections (Header, Stats, Main Table, Charts).
- **Component Spacing:** Tables use a comfortable 16px vertical padding per row to handle multi-line text blocks without feeling cramped.

## Elevation & Depth
Depth is achieved through **Low-contrast Outlines** and **Soft Ambient Shadows**. 

- **Surfaces:** All container elements (Cards, Nav, Modals) use a 1px border colored with a 10% opacity version of the Primary color (`border-primary/10`).
- **Shadows:** Use a single "Shadow-SM" (light blur, 1-2px offset, very low opacity) to lift cards slightly off the background without creating a heavy "stacked" look.
- **Interaction:** Hover states on interactive rows or cards should use a primary tint transition (`bg-primary/5`) rather than an elevation increase.

## Shapes
The shape language is **Soft yet Structured**. 

- **Base Radius:** 0.25rem (4px) for small components like inputs and select menus.
- **Standard Radius:** 0.5rem (8px) for primary buttons and secondary containers.
- **Card Radius:** 0.75rem (12px) for main dashboard widgets and data containers.
- **Full Radius:** Use 9999px for status chips and notification badges to create a distinct visual contrast from the rectangular grid.

## Components
- **Buttons:** Primary buttons are solid `#2d7dd2` with white text. Secondary buttons use the `bg-primary/10` tint with primary-colored text. 
- **Chips (Status):** Highly rounded (pill-shaped) with low-saturation backgrounds and high-saturation text. Example: `bg-red-100` background with `text-red-700`.
- **Inputs & Selects:** Use a "soft-ghost" style—light grey backgrounds (`#f6f7f8`), no borders unless focused, and 4px rounded corners.
- **Tables:** Feature a light grey header background (`#f8fafc`) and thin dividers. The last column (Actions) is typically right-aligned for clean scanning.
- **Data Visuals:** Use progress bars with `h-2` and full rounding. Incorporate pulsing animations for "Live" or "Active" indicators on maps.