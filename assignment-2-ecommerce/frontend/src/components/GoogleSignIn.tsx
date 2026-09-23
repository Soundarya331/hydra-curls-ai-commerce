import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (options: { client_id: string; callback: (data: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: { theme: string; size: string; type: string }) => void;
      disableAutoSelect: () => void;
    } } };
  }
}
let scriptPromise: Promise<void> | undefined;
function loadGoogle() {
  if (window.google) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptPromise = undefined; script.remove(); reject(new Error('Google Sign-In could not load')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
export function GoogleSignIn() {
  const ref = useRef<HTMLDivElement>(null);
  const { loginWithGoogleToken } = useAuth();
  const loginRef = useRef(loginWithGoogleToken);
  loginRef.current = loginWithGoogleToken;
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch('/api/auth/config');
        if (!res.ok) throw new Error('Sign-in is temporarily unavailable');
        const config = await res.json();
        if (!config.google_client_id) throw new Error('Google Sign-In is not configured yet');
        await loadGoogle();
        if (!active || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: config.google_client_id,
          callback: ({ credential }) => {
            loginRef.current(credential).catch(error => setError(error.message));
          },
        });
        window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'medium', type: 'standard' });
      } catch (error) { if (active) setError(error instanceof Error ? error.message : 'Sign-in failed'); }
    }
    void init();
    return () => { active = false; };
  }, []);
  return <div><div ref={ref} aria-label="Sign in with Google" />{error && <p role="alert" className="max-w-40 text-xs text-rose-700">{error}</p>}</div>;
}
