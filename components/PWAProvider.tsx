'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => setShowBanner(false);

  return (
    <>
      {children}
      {showBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            {/* App icon placeholder */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              MC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Install ManageChit</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                Add to home screen for quick access
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
