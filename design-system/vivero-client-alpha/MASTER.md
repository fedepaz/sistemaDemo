# Design System - AgriManage (vivero-client-alpha)

> **LOGIC:** When building a specific page, first check `design-system/vivero-client-alpha/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

**Project:** vivero-client-alpha (AgriManage)
**Source of truth:** `apps/frontend/src/app/globals.css` — **this file describes the tokens actually used.**

---

## Global Rules

### Color Palette

The theme uses **OKLCH CSS variables** defined in `apps/frontend/src/app/globals.css` (Tailwind v4 `@theme inline`). Always use the tokens — never hardcoded hex values.

| Role | Token | Notes |
|------|-------|-------|
| Background | `--background` | near-white (light) / dark (`.dark`) |
| Foreground | `--foreground` | main text |
| Primary | `--primary` | violet family (OKLCH ~277 hue) |
| Secondary | `--secondary` | neutral slate |
| Accent | `--accent` | subtle violet |
| Muted | `--muted` / `--muted-foreground` | secondary text/surfaces |
| Destructive | `--destructive` | red for errors/destructive actions |
| Chart 1–5 | `--chart-1` … `--chart-5` | data visualization (violet scale) |
| Sidebar | `--sidebar-*` | sidebar-specific tokens |
| Border/Input/Ring | `--border`, `--input`, `--ring` | controls & focus rings |
| Success | `--color-success` | success feedback |

Dark mode is implemented via a `.dark` class (Tailwind `@custom-variant dark`). Both palettes are defined — never assume only light mode.

### Typography

Fonts are loaded from Google Fonts in `globals.css`:

- **Sans (light mode):** Poppins (`--font-sans`)
- **Sans (dark mode):** Inter (`--font-sans`)
- **Serif:** Open Sans (light) / Merriweather (dark) (`--font-serif`)
- **Mono:** JetBrains Mono (`--font-mono`)

Use Tailwind's font utilities (`font-sans`, `font-mono`, etc.). Respect the established scale; do not add ad-hoc font sizes.

### Radius & Shadows

- Radius: `--radius: 0.5rem`.
- Shadow scale is defined as `--shadow-2xs` … `--shadow-2xl`, plus `--shadow-premium` for premium cards. Use `shadow-sm/md/lg/xl` utilities.

### Spacing

Use the Tailwind spacing scale (`p-2`…`p-4`, `gap-2`/`gap-3`). The UI is **compact by design** (Zero-Scroll standard, see below) — prefer tight gaps and padding.

---

## Component Specs

### Buttons

Use shadcn/ui `Button` (variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `success`). Do **not** write custom `.btn-*` CSS.

### Cards

Use shadcn/ui `Card` (`CardHeader`, `CardTitle`, `CardContent`, …). Premium data tables use `bg-card/40` + `border-border/40` + `shadow-premium` + `rounded-none`.

### Inputs & Forms

- shadcn/ui `Input`, `Textarea`, `Select`, `Checkbox`, `Label`, `Form` (React Hook Form + Zod).
- Use the `SlideOverForm` pattern for all create/edit forms (slide-over panel, not a centered modal).

### Modals / Dialogs

- shadcn/ui `Dialog` via the **context + portal** pattern: one provider per modal (`alert-modal-provider.tsx`, `wizard-modal-provider.tsx`), dialog shell mounted once in the layout, content components fetch their own data.

### Tables

- Central `DataTable` (`src/components/data-display/data-table/data-table.tsx`, TanStack Table v8).
- Features export columns with `exportColumns` (CSV/Excel/PDF) — see `frontend-agent.md`.
- Skeleton rows via `data-table-skeleton.tsx`.

### Loading (Skeleton Strategy)

- **Level 1:** route-level `loading.tsx` (required on every route segment).
- **Level 2:** colocated `*Skeleton.tsx` wrapped in `<Suspense>` for every data-fetching component.
- Respect `prefers-reduced-motion`; use `aria-busy="true"`.

---

## Layout Standards

- **Zero-Scroll / Shrink-to-Fit:** main views fit within `100dvh` — use `flex-1 overflow-hidden` + `ScrollArea` for internal scrolling, `dvh` for full-height layouts, compact gaps (`gap-2`/`gap-3`) and padding (`p-2`…`p-4`).
- **Sidebar navigation:** grouped, collapsible; expanded/collapsed state managed locally; chevron indicators.
- Responsive breakpoints: 375px, 768px, 1024px, 1440px.

## UI Language

**Spanish-only.** All user-facing strings are written directly in Spanish.

## Icons

Lucide React. Never use emojis as icons.

---

## Anti-Patterns (Do NOT Use)

- ❌ Hardcoded hex/OKLCH colors outside `globals.css`
- ❌ Custom `.btn-*` / `.card` CSS instead of shadcn/ui components
- ❌ Centered modals for CRUD forms (use `SlideOverForm`)
- ❌ Emojis as icons
- ❌ Missing `cursor-pointer` on clickable elements
- ❌ Layout-shifting hover transforms
- ❌ Low contrast text (4.5:1 minimum)
- ❌ Instant state changes without transitions (150–300ms)
- ❌ Invisible focus states
- ❌ Excessive vertical spacing that pushes content off-screen

---

## Pre-Delivery Checklist

- [ ] Tokens from `globals.css` only (no raw hex)
- [ ] shadcn/ui components, not hand-rolled CSS classes
- [ ] `loading.tsx` present for the route
- [ ] `*Skeleton.tsx` colocated for every data-fetching component
- [ ] No emojis as icons (Lucide only)
- [ ] `cursor-pointer` on clickable elements
- [ ] Focus states visible; `prefers-reduced-motion` respected
- [ ] Responsive: 375px / 768px / 1024px / 1440px
- [ ] Main view fits within `100dvh` (no vertical scroll unless intended)
- [ ] Spanish-only UI strings
