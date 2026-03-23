'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New SW installed — optionally notify user to refresh
              console.log('[PWA] New version available. Refresh to update.');
            }
          });
        });

        console.log('[PWA] Service worker registered:', registration.scope);
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    };

    registerSW();
  }, []);
}
