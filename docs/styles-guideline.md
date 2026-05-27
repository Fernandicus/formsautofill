# Style Guideline

This document serves as the central source of truth for the visual identity and interface design language of the project. It strictly separates design tokens (raw values) from their semantic applications (how they are used).

## 1. Visual Identity (Design Tokens)

### Color Palette

**Primitive Tokens (Raw Values)**
*   **Slate:** `50` (#f8fafc), `100` (#f1f5f9), `200` (#e2e8f0), `400` (#94a3b8), `500` (#64748b), `600` (#475569), `800` (#1e293b), `900` (#0f172a)
*   **Indigo:** `50` (#eef2ff), `600` (#4f46e5), `700` (#4338ca)
*   **Red:** `50` (#fef2f2), `600` (#dc2626), `700` (#b91c1c)
*   **Amber:** `50` (#fef3c7), `600` (#d97706), `700` (#b45309)
*   **Emerald/Green/Blue/Violet:** Used sparingly for specific icon states and animations (e.g., Violet-500, Blue-500, Emerald-500).

**Semantic Applications**
*   **Backgrounds:**
    *   App Background: `slate-50` (`bg-background`)
    *   Surfaces/Cards: `white`
    *   Secondary Surfaces: `slate-100` (`bg-secondary`)
*   **Text (Foreground):**
    *   Primary Text: `slate-900` (`text-foreground`)
    *   Secondary Text: `slate-800` (`text-secondary-text`)
    *   Muted Text: `slate-500` (`text-muted-DEFAULT`), `slate-600` (`text-muted-foreground`)
*   **Action / Brand (Primary):**
    *   Default: `indigo-600` (`primary`)
    *   Hover: `indigo-700` (`primary-hover`)
    *   Light/Subtle: `indigo-50` (`primary-light`)
*   **Destructive (Danger):**
    *   Default: `red-600` (`danger`)
    *   Hover: `red-700` (`danger-hover`)
    *   Light/Subtle: `red-50` (`danger-light`)
*   **Warning:**
    *   Default: `amber-600` (`warning`)
    *   Hover: `amber-700` (`warning-hover`)
    *   Light/Subtle: `amber-50` (`warning-light`)
*   **Borders:**
    *   Default Border: `slate-200` (`border`)

### Typography

*   **Font Families:** `Inter`, `sans-serif` (applied via `var(--font-inter)`).
*   **Size Scales (Tailwind defaults based on rem):**
    *   `text-xs` (0.75rem / 12px)
    *   `text-sm` (0.875rem / 14px)
    *   `text-base` (1rem / 16px)
    *   `text-lg` (1.125rem / 18px)
    *   `text-xl` (1.25rem / 20px) - Typically used for App Headers.
*   **Font Weights:**
    *   Medium (`500`)
    *   Semi-Bold (`600`)
    *   Bold (`700`) - Heavily used for buttons and titles.
*   **Line-Heights:** Inherited from Tailwind's proportional text size utilities.

### Geometric Foundations

*   **Spacing Scales:** Built on an 8px (0.5rem) grid system. Common padding/margin utilities detected: `p-1.5`, `p-2`, `px-4`, `py-2`, `p-8`, `gap-2`, `gap-4`.
*   **Border Radius:**
    *   Standard Interactive (Buttons/Inputs): `rounded-lg` (8px)
    *   Medium Containers: `rounded-xl` (12px)
    *   Large Containers (Modals): `rounded-2xl` (16px)
    *   Circular Elements (Icons/Progress): `rounded-full` (9999px)
*   **Elevation (Shadows):**
    *   Base Interactive: `shadow-sm`, `shadow-md`
    *   Hover States / Popovers: `shadow-lg`
    *   Colored Shadows: Custom implementations like `shadow-primary-light` and `shadow-warning-light`.

---

## 2. Web/UI Design (Interface Patterns & Rules)

### Buttons & Controls

All interactive buttons adhere to strict state parameterization based on the shared `Button` component:

*   **Base Styling:** `inline-flex items-center justify-center font-bold rounded-lg transition-all`.
*   **Focus State (Accessibility):** `focus:outline-none focus:ring-2 focus:ring-offset-2` (Focus ring color adapts to the variant type).
*   **Disabled State:** `disabled:opacity-50 disabled:cursor-not-allowed`.
*   **Variants:**
    *   **Primary:** Indigo background, white text. Elevates from `shadow-md` to `shadow-lg` on hover. Focus ring: `primary`.
    *   **Secondary:** Light slate background, dark slate text. Hover darkens background slightly. Focus ring: `slate-400`.
    *   **Outline:** White background, `slate-200` border, `slate-600` text. Hover mimics Secondary background.
    *   **Ghost:** Transparent background, muted text. Hover fills background with secondary color.
    *   **Danger:** Light red background, strict red text. Hover applies 10% opacity strict red. Focus ring: `danger`.
    *   **Warning:** Solid amber background, white text. Custom light warning shadow.

### Forms & Inputs

*   **Base Styles:** While explicit complex forms are minimal, standard text fields (when present) rely on `border-border` (`slate-200`) with rounded corners (`rounded-lg`) and focus rings mapping to primary brand colors.
*   **Validation States:** Explicitly handled via visual overlays, mapping `Danger` tokens for errors and `Green` tokens for success states.

### Structure & Layout

*   **Container Rules:** Main content areas are constrained using `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
*   **Layout Engine:** Flexbox is the primary alignment tool (`flex items-center justify-between`, `flex-col gap-X`).
*   **Responsive Breakpoints:** 
    *   Mobile-first design.
    *   `sm:` (640px) often used to unhide descriptive labels (e.g., "Powered by Gemini...").
    *   `md:`, `lg:` used for standard desktop scaling.

---

## 3. Tone of Voice & Copywriting (UX Writing)

### Inferred Tone

The current UI copy suggests a tone that is **Direct, Clear, and Encouraging**. The interface does not use overly technical jargon, opting instead for action-oriented language that guides the user efficiently through the document processing flow.

### Interaction Patterns (Current Implementations)

*   **Call-to-Actions (CTAs):** Short, verb-led phrases.
    *   *Examples:* "Upload PDF", "Open PDF", "Close", "Done".
*   **Status Messages:** Concise feedback prioritizing immediate comprehension.
    *   *Examples:* "Success!", "Error" (followed by a technical but readable description).

### Copywriting Rules (Template)

*(The following sections are to be completed by the Design/Content team to standardize our narrative voice)*

**1. General Principles**
*   [Define core personality traits: e.g., Helpful but not chatty, Professional but accessible]
*   [Define active vs. passive voice preferences]

**2. Vocabulary Dictionary**
*   **Preferred Terms:** [e.g., "Upload" vs "Select File", "Log In" vs "Sign In"]
*   **Forbidden Terms:** [e.g., "Click Here", "Oops!"]

**3. Formatting Standards**
*   **Capitalization:** [e.g., Title Case for buttons, Sentence case for descriptions]
*   **Punctuation:** [e.g., No periods at the end of bullet points, Oxford comma rules]
*   **Date/Time Formatting:** [e.g., MM/DD/YYYY vs DD/MM/YYYY, 12h vs 24h clock]

**4. Error Message Guidelines**
*   [How to explain technical failures without blaming the user]
*   [Mandatory structure: What happened + Why it happened + How to fix it]
