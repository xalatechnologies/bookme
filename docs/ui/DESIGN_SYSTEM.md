# BookMe Design System

**Version**: 1.0.1  
**Last Updated**: 2024-12-08  
**Status**: Light Mode Only (Production Ready)

---

## Overview

This document serves as the single source of truth for the BookMe UI system. All UI components should follow these guidelines to ensure consistency, maintainability, and ease of development.

### Design Principles

1. **Consistency**: Use the same components and patterns throughout the application
2. **Accessibility**: All components meet WCAG 2.1 AA standards
3. **Maintainability**: Single source of truth in `src/components/ui/`
4. **Type Safety**: Full TypeScript support with proper types
5. **Light Mode Only**: Currently supports light mode only, with structure ready for dark mode in future

---

## 1. Buttons

All buttons should use the `Button` or `PrimaryButton` component from `@/components/ui/button`.

### Button Variants

| Variant | Usage | Visual | Example Use Case |
|---------|-------|--------|------------------|
| `default` / `primary` | Primary call-to-action | Blue background (`hsl(var(--primary))`), white text, shadow | "Book Now", "Save", "Submit" |
| `secondary` | Supporting actions | Light gray background (`hsl(var(--secondary))`), dark text | "View Details", "Cancel" |
| `outline` | Tertiary actions, less emphasis | Transparent background, border, text color | "Cancel", "Back", "More Options" |
| `ghost` | Minimal emphasis, navigation | No background until hover | Icon buttons, subtle actions |
| `destructive` | Dangerous/irreversible actions | Red background (`hsl(var(--destructive))`), white text | "Delete Booking", "Remove User" |
| `link` | Text-style links | Underlined text on hover | "Learn More", "Read Documentation" |

### Button Sizes

| Size | Dimensions | Padding | Text Size | Use Case |
|------|------------|---------|-----------|----------|
| `sm` | `h-10` (40px) | `px-4 py-2` | `text-sm` (14px) | Compact spaces, tables, inline actions |
| `default` | `h-12` (48px) | `px-6 py-3` | `text-base` (16px) | Standard buttons, forms |
| `lg` | `h-14` (56px) | `px-8 py-4` | `text-lg` (18px) | Hero sections, primary CTAs |
| `icon` | `h-12 w-12` (48x48px) | - | - | Icon-only buttons |

### Button Usage Examples

#### ✅ DO

```tsx
import { Button } from '@/components/ui/button';

// Primary action
<Button variant="primary">Book Now</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action with confirmation
<Button variant="destructive" onClick={handleDelete}>
  Delete Booking
</Button>

// Icon button
<Button variant="ghost" size="icon">
  <SettingsIcon className="h-4 w-4" />
</Button>
```

#### ❌ DON'T

```tsx
// Don't use raw button elements
<button className="bg-blue-500 text-white px-4 py-2">
  Click Me
</button>

// Don't use multiple primary buttons in same context
<div>
  <Button variant="primary">Save</Button>
  <Button variant="primary">Cancel</Button> {/* Should be secondary */}
</div>

// Don't use destructive for non-dangerous actions
<Button variant="destructive">Close</Button> {/* Should be secondary/ghost */}
```

### Button Usage Guidelines

#### CTA (Call-to-Action) Buttons
- Use `variant="primary"` for primary actions that advance the user journey
- Examples: "Book Now", "Save Changes", "Submit Form", "Continue"
- Should be the most prominent button in a group

#### Secondary Action Buttons
- Use `variant="secondary"` or `variant="outline"` for supporting actions
- Examples: "Cancel", "Back", "Edit", "View Details"
- Should be visually subordinate to primary actions

#### Icon Buttons
- Use `variant="ghost"` with `size="icon"` for icon-only actions
- Examples: Close dialogs, favorite toggles, share actions
- Should have clear aria-labels for accessibility

---

## 2. Badges

Badges are used for status indicators, labels, and categorical information. Use the `Badge` component from `@/components/ui/badge`.

### Badge Variants

| Variant | Visual | Use Case |
|---------|--------|----------|
| `default` | Blue background (`bg-primary`) | Active, default status |
| `secondary` | Light gray background (`bg-secondary`) | Neutral status, informational |
| `destructive` | Red background (`bg-destructive`) | Error, cancelled, rejected |
| `outline` | Border only, transparent background | Draft, pending review |

### Status-Specific Badge Colors

