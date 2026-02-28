import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCatalog from './components/ProductCatalog';
import CartPanel from './components/CartPanel';
import Footer from './components/Footer';
import CheckoutFlow from './components/CheckoutFlow';
import OrderSuccess from './components/OrderSuccess';
import OrderHistory from './components/OrderHistory';
import UserProfileSetup from './components/UserProfileSetup';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import PaymentSetup from './components/PaymentSetup';
import AdminPanel from './components/AdminPanel';

export interface CartItem {
  id: string; // use productId string as the unique key
  name: string;
  price: number; // in dollars
  image: string;
  quantity: number;
  productId: string; // original string product ID for backend calls
}

type AppView =
  | 'catalog'
  | 'checkout'
  | 'order-success'
  | 'order-history'
  | 'payment-success'
  | 'payment-failure'
  | 'admin';

const queryClient = new QueryClient();

function getInitialView(): AppView {
  const path = window.location.pathname;
  if (path === '/payment-success') return 'payment-success';
  if (path === '/payment-failure') return 'payment-failure';
  if (path === '/admin') return 'admin';
  return 'catalog';
}

function AppContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<AppView>(getInitialView);
  const [lastOrderId, setLastOrderId] = useState<bigint | null>(null);
  const [stripeSessionId, setStripeSessionId] = useState<string | null>(null);

  // Extract session_id from URL before cleaning it up
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');

    if (path === '/payment-success') {
      if (sessionId) {
        setStripeSessionId(sessionId);
      }
      window.history.replaceState({}, '', '/payment-success');
    } else if (path === '/payment-failure') {
      window.history.replaceState({}, '', '/payment-failure');
    } else if (path === '/admin') {
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      // Deduplicate by productId (string)
      const existing = prev.find((item) => item.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const handleCheckout = () => {
    setCartOpen(false);
    setView('checkout');
  };

  const handleOrderPlaced = (orderId: bigint) => {
    setLastOrderId(orderId);
    clearCart();
    setView('order-success');
  };

  const handlePaymentSuccessOrderCreated = (orderId: bigint) => {
    setLastOrderId(orderId);
    clearCart();
  };

  const handleBackToShopping = () => {
    setView('catalog');
    setLastOrderId(null);
    window.history.replaceState({}, '', '/');
  };

  const handleViewOrders = () => {
    setView('order-history');
    window.history.replaceState({}, '', '/');
  };

  const handleAdminPanel = () => {
    setView('admin');
    window.history.replaceState({}, '', '/admin');
  };

  const handleRetryPayment = () => {
    setView('checkout');
    window.history.replaceState({}, '', '/');
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header
        cartCount={totalCount}
        onCartClick={() => setCartOpen(true)}
        onViewOrders={handleViewOrders}
        onHome={handleBackToShopping}
        onAdminPanel={handleAdminPanel}
        currentView={view}
      />

      <main className="flex-1">
        {view === 'catalog' && (
          <>
            <Hero />
            <ProductCatalog onAddToCart={addToCart} />
          </>
        )}
        {view === 'checkout' && (
          <CheckoutFlow
            items={cartItems}
            onOrderPlaced={handleOrderPlaced}
            onBack={() => {
              setView('catalog');
              setCartOpen(true);
            }}
          />
        )}
        {view === 'order-success' && (
          <OrderSuccess
            orderId={lastOrderId}
            onBackToShopping={handleBackToShopping}
            onViewOrders={handleViewOrders}
          />
        )}
        {view === 'order-history' && (
          <OrderHistory onBack={handleBackToShopping} />
        )}
        {view === 'payment-success' && (
          <PaymentSuccess
            sessionId={stripeSessionId}
            cartItems={cartItems}
            onOrderCreated={handlePaymentSuccessOrderCreated}
            onViewOrders={handleViewOrders}
            onContinueShopping={handleBackToShopping}
          />
        )}
        {view === 'payment-failure' && (
          <PaymentFailure
            onRetry={handleRetryPayment}
            onBackToShopping={handleBackToShopping}
          />
        )}
        {view === 'admin' && (
          <AdminPanel onBack={handleBackToShopping} />
        )}
      </main>

      <Footer />

      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />

      <UserProfileSetup />
      <PaymentSetup />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <AppContent />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
