import { CheckCircle, ShoppingBag, Package } from 'lucide-react';

interface OrderSuccessProps {
  orderId: bigint | null;
  onBackToShopping: () => void;
  onViewOrders: () => void;
}

export default function OrderSuccess({
  orderId,
  onBackToShopping,
  onViewOrders,
}: OrderSuccessProps) {
  return (
    <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-teal/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-teal" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Order Placed! 🎉
        </h1>
        <p className="text-gray-500 text-base mb-2">
          Thank you for your purchase. Your order has been confirmed and saved to the blockchain.
        </p>

        {orderId !== null && (
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal font-semibold px-4 py-2 rounded-full text-sm mt-2 mb-8">
            <Package className="w-4 h-4" />
            Order #{orderId.toString()}
          </div>
        )}

        {orderId === null && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onViewOrders}
            className="flex items-center justify-center gap-2 bg-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-dark transition-all duration-200 hover:shadow-md"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </button>
          <button
            onClick={onBackToShopping}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
