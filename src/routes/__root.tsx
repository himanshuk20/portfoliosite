import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts, Link, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PortfolioShell } from "../components/portfolio-shell";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "Himanshu Giri — Product Manager" },
    { name: "description", content: "Himanshu Giri — Product Manager, builder and B.Tech IT graduate." },
  ], links: [
    { rel: "stylesheet", href: appCss },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" },
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  ]}),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => <div className="empty-page"><h1>404</h1><p>This page doesn't exist.</p><Link to="/">Back home</Link></div>,
  errorComponent: ErrorComponent,
});

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('himanshu-portfolio-theme');document.documentElement.dataset.theme=(t==='dark'||t==='light')?t:'light';}catch(e){document.documentElement.dataset.theme='light';}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "portfolio_root" }); }, [error]);
  return <div className="empty-page"><h1>Something went wrong</h1><p>{error.message}</p><button onClick={() => { router.invalidate(); reset(); }}>Try again</button></div>;
}
function RootComponent() { const { queryClient } = Route.useRouteContext(); return <QueryClientProvider client={queryClient}><PortfolioShell><Outlet /></PortfolioShell></QueryClientProvider>; }
