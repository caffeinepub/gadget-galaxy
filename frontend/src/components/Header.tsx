import { ShoppingCart, Zap, LogIn, LogOut, User, Package, Home, ShieldCheck } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onViewOrders: () => void;
  onHome: () => void;
  onAdminPanel: () => void;
  currentView: string;
}

export default function Header({
  cartCount,
  onCartClick,
  onViewOrders,
  onHome,
  onAdminPanel,
  currentView,
}: HeaderProps) {
  const { login, clear, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const displayName = userProfile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...';

  return (
    <header className="sticky top-0 z-50 bg-teal shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={onHome}
            className="flex items-center gap-2 group"
          >
            <div className="bg-white/20 rounded-lg p-1.5 group-hover:bg-white/30 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Gadget Galaxy
            </span>
          </button>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={onHome}
              className={`flex items-center gap-1.5 font-medium transition-colors text-sm ${
                currentView === 'catalog' ? 'text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </button>
            <button
              onClick={onHome}
              className="text-white/70 hover:text-white font-medium transition-colors text-sm"
            >
              Products
            </button>
            {isAuthenticated && (
              <button
                onClick={onViewOrders}
                className={`flex items-center gap-1.5 font-medium transition-colors text-sm ${
                  currentView === 'order-history' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                My Orders
              </button>
            )}
            {isAuthenticated && isAdmin && (
              <button
                onClick={onAdminPanel}
                className={`flex items-center gap-1.5 font-medium transition-colors text-sm ${
                  currentView === 'admin' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Auth button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-white/15 text-white px-3 py-1.5 rounded-full text-sm">
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate font-medium">{displayName}</span>
                </div>
                <button
                  onClick={handleAuth}
                  disabled={loginStatus === 'logging-in'}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-all duration-200 font-medium text-sm disabled:opacity-50"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </>
                )}
              </button>
            )}

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-full transition-all duration-200 font-medium text-sm"
              aria-label={`Shopping cart, ${cartCount} items`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
