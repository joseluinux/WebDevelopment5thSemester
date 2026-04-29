# Design System Specification: The Obsidian Editorial

## 1. Overview & Creative North Star
**Creative North Star: The Precision Curator**
This design system rejects the "standard dashboard" aesthetic in favor of a high-end, editorial fintech experience. It lives in the tension between the weight of obsidian and the clarity of glass. By blending a "semi-dark" slate palette with crisp, oversized typography, we create an environment that feels authoritative yet breathable.

The "Precision Curator" avoids the clutter of traditional banking apps. We break the grid through **intentional asymmetry**: utilizing wide margins (16/20/24 scale) and overlapping elements to create a sense of bespoke craftsmanship. The interface shouldn't feel like a series of boxes, but rather a curated arrangement of financial data points floating on a deep, layered surface.

---

## 2. Colors: The Obsidian Palette
The soul of this system lies in its tonal depth. We use a "Semi-Dark" approach where pure black is avoided in favor of rich charcoals and slates, allowing the primary neon accent to vibrate with energy.

### Core Tones
- **Primary Surface:** `#1C1B1D` (surface_container_low). This is your foundational canvas.
- **Deep Base:** `#141315` (background). Used for the lowest level of the UI to provide "bottomless" depth.
- **Accent:** `#6A8CF2` (primary_container). A neon blue that cuts through the slate, used sparingly for high-value actions.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** 
Prohibit the use of 1px solid strokes to separate sections. Instead, define boundaries through background color shifts. Use `surface_container_low` against `surface_container_high` to create a logical break. Content should feel like it belongs to a zone because of the "ground" it sits on, not because it is "caged" by a line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials:
1.  **Level 0 (Base):** `background` (#141315)
2.  **Level 1 (Main Content Area):** `surface_container_low` (#1C1B1D)
3.  **Level 2 (Cards/Modules):** `surface_container` (#201F21) or `surface_container_high` (#2B292C)
4.  **Level 3 (Popovers/Modals):** `surface_bright` (#3A393B) with Backdrop Blur.

### The "Glass & Gradient" Rule
To achieve a "pro" fintech feel, primary CTAs and hero data visualizations must use a subtle gradient transition from `primary` (#B4C5FF) to `primary_container` (#6A8CF2). Floating elements (like navigation bars) should utilize **Glassmorphism**: `surface_container_highest` at 60% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Space & Authority
We pair the geometric technicality of **Space Grotesk** with the functional legibility of **Inter**.

- **Display & Headlines (Space Grotesk):** Use for large balances and section titles. Leverage the `display-lg` (3.5rem) for hero moments. The tight tracking and monospaced "feel" of Space Grotesk communicate fintech precision.
- **Body & Metadata (Inter):** Use for all long-form data and fine print. Inter's neutral tone prevents the "techy" Space Grotesk from becoming fatiguing.
- **Editorial Hierarchy:** Use `on_surface` (Pure White/Off-White) for primary headlines. Use `on_surface_variant` (#C4C6D5) for body text to reduce eye strain against the dark background.

---

## 4. Elevation & Depth: Tonal Layering
In this system, light creates height. We do not use "drop shadows" to signify importance; we use light and transparency.

### The Layering Principle
Achieve lift by "stacking." A card using `surface_container_highest` placed on a `surface_container_low` background creates a natural, soft lift. This creates a "matte-on-matte" look that is hallmark to high-end digital design.

### Ambient Shadows
If a floating element (like a floating action button) requires a shadow, it must be "Ambient":
- **Color:** `#000000` at 12% opacity.
- **Blur:** 40px to 60px.
- **Spread:** -10px.
This creates a soft glow of shadow rather than a hard edge, mimicking natural light.

### The "Ghost Border" Fallback
If contrast is required for accessibility (e.g., in a heavy data table), use a **Ghost Border**:
- `outline_variant` (#434652) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Signature Kit

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), white text. `0.375rem` (md) corner radius.
- **Secondary:** `surface_container_highest` background with a subtle "Ghost Border."
- **Interaction:** On hover, the primary button should "glow"—add a soft `primary_container` shadow at 20% opacity.

### The "Obsidian" Card
- **Style:** No border. Background: `surface_container`. 
- **Spacing:** Use `1.5rem` (6) internal padding for breathing room.
- **Nesting:** Nested data points inside the card should use `surface_container_lowest` for a "sunken" feel.

### Input Fields
- **State:** `surface_container_lowest` background. 
- **Focus:** Transition the background to `surface_container` and add a 1px ghost border using the `primary` (#B4C5FF) color at 30% opacity.
- **Typography:** Labels must use `label-md` in Space Grotesk for a "pro terminal" look.

### Data Visualizations (Fintech Specific)
- **Line Charts:** Use the `primary_container` neon blue with a `0.5` stroke width. 
- **Area Fills:** Use a gradient from `primary_container` (20% opacity) to transparent. 
- **List Items:** Absolutely no dividers. Separate transactions using `1rem` (4) vertical white space.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `display-lg` for large currency amounts to create an editorial impact.
- **Do** allow content to bleed off-center. Asymmetry creates a "designed" feel.
- **Do** use `surface_bright` sparingly for "Actionable" surfaces that need to stand out from the base.

### Don't:
- **Don't** use 100% pure black (#000000). It kills the "obsidian" depth.
- **Don't** use standard 1px grey dividers. Use the Spacing Scale (`0.75rem` to `1rem`) to separate groups of information.
- **Don't** use high-saturation reds for errors. Use the `error` (#FFB4AB) token, which is a desaturated "fintech pink" that fits the slate aesthetic.
- **Don't** use default Inter for headlines. It will make the platform look like a generic SaaS tool rather than a premium fintech experience.