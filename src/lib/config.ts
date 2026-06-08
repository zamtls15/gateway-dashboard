/**
 * Centralised runtime config.
 *
 * In development (Vite) these are injected via `import.meta.env`.
 * On Cloudflare Pages, set them as environment variables in the dashboard
 * (Settings → Environment Variables) and they are embedded at build time.
 *
 * Required variable:
 *   VITE_API_BASE_URL  – The full origin of the Cloudflare Worker API.
 *                        e.g. https://zamproject-api.zamdonations.workers.dev
 *
 * In development the Vite proxy rewrites /gateway and /health to the worker,
 * so you can leave VITE_API_BASE_URL empty (default '') and the proxy handles
 * it. For production Cloudflare Pages builds, set the variable so direct
 * fetch() calls hit the right origin.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/**
 * The full Worker origin used for constructing public-facing proxy endpoints
 * shown in the UI (e.g. the env endpoint in SecretsTab).
 *
 * Defaults to the same origin as the API so local dev also works.
 */
export const WORKER_ORIGIN: string =
  (import.meta.env.VITE_WORKER_ORIGIN as string | undefined) ??
  API_BASE_URL ??
  'https://zamproject-api.zamdonations.workers.dev';
