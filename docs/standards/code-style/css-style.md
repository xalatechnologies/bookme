# CSS Style Guide

We always use the latest version of TailwindCSS with Flowbite for all CSS styling. This guide establishes comprehensive standards for CSS class usage, Flowbite integration, and Tailwind CSS best practices.

## Core Principles

### 1. Flowbite-First Approach
- **ALWAYS** use Flowbite components and utilities before custom CSS
- Leverage Flowbite's pre-built design system for consistency
- Only extend or customize when Flowbite doesn't provide the needed functionality
- Follow Flowbite's color palette and design tokens

### 2. TailwindCSS Integration
- Use TailwindCSS v4+ with Flowbite plugin
- Implement utility-first methodology
- Avoid custom CSS classes unless absolutely necessary
- Maintain responsive design principles

## Flowbite CSS Classes and Utilities

### Color System
```css
/* Primary Colors (Blue) */
.text-blue-50 to .text-blue-950
.bg-blue-50 to .bg-blue-950
.border-blue-50 to .border-blue-950

/* Semantic Colors */
.text-success-50 to .text-success-950    /* Green variants */
.text-warning-50 to .text-warning-950    /* Yellow variants */
.text-danger-50 to .text-danger-950      /* Red variants */
.text-info-50 to .text-info-950          /* Cyan variants */

/* Dark Mode Support */
.dark\:text-gray-100
.dark\:bg-gray-800
.dark\:border-gray-600
```

### Typography Classes
```css
/* Flowbite Typography Scale */
.text-xs      /* 12px */
.text-sm      /* 14px */
.text-base    /* 16px */
.text-lg      /* 18px */
.text-xl      /* 20px */
.text-2xl     /* 24px */
.text-3xl     /* 30px */
.text-4xl     /* 36px */
.text-5xl     /* 48px */

/* Font Weights */
.font-light    /* 300 */
.font-normal   /* 400 */
.font-medium   /* 500 */
.font-semibold /* 600 */
.font-bold     /* 700 */
.font-extrabold /* 800 */

/* Line Heights */
.leading-none     /* 1 */
.leading-tight    /* 1.25 */
.leading-snug     /* 1.375 */
.leading-normal   /* 1.5 */
.leading-relaxed  /* 1.625 */
.leading-loose    /* 2 */
```

### Spacing System
```css
/* Flowbite Spacing Scale (based on 4px grid) */
.p-0    /* 0px */
.p-1    /* 4px */
.p-2    /* 8px */
.p-3    /* 12px */
.p-4    /* 16px */
.p-5    /* 20px */
.p-6    /* 24px */
.p-8    /* 32px */
.p-10   /* 40px */
.p-12   /* 48px */
.p-16   /* 64px */
.p-20   /* 80px */
.p-24   /* 96px */

/* Margin Classes */
.m-auto  /* margin: auto */
.mx-auto /* margin-left: auto; margin-right: auto */
.my-4    /* margin-top: 16px; margin-bottom: 16px */

/* Gap Classes for Flexbox/Grid */
.gap-1   /* 4px */
.gap-2   /* 8px */
.gap-4   /* 16px */
.gap-6   /* 24px */
.gap-8   /* 32px */
```

### Layout Classes
```css
/* Display */
.block
.inline-block
.inline
.flex
.inline-flex
.grid
.inline-grid
.hidden

/* Flexbox */
.flex-row
.flex-col
.flex-wrap
.flex-nowrap
.justify-start
.justify-center
.justify-between
.justify-around
.justify-evenly
.items-start
.items-center
.items-end
.items-stretch

/* Grid */
.grid-cols-1 to .grid-cols-12
.col-span-1 to .col-span-12
.grid-rows-1 to .grid-rows-6
.row-span-1 to .row-span-6

/* Positioning */
.relative
.absolute
.fixed
.sticky
.static
```

### Border and Radius Classes
```css
/* Border Width */
.border-0
.border
.border-2
.border-4
.border-8

/* Border Radius */
.rounded-none    /* 0px */
.rounded-sm      /* 2px */
.rounded         /* 4px */
.rounded-md      /* 6px */
.rounded-lg      /* 8px */
.rounded-xl      /* 12px */
.rounded-2xl     /* 16px */
.rounded-3xl     /* 24px */
.rounded-full    /* 9999px */

/* Specific Corners */
.rounded-t-lg    /* top corners */
.rounded-r-lg    /* right corners */
.rounded-b-lg    /* bottom corners */
.rounded-l-lg    /* left corners */
```

