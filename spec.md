# Specification

## Summary
**Goal:** Fix the product page so that products load, display, and interact correctly end-to-end.

**Planned changes:**
- Audit and fix data fetching and rendering in the ProductCatalog component so all products display with correct names, descriptions, prices, and categories
- Fix image resolution logic so every product card shows a matched or fallback image with no broken image icons
- Fix the "Add to Cart" action so clicking it updates the cart badge in the Header and adds the item to the CartPanel (with quantity stacking for duplicates)
- Fix backend product data to ensure all products have meaningful descriptions, valid prices greater than zero, and valid categories

**User-visible outcome:** The product page fully loads all products with correct details and images, search/filter/sort controls work as expected, and adding items to the cart correctly updates the cart badge and cart panel.
