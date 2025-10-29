# Cart Feature Domain

Complete feature domain for shopping cart and checkout.

## Overview

The cart domain handles:
- Shopping cart management
- Checkout process
- Payment methods
- Order confirmation

**Note**: Cart state is managed via Zustand store at `@/stores/cartStore`

## Architecture

```
src/components/features/cart/
├── hooks/
│   └── index.ts            # (Cart uses Zustand store)
├── types.ts                 # Cart types
├── constants.ts             # Complete constants (112 lines)
├── index.ts                 # Barrel export
└── README.md                # This file
```

## Quick Start

```typescript
import {
  // Types
  PaymentMethod,
  CheckoutStep,
  ICartItem,
  
  // Constants
  PAYMENT_METHODS,
  CART_I18N_KEYS,
  CART_PERMISSIONS,
  hasCartPermission
} from '@/components/features/cart';

// Cart state
import { useCartStore } from '@/stores/cartStore';
```

## Constants (112 lines)

- **Business Logic**: PAYMENT_METHODS, CHECKOUT_STEPS
- **Localization**: I18N_NAMESPACE, CART_I18N_KEYS
- **RBAC**: CART_PERMISSIONS, hasCartPermission()
- **Design**: CART_DESIGN (item, summary)
- **Animations**: CART_ANIMATIONS (item removal)
- **Performance**: CART_PERFORMANCE (debounce, local storage)
