# AutoFill AI - Styles Guideline

This document outlines the styling conventions and design system used throughout the AutoFill AI PDF project. Adhering to these guidelines ensures consistency across the application.

## 1. Technology Stack

- **Framework**: React / Next.js
- **Styling Engine**: Tailwind CSS (currently loaded via CDN in `app/layout.tsx`)
- **Fonts**: Google Fonts

## 2. Typography

- **Primary Font Family**: **Inter**
- **Available Weights**: Light (300), Regular (400), Medium (500), Semi-Bold (600), Bold (700).
- **Body Text**:
  - Main text color: `text-slate-900`
  - Secondary/Muted text: `text-slate-600` or `text-slate-500`
  - Utilities: `antialiased` applied to the `body` for smoother font rendering.
- **Headings & Branding**: 
  - Brand titles often use gradient text: `bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600`.

## 3. Color Palette

The project relies on a tailored subset of Tailwind's default color palette.

### Backgrounds
- **App Background**: `bg-slate-50` (used for the main application canvas).
- **Surface / Card Background**: `bg-white` (used for headers, modals, cards).
- **Secondary Surface**: `bg-slate-100` (used for secondary buttons, hover states).

### Primary Colors
- **Brand/Primary**: Indigo (`indigo-600` to `indigo-700`).
- **Accent**: Violet (used alongside Indigo for gradients).
- **Selection**: `selection:bg-indigo-100 selection:text-indigo-700`

### Status & Feedback Colors
- **Danger / Destructive**: Red (`bg-red-50`, `text-red-600`).
- **Warning**: Amber (`bg-amber-600`).

### Borders
- **Standard Border**: `border-slate-200`.

## 4. Layout & Spacing

- **Main Container Constraints**: Standardized maximum width and horizontal padding.
  - Utility Classes: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Flexbox**: Extensively used for aligning elements (e.g., `flex items-center justify-between` or `flex items-center gap-2`).

## 5. UI Components Guidelines

### Buttons
Buttons follow a strict variant-based design system found in `app/shared/components/Button.tsx`:

- **Base Styles**: `inline-flex items-center justify-center font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2`
- **Primary**: Solid Indigo (`bg-indigo-600 text-white hover:bg-indigo-700 shadow-md`).
- **Secondary**: Light Slate (`bg-slate-100 text-slate-800 hover:bg-slate-200`).
- **Outline**: White with Slate border (`border-slate-200 bg-white text-slate-600 hover:bg-slate-50`).
- **Ghost**: Transparent with hover effect (`hover:bg-slate-100 text-slate-600`).
- **Danger**: Soft Red background (`bg-red-50 text-red-600 hover:bg-red-100`).
- **Warning**: Solid Amber (`bg-amber-600 text-white`).

### Shapes & Elevation
- **Border Radius**: Most interactive elements and containers use `rounded-lg` (8px).
- **Shadows**:
  - Interactive elements use `shadow-sm` or `shadow-md` in default states.
  - Hover states sometimes elevate to `shadow-lg`.

## 6. General Best Practices

- **Tailwind Utility Classes**: Keep styling logic within the `className` attribute using Tailwind utilities rather than inline styles or custom CSS files whenever possible.
- **Responsive Design**: Use Tailwind's `sm:`, `md:`, `lg:` prefixes to adjust layouts for different screen sizes. Mobile-first rules apply.
- **Accessibility (a11y)**: Ensure focus states (`focus:ring-2`, `focus:outline-none`) are maintained on interactive elements for keyboard navigation. Use sufficient color contrast (e.g., `text-slate-900` on `bg-slate-50`).
