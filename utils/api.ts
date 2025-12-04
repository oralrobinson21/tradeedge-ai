import { Platform } from "react-native";
import Constants from "expo-constants";

function getApiBaseUrl(): string {
  const envUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
  
  if (Platform.OS === "web" && typeof window !== "undefined") {
    // On Replit web, use same-origin requests (proxied through main server)
    // This avoids CORS issues since requests go to the same domain
    if (window.location.hostname.includes("replit.dev") || window.location.hostname.includes("repl.co")) {
      // Use relative path - requests go to same origin and are proxied to backend
      return "";
    }
    return "http://localhost:5000";
  }
  
  if (envUrl) {
    return envUrl;
  }
  
  return "http://localhost:5000";
}

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}
