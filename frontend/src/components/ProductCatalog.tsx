import { useState, useMemo } from 'react';
import { ShoppingCart, Star, Search, X, SlidersHorizontal, Package } from 'lucide-react';
import { CartItem } from '../App';
import { useGetAllProducts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '../backend';

export type ProductCategory =
  | 'Audio'
  | 'Wearables'
  | 'Accessories'
  | 'Smart Home'
  | 'Gaming'
  | 'Tablets'
  | 'Cameras'
  | 'Laptops'
  | 'Phones'
  | 'Networking';

const CATEGORIES: ProductCategory[] = [
  'Audio', 'Wearables', 'Accessories', 'Smart Home', 'Gaming',
  'Tablets', 'Cameras', 'Laptops', 'Phones', 'Networking',
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

interface ProductCatalogProps {
  onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

/**
 * Returns a local fallback image path based on the product's name and category.
 * Matches keywords in the product name first, then falls back by category.
 */
function getProductImage(product: Product): string {
  const nameLower = product.name.toLowerCase();
  const catLower = product.category.toLowerCase();

  // Name-based matching (most specific)
  if (nameLower.includes('headphone') || nameLower.includes('over-ear') || nameLower.includes('over ear')) {
    return '/assets/generated/product-headphones.dim_600x600.png';
  }
  if (nameLower.includes('earbud') || nameLower.includes('ear bud') || nameLower.includes('tws') || nameLower.includes('in-ear')) {
    return '/assets/generated/product-earbuds.dim_600x600.png';
  }
  if (nameLower.includes('speaker') || nameLower.includes('bluetooth speaker')) {
    return '/assets/generated/product-speaker.dim_600x600.png';
  }
  if (nameLower.includes('smartwatch') || nameLower.includes('smart watch') || nameLower.includes('watch')) {
    return '/assets/generated/product-smartwatch.dim_600x600.png';
  }
  if (nameLower.includes('keyboard') || nameLower.includes('mechanical')) {
    return '/assets/generated/product-keyboard.dim_600x600.png';
  }
  if (nameLower.includes('mouse') || nameLower.includes('gaming mouse')) {
    return '/assets/generated/product-mouse.dim_600x600.png';
  }
  if (nameLower.includes('charger') || nameLower.includes('usb-c') || nameLower.includes('usbc') || nameLower.includes('cable')) {
    return '/assets/generated/product-charger.dim_600x600.png';
  }
  if (nameLower.includes('webcam') || nameLower.includes('web cam') || nameLower.includes('camera')) {
    return '/assets/generated/product-webcam.dim_600x600.png';
  }
  if (nameLower.includes('lamp') || nameLower.includes('light') || nameLower.includes('desk lamp')) {
    return '/assets/generated/desk-lamp-product.dim_400x400.png';
  }
  if (nameLower.includes('stand') || nameLower.includes('laptop stand')) {
    return '/assets/generated/laptop-stand-product.dim_400x400.png';
  }
  if (nameLower.includes('smart home') || nameLower.includes('hub') || nameLower.includes('smart plug')) {
    return '/assets/generated/smarthome-product.dim_400x400.png';
  }

  // Category-based fallback
  if (catLower === 'audio') {
    return '/assets/generated/product-headphones.dim_600x600.png';
  }
  if (catLower === 'wearables') {
    return '/assets/generated/product-smartwatch.dim_600x600.png';
  }
  if (catLower === 'gaming') {
    return '/assets/generated/product-mouse.dim_600x600.png';
  }
  if (catLower === 'accessories') {
    return '/assets/generated/product-charger.dim_600x600.png';
  }
  if (catLower === 'cameras') {
    return '/assets/generated/product-webcam.dim_600x600.png';
  }
  if (catLower === 'smart home') {
    return '/assets/generated/smarthome-product.dim_400x400.png';
  }

  // Default fallback
  return '/assets/generated/product-speaker.dim_600x600.png';
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { data: products = [], isLoading, isError } = useGetAllProducts();

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return list;
  }, [products, selectedCategory, search, sort]);

  const handleAddToCart = (product: Product) => {
    const imageSrc = getProductImage(product);
    onAddToCart({
      id: product.id,           // use string productId as the unique id
      productId: product.id,
      name: product.name,
      price: Number(product.price) / 100,
      image: imageSrc,
    });
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  return (
    <section id="products" className="py-12 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Our Products</h2>
          <p className="text-gray-500">
            {isLoading ? 'Loading products…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'All'
                ? 'bg-teal text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal hover:text-teal'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-teal text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal hover:text-teal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error state */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">Failed to load products. Please try again.</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found.</p>
            {(search || selectedCategory !== 'All') && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                className="mt-3 text-teal text-sm hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const priceInDollars = Number(product.price) / 100;
              const isAdded = addedIds.has(product.id);
              const outOfStock = Number(product.stock) === 0;
              const imageSrc = getProductImage(product);

              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="relative bg-gray-50 h-48 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Final fallback to a known-good asset
                        if (!target.src.includes('product-speaker')) {
                          target.src = '/assets/generated/product-speaker.dim_600x600.png';
                        }
                      }}
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-1">
                      <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-3 flex-1 leading-relaxed">
                      {product.description || 'No description available.'}
                    </p>

                    {/* Stars placeholder */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">(4.0)</span>
                    </div>

                    {/* Price & Add to cart */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-extrabold text-gray-900">
                        ${priceInDollars.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={outOfStock || isAdded}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                          isAdded
                            ? 'bg-green-500 text-white'
                            : outOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-teal text-white hover:bg-teal-dark hover:shadow-md active:scale-95'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {isAdded ? 'Added!' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