For booking/approval statuses, use custom className with semantic colors:

```tsx
import { Badge } from '@/components/ui/badge';

// Approved / Success
<Badge className="bg-green-100 text-green-800 border-green-200">
  Approved
</Badge>

// Pending / Warning
<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
  Pending
</Badge>

// Rejected / Error
<Badge className="bg-red-100 text-red-800 border-red-200">
  Rejected
</Badge>

// Cancelled / Neutral
<Badge className="bg-gray-100 text-gray-800 border-gray-200">
  Cancelled
</Badge>

// Confirmed / Info
<Badge className="bg-blue-100 text-blue-800 border-blue-200">
  Confirmed
</Badge>
```

### Badge Status Color Mapping

| Status | Background | Text | Border | Semantic Meaning |
|--------|------------|------|--------|------------------|
| `approved` | `bg-green-100` | `text-green-800` | `border-green-200` | Success, accepted |
| `pending` | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` | Awaiting action |
| `rejected` | `bg-red-100` | `text-red-800` | `border-red-200` | Denied, failed |
| `cancelled` | `bg-gray-100` | `text-gray-800` | `border-gray-200` | Cancelled, inactive |
| `confirmed` | `bg-blue-100` | `text-blue-800` | `border-blue-200` | Confirmed, active |
| `draft` | `bg-gray-50` | `text-gray-600` | `border-gray-300` | Work in progress |

### Badge Usage Guidelines

- ✅ Keep badge text short (1-2 words maximum)
- ✅ Use for status indicators and categorical labels
- ✅ Use consistent colors for same semantic meaning across app
- ❌ Don't use badges for long text
- ❌ Don't use badges as clickable buttons (use Button instead)

---

## 3. Cards

Cards are containers for grouped content. Use the `Card` component family from `@/components/ui/card`.

### Standard Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, 
         CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Brief description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Visual**:
- Background: `hsl(var(--card))` (white in light mode)
- Border: `1px solid hsl(var(--border))`
- Border radius: `rounded-lg` (0.5rem)
- Shadow: `shadow-sm`
- Padding: `p-6` for header/content

### KPI / Metric Card

For dashboard statistics and key metrics:

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">
      +20.1% from last month
    </p>
  </CardContent>
</Card>
```

### List Card / Row Card

For list items with metadata:

```tsx
<Card className="hover:shadow-md transition-shadow cursor-pointer">
  <CardContent className="p-4">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-lg">Facility Name</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Location • Capacity info
        </p>
      </div>
      <Badge>Status</Badge>
    </div>
  </CardContent>
</Card>
```

### Card Usage Guidelines

- ✅ Use consistent padding (`p-6` for CardHeader/CardContent)
- ✅ Add hover effects for clickable cards (`hover:shadow-lg`)
- ✅ Use CardDescription for supporting text
- ✅ Keep card hierarchy clear (Title > Description > Content > Footer)
- ❌ Don't nest cards inside cards
- ❌ Don't overcrowd card content

---

## 4. Typography & Spacing

### Typography Scale

| Element | Size | Weight | Usage | Tailwind Class |
|---------|------|--------|-------|----------------|
| Hero Title | 48px | 700 (bold) | Landing page heroes | `text-5xl font-bold` |
| Page Title | 36px | 600 (semibold) | Main page headings | `text-4xl font-semibold` |
| Section Header | 30px | 600 (semibold) | Section headings | `text-3xl font-semibold` |
| Card Title | 24px | 600 (semibold) | Card headers | `text-2xl font-semibold` |
| Subsection | 20px | 600 (semibold) | Subsection headers | `text-xl font-semibold` |
| Large Body | 18px | 400 (regular) | Emphasized text | `text-lg` |
| Body (Default) | 16px | 400 (regular) | Standard text | `text-base` |
| Small Body | 14px | 400 (regular) | Secondary text | `text-sm` |
| Caption / Label | 12px | 500 (medium) | Labels, captions | `text-xs font-medium` |

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

System font stack is used for optimal performance and native feel.

### Spacing Scale

Consistent spacing throughout the application:

