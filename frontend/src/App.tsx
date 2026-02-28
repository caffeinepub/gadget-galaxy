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

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

type AppView = 'catalog' | 'checkout' | 'order-success' | 'order-history' | 'payment-success' | 'payment-failure';

const queryClient = new QueryClient();

function getInitialView(): AppView {
  const path = window.location.pathname;
  if (path === '/payment-success') return 'payment-success';
  if (path === '/payment-failure') return 'payment-failure';
  return 'catalog';
}

function AppContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<AppView>(getInitialView);
  const [lastOrderId, setLastOrderId] = useState<bigint | null>(null);

  // Clean up URL after handling payment redirect
  useEffect(() => {
    if (view === 'payment-success' || view === 'payment-failure') {
      window.history.replaceState({}, '', '/');
    }
  }, [view]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
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

  const handleBackToShopping = () => {
    setView('catalog');
    setLastOrderId(null);
  };

  const handleViewOrders = () => {
    setView('order-history');
  };

  const handleRetryPayment = () => {
    setView('checkout');
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header
        cartCount={totalCount}
        onCartClick={() => setCartOpen(true)}
        onViewOrders={handleViewOrders}
        onHome={handleBackToShopping}
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
            onBackToShopping={handleBackToShopping}
            onViewOrders={handleViewOrders}
          />
        )}
        {view === 'payment-failure' && (
          <PaymentFailure
            onRetry={handleRetryPayment}
            onBackToShopping={handleBackToShopping}
          />
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
