import { useState } from 'react';
import { Settings, X, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function PaymentSetup() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isConfigured, isLoading: isCheckingConfig } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [isOpen, setIsOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState<string[]>(['US', 'CA', 'GB']);
  const [newCountry, setNewCountry] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin || isCheckingConfig) return null;

  const handleAddCountry = () => {
    const code = newCountry.trim().toUpperCase();
    if (code.length === 2 && !countries.includes(code)) {
      setCountries([...countries, code]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (code: string) => {
    setCountries(countries.filter((c) => c !== code));
  };

  const handleSave = async () => {
    if (!secretKey.trim()) {
      setError('Please enter your Stripe secret key.');
      return;
    }
    if (!secretKey.startsWith('sk_')) {
      setError('Stripe secret key must start with "sk_".');
      return;
    }
    if (countries.length === 0) {
      setError('Please add at least one allowed country.');
      return;
    }

    setError(null);
    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries,
      });
      setIsOpen(false);
      setSecretKey('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(message);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant={isConfigured ? 'outline' : 'default'}
          className="gap-2 shadow-lg"
        >
          {isConfigured ? (
            <>
              <CheckCircle className="w-4 h-4 text-primary" />
              Stripe Configured
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Setup Stripe
            </>
          )}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isConfigured ? 'Reconfigure Stripe' : 'Setup Stripe Payments'}
            </DialogTitle>
            <DialogDescription>
              {isConfigured
                ? 'Update your Stripe configuration. The new key will replace the existing one.'
                : 'Enter your Stripe secret key to enable real payments in your store.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Secret Key */}
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe Secret Key</Label>
              <Input
                id="stripe-key"
                type="password"
                placeholder="sk_live_... or sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find your secret key in the{' '}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Stripe Dashboard
                </a>
                . Never share this key publicly.
              </p>
            </div>

            {/* Allowed Countries */}
            <div className="space-y-2">
              <Label>Allowed Countries</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 border border-border rounded-md bg-muted/30">
                {countries.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded"
                  >
                    {code}
                    <button
                      onClick={() => handleRemoveCountry(code)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Country code (e.g. US)"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value.toUpperCase().slice(0, 2))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCountry()}
                  maxLength={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCountry}
                  disabled={newCountry.length !== 2}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={setStripeConfig.isPending}>
              {setStripeConfig.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