| Token | Value | Usage | Tailwind |
|-------|-------|-------|----------|
| `--spacing-1` | 4px | Tight spacing | `gap-1`, `p-1`, `m-1` |
| `--spacing-2` | 8px | Small spacing | `gap-2`, `p-2`, `m-2` |
| `--spacing-3` | 12px | Default spacing | `gap-3`, `p-3`, `m-3` |
| `--spacing-4` | 16px | Medium spacing | `gap-4`, `p-4`, `m-4` |
| `--spacing-6` | 24px | Large spacing | `gap-6`, `p-6`, `m-6` |
| `--spacing-8` | 32px | Extra large | `gap-8`, `p-8`, `m-8` |
| `--spacing-12` | 48px | Section spacing | `gap-12`, `py-12` |
| `--spacing-16` | 64px | Page spacing | `py-16` |

---

## 5. Colors & Tokens

### CSS Variables (from theme.css)

All colors use HSL format for better manipulation and consistency.

#### Brand Colors

```css
--primary: 221 83% 53%;           /* #3b82f6 - Blue */
--primary-foreground: 210 40% 98%; /* White text on primary */

--secondary: 220 14% 96%;          /* #f1f5f9 - Light gray */
--secondary-foreground: 222 47% 11%; /* Dark text on secondary */
```

#### Semantic Colors

```css
--destructive: 0 72% 51%;         /* #dc2626 - Red for errors/danger */
--destructive-foreground: 210 40% 98%;

/* Note: success, warning, info not defined in root but used via Tailwind */
```

#### Neutral Colors

```css
--background: 0 0% 100%;          /* #ffffff - Page background */
--foreground: 224 71% 4%;         /* #0c0a09 - Main text color */

--card: 0 0% 100%;                /* #ffffff - Card background */
--card-foreground: 224 71% 4%;

--muted: 220 14% 96%;             /* #f1f5f9 - Muted backgrounds */
--muted-foreground: 220 9% 46%;   /* #64748b - Muted text */

--border: 220 13% 91%;            /* #e2e8f0 - Borders, dividers */
--input: 220 13% 91%;             /* Input borders */

--ring: 221 83% 53%;              /* Focus ring color (same as primary) */
```

### Color Usage Guidelines

| Token | Usage | Example |
|-------|-------|---------|
| `--primary` | Primary actions, links, highlights | "Book Now" button, active nav items |
| `--secondary` | Secondary actions, subtle backgrounds | "Cancel" button, disabled states |
| `--destructive` | Destructive actions, errors | "Delete" button, error messages |
| `--background` | Page background | Main page container |
| `--card` | Card/surface background | Cards, modals, popovers |
| `--muted` | Disabled states, subtle backgrounds | Disabled buttons, placeholders |
| `--border` | Borders, dividers | Card borders, hr elements |

### Additional Semantic Colors (via Tailwind)

For statuses not covered by CSS variables, use Tailwind's semantic colors:

```tsx
// Success (Green)
<div className="bg-green-100 text-green-800 border-green-200">

// Warning (Yellow/Orange)
<div className="bg-yellow-100 text-yellow-800 border-yellow-200">

// Info (Blue)
<div className="bg-blue-100 text-blue-800 border-blue-200">
```

---

## 6. Theme & Dark Mode

### Current State: Light Mode Only

**The BookMe application currently supports light mode only.** Dark mode infrastructure is present in `theme.css` but is explicitly disabled in `main.tsx`.

#### Why Light Mode Only?

- Simplifies initial development and deployment
- Ensures consistent user experience across all environments
- Reduces maintenance burden during production launch phase
- Provides clean foundation for future dark mode implementation

#### Dark Mode Future Implementation

When dark mode is needed:

1. **Enable in main.tsx**: Remove the dark mode disabling logic
2. **Create useTheme hook**: For theme state management
3. **Add ThemeToggle component**: User-facing theme switcher
4. **Implement persistence**: Save preference to localStorage/database
5. **Respect system preference**: Use `prefers-color-scheme` as default
6. **Test thoroughly**: Verify all components work in both modes

The existing `.dark` CSS rules in `theme.css` provide a starting point.

---

## 7. Layout & Background

### Background Tokens

Define consistent background usage across layouts:

```css
/* Recommended additions to theme.css */
--background-page: var(--background);     /* Main page background */
--background-card: var(--card);           /* Card/surface background */
--background-muted: var(--muted);         /* Subtle sections */
```

### Layout Components

#### Page Background

For consistent page backgrounds:

```tsx
<div className="min-h-screen bg-background">
  {/* Page content */}
</div>
```

#### Section Background

For alternating section backgrounds:

