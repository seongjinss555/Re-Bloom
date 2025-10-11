import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const BACKEND_BASE = process.env.EXPO_PUBLIC_API_BASE;
export const NATIVE_REDIRECT = 'rebloom://socialCallback'; 

export async function googleLogin(): Promise<'opened' | 'redirected' | 'cancel'> {
  if (Platform.OS === 'web') {
    const res = await fetch(`${BACKEND_BASE}/api/auth/oauth2/authorization/google?mode=web`, {
      headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' },
      credentials: 'omit',
    });
    const { url } = await res.json();
    window.location.assign(url);     
    return 'redirected';
  }

  // mobile
  const r = await fetch(`${BACKEND_BASE}/api/auth/oauth2/authorization/google?mode=mobile`, {
    headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' },
    credentials: 'omit',
  });
  const { url } = await r.json();

  const result = await WebBrowser.openAuthSessionAsync(url, NATIVE_REDIRECT);
  return result.type === 'success' ? 'opened' : 'cancel';
}