### Shadow Classes
```css
/* Flowbite Shadow Scale */
.shadow-none
.shadow-sm       /* 0 1px 2px rgba(0, 0, 0, 0.05) */
.shadow          /* 0 1px 3px rgba(0, 0, 0, 0.1) */
.shadow-md       /* 0 4px 6px rgba(0, 0, 0, 0.1) */
.shadow-lg       /* 0 10px 15px rgba(0, 0, 0, 0.1) */
.shadow-xl       /* 0 20px 25px rgba(0, 0, 0, 0.1) */
.shadow-2xl      /* 0 25px 50px rgba(0, 0, 0, 0.25) */
.shadow-inner    /* inset 0 2px 4px rgba(0, 0, 0, 0.06) */

/* Dark Mode Shadows */
.dark\:shadow-lg
.dark\:shadow-xl
```

## Multi-line CSS Classes in Markup

### Formatting Rules
- Use multi-line formatting for complex class combinations
- Each responsive breakpoint on its own line
- Align classes vertically for readability
- Group related utilities together
- Separate state modifiers (hover, focus, active)

### Responsive Breakpoints
```css
/* Default (mobile-first) */
xs:   /* 400px and up */
sm:   /* 640px and up */
md:   /* 768px and up */
lg:   /* 1024px and up */
xl:   /* 1280px and up */
2xl:  /* 1536px and up */
```

### Multi-line Example
```html
<div class="flowbite-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4
            hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            xs:p-6
            sm:p-8 sm:max-w-md
            md:p-10 md:max-w-lg
            lg:p-12 lg:max-w-xl
            xl:p-14 xl:max-w-2xl
            2xl:p-16 2xl:max-w-4xl">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2
             sm:text-xl
             md:text-2xl
             lg:text-3xl">
    Flowbite Card Title
  </h3>
  <p class="text-gray-600 dark:text-gray-400 text-sm
            sm:text-base
            md:text-lg">
    Card description with responsive typography.
  </p>
</div>
```

## Component-Specific CSS Classes

### Button Classes
```css
/* Base Button Classes */
.btn-primary    /* Blue button */
.btn-secondary  /* Gray button */
.btn-success    /* Green button */
.btn-danger     /* Red button */
.btn-warning    /* Yellow button */
.btn-info       /* Cyan button */

/* Button Sizes */
.btn-xs         /* Extra small */
.btn-sm         /* Small */
.btn-md         /* Medium (default) */
.btn-lg         /* Large */
.btn-xl         /* Extra large */

/* Button Variants */
.btn-outline    /* Outlined style */
.btn-ghost      /* Ghost/transparent style */
.btn-gradient   /* Gradient background */
```

### Form Classes
```css
/* Input Classes */
.form-input     /* Base input styling */
.form-select    /* Select dropdown styling */
.form-textarea  /* Textarea styling */
.form-checkbox  /* Checkbox styling */
.form-radio     /* Radio button styling */

/* Input States */
.input-error    /* Error state */
.input-success  /* Success state */
.input-warning  /* Warning state */

/* Input Sizes */
.input-sm       /* Small input */
.input-md       /* Medium input */
.input-lg       /* Large input */
```

### Navigation Classes
```css
/* Navbar Classes */
.navbar         /* Base navbar */
.navbar-brand   /* Brand/logo area */
.navbar-nav     /* Navigation list */
.navbar-item    /* Navigation item */
.navbar-link    /* Navigation link */

/* Sidebar Classes */
.sidebar        /* Base sidebar */
.sidebar-item   /* Sidebar item */
.sidebar-link   /* Sidebar link */
.sidebar-group  /* Sidebar group */
```

### Card Classes
```css
/* Card Components */
.card           /* Base card */
.card-header    /* Card header */
.card-body      /* Card body */
.card-footer    /* Card footer */
.card-image     /* Card image */

/* Card Variants */
.card-bordered  /* With border */
.card-shadow    /* With shadow */
.card-hover     /* Hover effects */
```

## Dark Mode Implementation