```tsx
// Primary section
<section className="bg-background">
  {/* Content */}
</section>

// Muted section (for visual separation)
<section className="bg-muted">
  {/* Content */}
</section>
```

### Layout Consistency

All major layouts should follow same patterns:

- **PublicLayout**: Clean, minimal navigation, focus on content
- **AdminLayout**: Sidebar navigation, consistent spacing
- **UserLayout**: User-focused navigation, dashboard-style

**Spacing Guidelines**:
- Page padding: `px-4 md:px-6 lg:px-8`
- Section spacing: `py-12 md:py-16`
- Card spacing: `p-6`
- Grid gaps: `gap-4` or `gap-6`

---

## 8. Forms & Inputs

### Form Components

Always pair inputs with labels for accessibility:

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
    required
  />
</div>
```

### Form Validation

Show errors clearly:

```tsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-destructive">
    Email *
  </Label>
  <Input 
    id="email"
    className="border-destructive focus-visible:ring-destructive"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-sm text-destructive">
    Please enter a valid email address
  </p>
</div>
```

---

## 9. Accessibility

### Focus Management

All interactive elements have visible focus indicators:

```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Keyboard Navigation

- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward
- **Enter/Space**: Activate buttons, checkboxes
- **Escape**: Close dialogs, popovers

### ARIA Labels

Always provide accessible labels:

```tsx
// Icon button
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Search input
<Input 
  aria-label="Search facilities" 
  placeholder="Search..."
/>
```

### Color Contrast

All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

---

## 10. Common Patterns

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeletons';

<Card>
  <CardHeader>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-32 w-full" />
  </CardContent>
</Card>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-16 w-16 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold">No results found</h3>
  <p className="text-sm text-muted-foreground mt-2 mb-6">
    Try adjusting your search or filters
  </p>
  <Button>Clear Filters</Button>
</div>
```

### Error States

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

---

## 11. Do's and Don'ts

### ✅ DO

- Use `Button` component for all button actions
- Use consistent spacing from the scale
- Follow the color token system
- Keep components focused and reusable
- Add loading/disabled states
- Include accessibility attributes
- Use semantic HTML elements
- Test keyboard navigation

### ❌ DON'T

- Create raw `<button>` elements with custom styling
- Use hardcoded colors outside the token system
- Nest cards inside cards
- Use multiple primary buttons in same context
- Forget labels on form inputs
- Rely on color alone for information
- Make buttons smaller than 44x44px (touch target)
- Use destructive variant for non-dangerous actions

---

## 12. Component Reference

### Available UI Components

Located in `src/components/ui/`:

- `button.tsx` - Button component with variants
- `badge.tsx` - Badge component for status/labels
- `card.tsx` - Card container components
- `input.tsx` - Form input fields
- `label.tsx` - Form labels
- `select.tsx` - Dropdown selection
- `checkbox.tsx` - Checkbox inputs
- `radio-group.tsx` - Radio button groups
- `switch.tsx` - Toggle switches
- `dialog.tsx` - Modal dialogs
- `alert.tsx` - Alert messages
- `skeleton.tsx` - Loading skeletons
- `tabs.tsx` - Tab navigation
- `accordion.tsx` - Collapsible sections
- `dropdown-menu.tsx` - Dropdown menus
- `popover.tsx` - Popover tooltips
- `calendar.tsx` - Date picker
- `textarea.tsx` - Multi-line text input
- `progress.tsx` - Progress indicators
- `scroll-area.tsx` - Scrollable containers
- `separator.tsx` - Horizontal dividers
- `avatar.tsx` - User avatars
- `toggle.tsx` - Toggle buttons
- `command.tsx` - Command palette

All components are fully typed and documented inline.

---

## Maintenance

### Adding New Components

1. Create component in `src/components/ui/`
2. Use class-variance-authority (cva) for variants if needed
3. Ensure full TypeScript support
4. Add accessibility attributes
5. Document in this file
6. Add usage examples

### Updating Colors

1. Update `src/styles/theme.css`
2. Test contrast ratios (WebAIM Contrast Checker)
3. Update this documentation
4. Test across all components

### Version History

- **v1.0.1** (2024-12-08): Added button usage guidelines and CTA definitions
- **v1.0.0** (2024-12-08): Initial design system documentation, light mode only

---

**Maintained By**: BookMe Development Team  
**Questions**: Refer to this document first, then consult team for clarifications
