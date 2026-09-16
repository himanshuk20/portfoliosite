import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Locked down to exactly what this site actually loads at runtime:
// Google Fonts stylesheet/font files and the Web3Forms contact-form endpoint.
// No inline/remote script sources beyond the app's own bundle and the small
// hydration payload TanStack Start inlines, no third-party frames, no object
// embeds. Update this if a future feature needs a new external origin.
//
// "upgrade-insecure-requests" is appended only for HTTPS requests (see
// isHttpsRequest below) — sending it over a plain-HTTP preview (e.g. a phone
// on the same LAN hitting http://192.168.x.x during local testing) makes the
// browser try to upgrade every asset request to https:// on a host that has
// no TLS listener there, so CSS/JS silently fail to load and the page renders
// unstyled. Real deployments (Vercel/Cloudflare) are HTTPS-only, so this only
// ever omits the directive during local/LAN dev, never in production.
const BASE_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://api.web3forms.com",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
];

// Trusts X-Forwarded-Proto because Vercel/Cloudflare terminate TLS in front of
// this handler and forward over plain HTTP internally — request.url alone
// would read as "http:" even for a real HTTPS visitor.
function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

// Applied to every response (including error pages) so the site can't be
// framed, MIME-sniffed, or leak more referrer/permission info than it needs to.
function applySecurityHeaders(request: Request, response: Response): Response {
  const secure = isHttpsRequest(request);
  const csp = secure
    ? [...BASE_CONTENT_SECURITY_POLICY, "upgrade-insecure-requests"].join("; ")
    : BASE_CONTENT_SECURITY_POLICY.join("; ");

  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", csp);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  // HSTS only makes sense (and is only honored by browsers) on an HTTPS
  // response; sending it over plain HTTP is a no-op at best and confusing at
  // worst, so skip it during local/LAN HTTP previews.
  if (secure) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return applySecurityHeaders(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return applySecurityHeaders(
        request,
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
