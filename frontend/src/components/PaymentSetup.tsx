import { useState } from 'react';
import { CreditCard, Settings, X, Eye, EyeOff, Globe, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const DEFAULT_COUNTRIES = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK'];

export default function PaymentSetup() {
  const { identity } = useInternetIdentity();
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [open, setOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [countries, setCountries] = useState<string[]>(DEFAULT_COUNTRIES);
  const [newCountry, setNewCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAuthenticated = !!identity;

  if (!isAuthenticated || isLoading) return null;

  const handleSave = async () => {
    setError(null);
    if (!secretKey.trim()) {
      setError('Please enter your Stripe secret key.');
      return;
    }
    if (!secretKey.startsWith('sk_')) {
      setError('Invalid Stripe secret key. It should start with "sk_".');
      return;
    }
    if (countries.length === 0) {
      setError('Please add at least one allowed country.');
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries,
      });
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setSecretKey('');
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save Stripe configuration.'
      );
    }
  };

  const addCountry = () => {
    const code = newCountry.trim().toUpperCase();
    if (code.length !== 2) {
      setError('Country code must be 2 letters (e.g. US, GB).');
      return;
    }
    if (countries.includes(code)) {
      setError('Country already added.');
      return;
    }
    setCountries((prev) => [...prev, code]);
    setNewCountry('');
    setError(null);
  };

  const removeCountry = (code: string) => {
    setCountries((prev) => prev.filter((c) => c !== code));
  };

  return (
    <>
      {/* Admin config button — only shown when not yet configured */}
      {!isConfigured && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-teal text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-teal-dark transition-all duration-200 hover:shadow-xl"
          title="Configure Stripe Payments"
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Setup Payments</span>
        </button>
      )}

      {/* Settings icon for reconfiguring */}
      {isConfigured && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white border border-gray-200 text-gray-600 font-semibold px-4 py-3 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200"
          title="Reconfigure Stripe Payments"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Payment Settings</span>
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="bg-teal/10 rounded-full p-3">
                <CreditCard className="w-7 h-7 text-teal" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-extrabold text-gray-900">
              {isConfigured ? 'Update Stripe Configuration' : 'Configure Stripe Payments'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              {isConfigured
                ? 'Update your Stripe secret key and allowed countries.'
                : 'Enter your Stripe secret key to enable secure payments in your store.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-5">
            {/* Secret Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Stripe Secret Key
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk_live_... or sk_test_..."
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Find your secret key in the{' '}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:underline"
                >
                  Stripe Dashboard
                </a>
                . Use test keys (sk_test_...) for development.
              </p>
            </div>

            {/* Allowed Countries */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Allowed Countries
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Country code (e.g. US)"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value.toUpperCase().slice(0, 2))}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCountry(); }}
                    maxLength={2}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCountry}
                  className="flex items-center gap-1 bg-teal text-white px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {countries.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-teal/10 text-teal text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => removeCountry(code)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {countries.length === 0 && (
                  <p className="text-xs text-gray-400">No countries added yet.</p>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-green-700">
                  ✓ Stripe configured successfully!
                </p>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={setConfig.isPending || success}
              className="w-full bg-teal hover:bg-teal-dark text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {setConfig.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {isConfigured ? 'Update Configuration' : 'Enable Stripe Payments'}
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
