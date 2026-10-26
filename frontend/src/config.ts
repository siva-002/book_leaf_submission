/**
 * Centralized Application Configuration
 * All backend URLs and service endpoints are managed here.
 */

// Production Backend URL (Render service)
export const DEFAULT_BACKEND_URL = 'https://book-leaf-2x6o.onrender.com';

// Optional environment variable override (e.g. Vercel dashboard or .env)
const envBackendUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  ''
).replace(/\/api\/?$/, '');

// Resolved Backend Base Origin
export const BACKEND_URL: string = envBackendUrl || DEFAULT_BACKEND_URL;

// API Base Endpoint (e.g. "https://book-leaf-2x6o.onrender.com/api")
export const API_BASE_URL: string = `${BACKEND_URL}/api`;

// Socket.IO Endpoint (Direct connection to backend server, never the frontend)
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  BACKEND_URL;

/**
 * Resolves static attachment file URLs.
 * If url is relative like "/uploads/abc.pdf", prefixes it with the backend origin.
 */
export const getUploadUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const origin = BACKEND_URL || (import.meta.env.PROD ? DEFAULT_BACKEND_URL : '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};
