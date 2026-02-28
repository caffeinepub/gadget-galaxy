import { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function UserProfileSetup() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Please enter your name.');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    setNameError('');
    try {
      await saveProfile.mutateAsync({ name: trimmed });
    } catch {
      setNameError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-teal/10 rounded-full p-3">
              <Sparkles className="w-7 h-7 text-teal" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-extrabold text-gray-900">
            Welcome to Gadget Galaxy!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            You're signed in for the first time. What should we call you?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="profile-name"
                type="text"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                autoFocus
              />
            </div>
            {nameError && (
              <p className="text-red-500 text-xs mt-1.5">{nameError}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saveProfile.isPending}
            className="w-full bg-teal hover:bg-teal-dark text-white font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saveProfile.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
