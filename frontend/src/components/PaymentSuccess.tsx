import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, Package, ShoppingBag, CreditCard } from 'lucide-react';
import { useGetStripeSessionStatus, useSubmitOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { CartItem } from '../App';

interface PaymentSuccessProps {
  sessionId: string | null;
  cartItems: CartItem[];
  onOrderCreated: (orderId: bigint) => void;
  onViewOrders: () => void;
  onContinueShopping: () => void;
}

export default function PaymentSuccess({
  sessionId,
  cartItems,
  onOrderCreated,
  onViewOrders,
  onContinueShopping,
}: PaymentSuccessProps) {
  const { identity } = useInternetIdentity();
  const getSessionStatus = useGetStripeSessionStatus();
  const submitOrder = useSubmitOrder();
  const [orderId, setOrderId] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    if (!identity) return;

    // Try to get cart items from sessionStorage if not passed via props
    let itemsToOrder = cartItems;
    if (itemsToOrder.length === 0) {
      try {
        const stored = sessionStorage.getItem('pendingCartItems');
        if (stored) {
          itemsToOrder = JSON.parse(stored) as CartItem[];
        }
      } catch {
        // ignore
      }
    }

    const processPayment = async () => {
      hasProcessed.current = true;
      setIsProcessing(true);
      setError(null);

      try {
        // Verify the Stripe session if we have a session ID
        if (sessionId) {
          const status = await getSessionStatus.mutateAsync(sessionId);
          if (status.__kind__ === 'failed') {
            setError(`Payment verification failed: ${status.failed.error}`);
            setIsProcessing(false);
            return;
          }
        }

        // Submit the order to the backend
        if (itemsToOrder.length > 0) {
          const orderProducts: Array<[string, bigint]> = itemsToOrder.map((item) => [
            item.productId,
            BigInt(item.quantity),
          ]);
          const newOrderId = await submitOrder.mutateAsync(orderProducts);
          setOrderId(newOrderId);
          onOrderCreated(newOrderId);
          // Clear stored cart items
          try {
            sessionStorage.removeItem('pendingCartItems');
          } catch {
            // ignore
          }
        } else {
          // No items to order, just show success without an order ID
          setOrderId(null);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process order';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [identity, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!identity) {
    return (
      <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-amber-50 rounded-full p-6 w-fit mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to complete your order.</p>
          <button
            onClick={onContinueShopping}
            className="bg-teal text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-dark transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-teal/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-teal animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Order</h2>
          <p className="text-gray-500">Verifying payment and creating your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-page min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 rounded-full p-6 w-fit mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Order Processing Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onContinueShopping}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>
            <button
              onClick={onViewOrders}
              className="flex items-center justify-center gap-2 bg-teal text-white font-bold px-6 py-3 rounded-xl hover:bg-teal-dark transition-all duration-200 hover:shadow-md"
            >
              <Package className="w-4 h-4" />
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Payment Successful! 🎉
        </h1>
        <p className="text-gray-500 text-base mb-2">
          Thank you for your purchase. Your payment has been processed securely by Stripe.
        </p>
        <p className="text-gray-400 text-sm mb-4">
          Your order has been confirmed and will be processed shortly.
        </p>

        {orderId !== null && (
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal font-semibold px-4 py-2 rounded-full text-sm mb-8">
            <Package className="w-4 h-4" />
            Order #{orderId.toString()}
          </div>
        )}

        {orderId === null && <div className="mb-8" />}

        {/* Stripe badge */}
        <div className="inline-flex items-center gap-2 bg-teal/10 text-teal font-semibold px-4 py-2 rounded-full text-sm mb-8 ml-2">
          <CreditCard className="w-4 h-4" />
          Payment verified by Stripe
        </div>

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
            onClick={onContinueShopping}
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
