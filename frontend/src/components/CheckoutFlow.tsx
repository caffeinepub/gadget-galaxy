import { useState } from 'react';
import { ArrowLeft, ShoppingBag, Lock, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';
import { CartItem } from '../App';
import { useSubmitOrder, useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { ShoppingItem } from '../backend';

interface CheckoutFlowProps {
  items: CartItem[];
  onOrderPlaced: (orderId: bigint) => void;
  onBack: () => void;
}

export default function CheckoutFlow({ items, onOrderPlaced, onBack }: CheckoutFlowProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const submitOrder = useSubmitOrder();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isProcessing = submitOrder.isPending || createCheckoutSession.isPending;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setError(null);

    // If Stripe is configured, use Stripe Checkout redirect
    if (stripeConfigured) {
      try {
        const shoppingItems: ShoppingItem[] = items.map((item) => ({
          productName: item.name,
          productDescription: item.name,
          priceInCents: BigInt(Math.round(item.price * 100)),
          quantity: BigInt(item.quantity),
          currency: 'usd',
        }));

        const session = await createCheckoutSession.mutateAsync(shoppingItems);
        if (!session?.url) throw new Error('Stripe session missing url');
        window.location.href = session.url;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to initiate payment. Please try again.'
        );
      }
      return;
    }

    // Fallback: direct order submission (no payment)
    try {
      const products: Array<[string, bigint]> = items.map((item) => [
        String(item.id),
        BigInt(item.quantity),
      ]);
      const orderId = await submitOrder.mutateAsync(products);
      onOrderPlaced(orderId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some products before checking out.</p>
        <button
          onClick={onBack}
          className="bg-teal text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-dark transition-colors"
        >
          Back to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-[calc(100vh-4rem)] py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">
          Order Summary
        </h1>

        {/* Auth notice */}
        {!isAuthenticated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sign in required</p>
              <p className="text-sm text-amber-700 mt-0.5">
                You need to sign in to place an order and save your order history.
              </p>
            </div>
          </div>
        )}

        {/* Stripe payment notice */}
        {isAuthenticated && stripeConfigured && (
          <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-teal">Secure Payment via Stripe</p>
              <p className="text-sm text-gray-600 mt-0.5">
                You'll be redirected to Stripe's secure checkout to complete your payment.
              </p>
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">
              Items ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Order total */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-800">${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-lg">Total</span>
            <span className="font-extrabold text-teal text-2xl">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Place order / Pay button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || isLoggingIn}
          className="w-full bg-teal hover:bg-teal-dark text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {createCheckoutSession.isPending ? 'Redirecting to Stripe...' : 'Placing Order...'}
            </>
          ) : isLoggingIn ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : !isAuthenticated ? (
            <>
              <Lock className="w-4 h-4" />
              Sign In & Place Order
            </>
          ) : stripeConfigured ? (
            <>
              <CreditCard className="w-4 h-4" />
              Pay ${total.toFixed(2)} with Stripe
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Place Order
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          {stripeConfigured
            ? 'Payments are processed securely by Stripe. Your card details never touch our servers.'
            : 'Your order is secured and stored on the Internet Computer blockchain.'}
        </p>
      </div>
    </div>
  );
}
