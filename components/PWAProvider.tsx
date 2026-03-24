"use client";

import { useEffect, useState, useCallback } from "react";
import { useServiceWorker } from "@/hooks/useServiceWorker";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";
const DISMISSED_UNTIL_KEY = "pwa-install-dismissed-until";
const SNOOZE_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

function isSnoozed(): boolean {
  try {
    const until = localStorage.getItem(DISMISSED_UNTIL_KEY);
    if (!until) return false;
    return Date.now() < parseInt(until, 10);
  } catch {
    return false;
  }
}

function isPermanentlyDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Detect Android
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
  }, []);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      // Always prevent the mini-infobar — we show our own UI
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Only show banner if not installed, not snoozed, not permanently dismissed
      if (!isInstalled() && !isSnoozed() && !isPermanentlyDismissed()) {
        // Small delay so the page settles before we show the banner
        setTimeout(() => setShowBanner(true), 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed via appinstalled event
    const onInstalled = () => {
      setShowBanner(false);
      setInstallPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // For Android: if beforeinstallprompt never fires (e.g. already seen, Samsung Internet),
  // show a manual "Add to Home Screen" guide banner after some engagement
  useEffect(() => {
    if (!isAndroid) return;
    if (isInstalled() || isSnoozed() || isPermanentlyDismissed()) return;

    // If the native prompt hasn't fired after 5s, show a manual guide
    const timer = setTimeout(() => {
      if (!installPrompt && !showBanner) {
        setShowBanner(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAndroid, installPrompt, showBanner]);

  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      // Native install flow
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        setShowBanner(false);
        try {
          localStorage.removeItem(DISMISSED_KEY);
        } catch {
          /* noop */
        }
      } else {
        // Dismissed — snooze for 3 days
        try {
          localStorage.setItem(
            DISMISSED_UNTIL_KEY,
            String(Date.now() + SNOOZE_DURATION_MS),
          );
        } catch {
          /* noop */
        }
        setShowBanner(false);
      }
    } else {
      // No native prompt — show manual instructions (handled by manualGuide state)
      setShowManualGuide(true);
      setShowBanner(false);
    }
  }, [installPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(
        DISMISSED_UNTIL_KEY,
        String(Date.now() + SNOOZE_DURATION_MS),
      );
    } catch {
      /* noop */
    }
  }, []);

  const handleNeverShow = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      /* noop */
    }
  }, []);

  const [showManualGuide, setShowManualGuide] = useState(false);

  return (
    <>
      {children}

      {/* Install Banner */}
      {showBanner && !isInstalled() && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold select-none">
              MC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">
                Install ManageChit
              </p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {installPrompt
                  ? "Add to home screen for quick access"
                  : 'Tap the menu → "Add to Home Screen"'}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 items-end">
              <button
                onClick={handleInstall}
                className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 active:opacity-75 transition-opacity"
              >
                {installPrompt ? "Install" : "How?"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleNeverShow}
                  className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded transition-colors"
                >
                  {"Don't show"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Guide Modal (for when native prompt is unavailable) */}
      {showManualGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowManualGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-background border border-border p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add to Home Screen</h2>
              <button
                onClick={() => setShowManualGuide(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <span>
                  Tap the <strong className="text-foreground">⋮ menu</strong>{" "}
                  (three dots) in the top-right of Chrome
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <span>
                  Select{" "}
                  <strong className="text-foreground">
                    Add to Home screen
                  </strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <span>
                  Tap <strong className="text-foreground">Add</strong> to
                  confirm
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowManualGuide(false)}
              className="mt-6 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
