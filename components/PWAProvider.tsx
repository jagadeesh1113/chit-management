"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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

function isAndroidChrome(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android/.test(ua) && /chrome/.test(ua) && !/edga|opr|samsung/.test(ua);
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();

  // Use a ref to capture the event synchronously — critical for Android Chrome.
  // Android fires beforeinstallprompt very early and if we miss it we lose it.
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if (isInstalled()) return;

    const handler = (e: Event) => {
      // CRITICAL: preventDefault() must be called synchronously to retain the prompt.
      // Do NOT await anything before this call.
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      installPromptRef.current = promptEvent;
      setInstallPrompt(promptEvent);

      // Show banner if user hasn't dismissed
      if (!isSnoozed() && !isPermanentlyDismissed()) {
        setTimeout(() => setShowBanner(true), 1500);
      }
    };

    const onInstalled = () => {
      setShowBanner(false);
      setInstallPrompt(null);
      installPromptRef.current = null;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Fallback for Android Chrome when beforeinstallprompt doesn't fire.
  // This happens when: the app was recently prompted, or criteria aren't
  // fully met yet. We show a manual guide in this case.
  useEffect(() => {
    if (!isAndroidChrome()) return;
    if (isInstalled() || isSnoozed() || isPermanentlyDismissed()) return;

    const timer = setTimeout(() => {
      // If native prompt still hasn't fired, offer manual instructions
      if (!installPromptRef.current && !showBanner) {
        setShowBanner(true);
      }
    }, 6000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = installPromptRef.current;

    if (prompt) {
      // Native install — must call .prompt() directly, no async gap
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        installPromptRef.current = null;
        setShowBanner(false);
        try { localStorage.removeItem(DISMISSED_KEY); } catch { /* noop */ }
      } else {
        snooze();
      }
    } else {
      // No native prompt available — show manual instructions
      setShowBanner(false);
      setShowManualGuide(true);
    }
  }, []);

  const snooze = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + SNOOZE_DURATION_MS));
    } catch { /* noop */ }
  }, []);

  const handleNeverShow = useCallback(() => {
    setShowBanner(false);
    try { localStorage.setItem(DISMISSED_KEY, "true"); } catch { /* noop */ }
  }, []);

  const hasNativePrompt = !!installPrompt;

  return (
    <>
      {children}

      {/* ── Install banner ─────────────────────────────────────────── */}
      {showBanner && !isInstalled() && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold select-none">
              MC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Install ManageChit</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {hasNativePrompt
                  ? "Add to home screen for quick access"
                  : 'Tap ⋮ menu → "Add to Home Screen"'}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 items-end">
              <button
                onClick={handleInstall}
                className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 active:opacity-75 transition-opacity"
              >
                {hasNativePrompt ? "Install" : "How?"}
              </button>
              <div className="flex gap-2">
                <button onClick={snooze} className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded transition-colors">
                  Later
                </button>
                <button onClick={handleNeverShow} className="text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded transition-colors">
                  Don&apos;t show
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual guide (Android Chrome, no native prompt) ────────── */}
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
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                <span>Tap the <strong className="text-foreground">⋮ menu</strong> (three dots) in the top-right of Chrome</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                <span>Select <strong className="text-foreground">Add to Home screen</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                <span>Tap <strong className="text-foreground">Add</strong> to confirm</span>
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
