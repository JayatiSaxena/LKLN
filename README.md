# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Project Additions: Image Optimization and API Layer

## Setup

- Copy `.env.example` to `.env` and set your API base URL:

```
VITE_API_BASE_URL=http://localhost:3000
```

- Images now use a shared `SmartImage` component with lazy-loading and graceful fallbacks.
- API calls use a lightweight `fetch`-based client with a configurable base URL.

## SmartImage Component

Location: `src/component/common/SmartImage.tsx`

Usage example:

```tsx
import { SmartImage } from "./component/common/SmartImage";

<SmartImage
  src={logo}
  alt="Euphoria"
  className="h-10 w-auto"
  width={120}
  height={40}
  loading="lazy"
/>
```

Notes:
- Lazy loads by default and provides a vector fallback image if the source fails.
- Accepts standard `<img>` props plus optional `fallbackSrc`.

## API Client

Location: `src/lib/api/client.ts`

Example:

```ts
import { apiClient } from "../../lib/api/client";

type Product = { id: number; name: string };

async function loadProducts() {
  const data = await apiClient.get<Product[]>("/products");
  return data;
}
```

Environment:
- Base URL is read from `import.meta.env.VITE_API_BASE_URL`.

## Cart Service

Location: `src/lib/api/services/cart.ts`

```ts
cartService.getCart();
cartService.updateItemQuantity(123, 2);
cartService.removeItem(123);
```

Expected `/cart` response shape:

```json
{
  "items": [
    { "id": 1, "name": "Blue Flower Print Crop Top", "color": "Yellow", "price": 29, "quantity": 1, "image": "/images/1.png" }
  ],
  "subtotal": 29,
  "savings": 0,
  "shipping": 5,
  "total": 34
}
```

## Refactors

- `src/component/women/CartDetails.tsx` now fetches cart data from the API on mount and falls back to sample data on failure.
- `src/Navbar.tsx` and `src/Footer.tsx` were updated to use `SmartImage` for all icons/images.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Roles, admin & seed data

1. Run migrations in `supabase/migrations` (new: `20240325000001`–`3`: role security, product fields, 15 seed products; images are in `public/products`).
2. Create accounts through the app: customers at `/signup`, admin at `/admin/signup` (only `admin@lkln.com` is granted the admin role – by a database trigger, not the client). Sign in at `/login` (customers) or `/admin/login` (admin).
3. Optional demo orders: run `supabase/seed_demo_orders.sql` after `customer@lkln.com` has signed up.
4. Admin dashboard (`/admin`): Products, Checklist (product completion), Orders, Customers, Coupons, Returns, Community.
