import { ArrowLeft, Package, ShoppingBag, Clock, AlertCircle } from 'lucide-react';
import { useGetOrdersForCaller } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { PRODUCTS } from './ProductCatalog';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderHistoryProps {
  onBack: () => void;
}

function formatDate(timestamp: bigint): string {
  // Backend timestamp is in nanoseconds
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getProductDetails(productId: string) {
  const id = parseInt(productId, 10);
  return PRODUCTS.find((p) => p.id === id) || null;
}

export default function OrderHistory({ onBack }: OrderHistoryProps) {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading, error } = useGetOrdersForCaller();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Sign in to view orders</h2>
          <p className="text-gray-400 mb-6">
            You need to be signed in to view your order history.
          </p>
          <button
            onClick={onBack}
            className="bg-teal text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-dark transition-colors"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-[calc(100vh-4rem)] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-teal/10 rounded-xl p-2.5">
            <Package className="w-6 h-6 text-teal" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm">Your complete order history</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Failed to load orders</p>
              <p className="text-sm text-red-600 mt-0.5">
                {error instanceof Error ? error.message : 'Please try again later.'}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && orders && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 text-xl mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button
              onClick={onBack}
              className="bg-teal text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-dark transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && !error && orders && orders.length > 0 && (
          <div className="space-y-5">
            {[...orders].reverse().map((order) => {
              const orderTotal = order.products.reduce((sum, [productId, qty]) => {
                const product = getProductDetails(productId);
                return sum + (product ? product.price * Number(qty) : 0);
              }, 0);

              return (
                <article
                  key={order.id.toString()}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal/10 rounded-lg p-1.5">
                        <Package className="w-4 h-4 text-teal" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          Order #{order.id.toString()}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-teal text-lg">
                        ${orderTotal.toFixed(2)}
                      </p>
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <ul className="divide-y divide-gray-50">
                    {order.products.map(([productId, qty], idx) => {
                      const product = getProductDetails(productId);
                      return (
                        <li key={idx} className="flex items-center gap-4 px-5 py-3">
                          {product ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">
                              {product?.name || `Product #${productId}`}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              Qty: {qty.toString()}
                            </p>
                          </div>
                          {product && (
                            <p className="font-semibold text-gray-700 text-sm">
                              ${(product.price * Number(qty)).toFixed(2)}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
