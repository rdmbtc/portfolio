import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

// Applies the saved (or system) theme before first paint to avoid a
// light-mode flash when the visitor prefers dark mode.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "RDM",
  url: "https://therdm.dev",
  image: "https://avatars.githubusercontent.com/u/114354595?v=4",
  jobTitle: "Full-stack & Web3 Developer",
  description:
    "Full-stack developer building modern web products and Web3 dApps with React, TypeScript, and smart contracts.",
  sameAs: [
    "https://github.com/rdmbtc",
    "https://www.linkedin.com/in/natlusrun/",
    "https://www.x.com/@rdmnad",
    "https://youtube.com/@rdmdev",
  ],
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RDM — Full-stack & Web3 Developer · therdm.dev" },
      { name: "description", content: "Portfolio of RDM — full-stack developer shipping clean, modern web products and Web3 dApps with React, TypeScript, and smart contracts." },
      { name: "author", content: "RDM" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "RDM — Full-stack & Web3 Developer" },
      { property: "og:description", content: "Clean, modern web products and Web3 dApps. React, TypeScript, smart contracts." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://therdm.dev" },
      { property: "og:image", content: "https://therdm.dev/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@rdmnad" },
      { name: "twitter:creator", content: "@rdmnad" },
      { name: "twitter:title", content: "RDM — Full-stack & Web3 Developer" },
      { name: "twitter:description", content: "Clean, modern web products and Web3 dApps. React, TypeScript, smart contracts." },
      { name: "twitter:image", content: "https://therdm.dev/og.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "canonical",
        href: "https://therdm.dev",
      },
      {
        rel: "preload",
        as: "image",
        href: "/frames/frame_0001.jpg",
      },
    ],
    scripts: [
      { children: themeInitScript },
      { type: "application/ld+json", children: personJsonLd },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
