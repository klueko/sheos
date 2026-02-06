import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
}

// Default preferences
const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
};

// Create stores
export const cookiePreferences = writable<CookiePreferences>(defaultPreferences);
export const cookieConsent = writable<CookieConsent | null>(null);

// Cookie consent version (increment when you make changes to cookie categories)
const CONSENT_VERSION = '1.0';

// Initialize cookie preferences from localStorage
export function initializeCookiePreferences() {
  if (!browser) return;

  try {
    const stored = localStorage.getItem('cookie-consent');
    const timestamp = localStorage.getItem('cookie-consent-date');
    
    if (stored && timestamp) {
      const preferences = JSON.parse(stored);
      const consent: CookieConsent = {
        preferences,
        timestamp,
        version: CONSENT_VERSION
      };
      
      cookiePreferences.set(preferences);
      cookieConsent.set(consent);
    }
  } catch (error) {
    console.error('Error loading cookie preferences:', error);
    // Reset to default if there's an error
    cookiePreferences.set(defaultPreferences);
  }
}

// Save cookie preferences to localStorage
export function saveCookiePreferences(preferences: CookiePreferences) {
  if (!browser) return;

  try {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    const consent: CookieConsent = {
      preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    
    cookiePreferences.set(preferences);
    cookieConsent.set(consent);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
      detail: preferences
    }));
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
}

// Check if user has given consent
export function hasCookieConsent(): boolean {
  if (!browser) return false;
  return localStorage.getItem('cookie-consent') !== null;
}

// Clear all cookie preferences
export function clearCookiePreferences() {
  if (!browser) return;

  localStorage.removeItem('cookie-consent');
  localStorage.removeItem('cookie-consent-date');
  cookiePreferences.set(defaultPreferences);
  cookieConsent.set(null);
}

// Check if consent is still valid (e.g., not older than 1 year)
export function isCookieConsentValid(): boolean {
  if (!browser) return false;

  const timestamp = localStorage.getItem('cookie-consent-date');
  if (!timestamp) return false;

  const consentDate = new Date(timestamp);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return consentDate > oneYearAgo;
}

// Analytics functions
export function canTrackAnalytics(): boolean {
  let canTrack = false;
  cookiePreferences.subscribe(prefs => {
    canTrack = prefs.analytics;
  })();
  return canTrack;
}

export function canTrackMarketing(): boolean {
  let canTrack = false;
  cookiePreferences.subscribe(prefs => {
    canTrack = prefs.marketing;
  })();
  return canTrack;
}

export function canTrackFunctional(): boolean {
  let canTrack = false;
  cookiePreferences.subscribe(prefs => {
    canTrack = prefs.functional;
  })();
  return canTrack;
}
