import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../App';

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
}

/**
 * Returns a local fallback image path based on the cart item's name.
 */
function getCartItemImage(item: CartItem): string {
  const nameLower = item.name.toLowerCase();

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

  // Use the stored image if available, otherwise default
  return item.image || '/assets/generated/product-speaker.dim_600x600.png';
}

export default function CartPanel({
  open,
  onClose,
  items,
  onRemove,
  onUpdateQuantity,
  onCheckout,
}: CartPanelProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-teal">
          <div className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-bold text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div className="bg-gray-100 rounded-full p-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">
                  Add some gadgets to get started!
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-teal text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-teal-dark transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const imageSrc = getCartItemImage(item);
                return (
                  <li
                    key={item.id}
                    className="flex gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('product-speaker')) {
                            target.src = '/assets/generated/product-speaker.dim_600x600.png';
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-teal font-bold text-sm mt-0.5">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-gray-800 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 self-start"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-teal hover:bg-teal-dark text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-base flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 text-gray-500 hover:text-gray-700 font-medium py-2 text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
