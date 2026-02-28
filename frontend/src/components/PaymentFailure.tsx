import { XCircle, ShoppingBag, RefreshCw, CreditCard } from 'lucide-react';

interface PaymentFailureProps {
  onRetry: () => void;
  onBackToShopping: () => void;
}

export default function PaymentFailure({ onRetry, onBackToShopping }: PaymentFailureProps) {
  return (
    <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        {/* Failure icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center shadow-md">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-gray-500 text-base mb-2">
          Your payment was not completed. No charges have been made to your account.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Your cart items are still saved. You can try again or continue browsing.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 bg-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-dark transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
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
