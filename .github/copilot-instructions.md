# ERP Tenta System - Copilot Instructions

## Project Overview
This is a **Greek-language ERP system** for configuring and pricing awnings (τέντες) and pergolas (πέργκολες). Built with React 19 + Vite + Tailwind CSS 4, it connects to Supabase for product catalog management.

**Key User Flow:** Categories → Products → Product Configuration → Price Calculation → Save

## Architecture

### Data Layer
- **Supabase Tables (Greek names):**
  - `Κατηγορίες` (Categories): Product categories with `id` and `name`
  - `Προιόντα` (Products): Products with `id`, `name`, `category_id`
- **Environment Variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (never commit these)
- **Client:** `src/supabaseClient.js` exports singleton `supabase` instance

### Component Structure
- **`App.jsx`**: Main router logic with 3 views (categories → products → configuration)
  - Product ID routing: Pergolas (category_id='2', products 18-22) use `PergolaProConfig`
  - Other products show "under development" placeholder
- **Configuration Components:** Located in `src/components/{ProductType}Config/`
  - Each product type gets its own folder with dedicated config component
  - Props: `{ product, onSave }` where `onSave` receives `{ config, calculations, productName }`

### Pricing System
- **Located:** `src/constants/pergolaPricingTables.js`
- **Tables:** Large lookup objects (e.g., `PRO100_BASE_PRICES`) with [projection][width] structure
- **Utilities:**
  - `getPriceFromTable(table, projection, width)`: Safe lookup with 0 fallback
  - `roundUpToNext50(cm)`: Rounds dimensions to next 50cm increment
  - `calculateColumnCount(width)`: Determines structural columns needed
- **Formula Pattern:** Base + Add-ons + (Subtotal × Color Surcharge)

### Styling
- **Tailwind CSS 4** configured via `tailwind.config.js`
- **Color Scheme:** Blue gradients (`from-blue-50 to-indigo-100`) for backgrounds
- **Icons:** `lucide-react` (use `<Package />`, `<ChevronRight />`, `<Calculator />`, etc.)
- **Forms:** Gray borders, hover transitions, disabled states for errors

## Development Patterns

### React Conventions
- **State:** Use `useState` for form config and calculated prices
- **Side Effects:** `useEffect` for price recalculations on config changes
- **Error Handling:** Store validation errors in state array, display in red alert boxes

### Configuration Components Template
```jsx
const [config, setConfig] = useState({ /* defaults */ });
const [calculations, setCalculations] = useState({ /* price breakdown */ });
const [errors, setErrors] = useState([]);

useEffect(() => { calculatePrices(); }, [config]);

const handleChange = (field, value) => {
  setConfig(prev => ({ ...prev, [field]: value }));
};
```

### Greek Language
- **All UI text in Greek:** Labels, buttons, alerts, comments
- **Variable names in English:** Code uses English (e.g., `width`, `projection`)
- **Currency:** Display as `€X.XX` using `.toFixed(2)`

### Validation Approach
- Validate during calculation, push errors to array
- Check table lookup returns (0 = out of range)
- Conditional logic errors (e.g., "Old Parapet" only with "Kilodokos")
- Display all errors in `<AlertCircle />` box, disable save button

## Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```

## Important Constraints

1. **Never hardcode prices** - always use lookup tables from `pergolaPricingTables.js`
2. **Greek table names** - Supabase queries use Greek: `.from('Κατηγορίες')`
3. **Dimension rounding** - Use `roundUpToNext50()` for pricing lookups
4. **Product routing** - Check `category_id` AND product `id` range in `App.jsx`
5. **No TypeScript** - Project uses plain JSX, avoid TS syntax

## Adding New Product Configurations

1. Create folder: `src/components/{ProductName}Config/`
2. Create component: `{ProductName}Config.jsx` with standard props
3. Add pricing tables to `src/constants/pergolaPricingTables.js` if needed
4. Update `App.jsx` `renderConfigComponent()` with new routing logic
5. Match Greek product names exactly as stored in Supabase

## Common Pitfalls

- **Don't mix categories:** Each product type has distinct configuration options
- **ESLint rule:** Unused vars starting with capital letters are ignored (constant tables)
- **Supabase errors:** Always check for `error` in query responses
- **Empty folders:** `hooks/` and `utils/` exist but are currently unused