### Dark Mode Classes
```css
/* Text Colors */
.dark\:text-white
.dark\:text-gray-100
.dark\:text-gray-200
.dark\:text-gray-300
.dark\:text-gray-400

/* Background Colors */
.dark\:bg-gray-900
.dark\:bg-gray-800
.dark\:bg-gray-700
.dark\:bg-gray-600

/* Border Colors */
.dark\:border-gray-700
.dark\:border-gray-600
.dark\:border-gray-500
```

### Dark Mode Example
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
    Dark Mode Compatible Heading
  </h2>
  <p class="text-gray-600 dark:text-gray-400">
    This text adapts to dark mode automatically.
  </p>
</div>
```

## Animation and Transition Classes

### Transition Classes
```css
/* Transition Properties */
.transition-none
.transition-all
.transition-colors
.transition-opacity
.transition-shadow
.transition-transform

/* Transition Duration */
.duration-75     /* 75ms */
.duration-100    /* 100ms */
.duration-150    /* 150ms */
.duration-200    /* 200ms */
.duration-300    /* 300ms */
.duration-500    /* 500ms */
.duration-700    /* 700ms */
.duration-1000   /* 1000ms */

/* Transition Timing */
.ease-linear
.ease-in
.ease-out
.ease-in-out
```

### Transform Classes
```css
/* Scale */
.scale-0 to .scale-150
.hover\:scale-105
.hover\:scale-110

/* Rotate */
.rotate-0 to .rotate-180
.hover\:rotate-6
.hover\:-rotate-6

/* Translate */
.translate-x-0 to .translate-x-full
.translate-y-0 to .translate-y-full
.-translate-x-1/2
.-translate-y-1/2
```

## Accessibility Classes

### Screen Reader Classes
```css
.sr-only        /* Screen reader only */
.not-sr-only    /* Not screen reader only */
```

### Focus Classes
```css
.focus\:outline-none
.focus\:ring-2
.focus\:ring-blue-500
.focus\:ring-offset-2
.focus\:ring-offset-white
.dark\:focus\:ring-offset-gray-800
```

## Performance Optimization

### Class Purging
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
  ],
  // ... rest of config
}
```

### Critical CSS
- Load critical Flowbite CSS inline
- Defer non-critical styles
- Use CSS-in-JS for component-specific styles

## Best Practices

### 1. Class Organization
```html
<!-- Good: Organized by category -->
<div class="
  /* Layout */
  flex flex-col items-center justify-center
  /* Spacing */
  p-6 m-4 gap-4
  /* Colors */
  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
  /* Typography */
  text-lg font-semibold leading-relaxed
  /* Borders & Effects */
  border border-gray-200 dark:border-gray-700 rounded-lg shadow-md
  /* States */
  hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
  /* Responsive */
  sm:p-8 md:p-10 lg:p-12
">
```

### 2. Avoid Custom CSS
```css
/* Bad: Custom CSS */
.custom-button {
  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
  border-radius: 8px;
  padding: 12px 24px;
}

/* Good: Flowbite/Tailwind classes */
.bg-gradient-to-r .from-blue-500 .to-blue-700 .rounded-lg .px-6 .py-3
```

### 3. Consistent Spacing
```html
<!-- Use consistent spacing scale -->
<div class="space-y-4">        <!-- 16px vertical spacing -->
  <div class="p-4">...</div>   <!-- 16px padding -->
  <div class="mb-4">...</div>  <!-- 16px bottom margin -->
</div>
```

### 4. Semantic Color Usage
```html
<!-- Good: Semantic colors -->
<button class="bg-blue-600 hover:bg-blue-700">Primary Action</button>
<button class="bg-green-600 hover:bg-green-700">Success Action</button>
<button class="bg-red-600 hover:bg-red-700">Danger Action</button>

<!-- Bad: Non-semantic colors -->
<button class="bg-purple-600">Delete Item</button>
```

## Troubleshooting

### Common Issues
1. **Classes not applying**: Check Tailwind config includes Flowbite content paths
2. **Dark mode not working**: Ensure dark mode is enabled in Tailwind config
3. **Responsive classes not working**: Verify breakpoint syntax and mobile-first approach
4. **Purged classes**: Add dynamic classes to safelist in Tailwind config

### Debug Tools
```javascript
// Add to development environment
if (process.env.NODE_ENV === 'development') {
  document.documentElement.classList.add('debug-screens');
}
```
