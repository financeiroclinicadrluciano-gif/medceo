import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import nocturneCss from "../nocturne.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-halo-bg px-4 text-halo-text">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-semibold text-halo-primary">404</h1>
        <h2 className="mt-4 font-serif text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-halo-muted">
          O conteúdo que você procura não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded bg-halo-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-medceo-default transition-colors hover:bg-halo-primary-hover"
          >
            Voltar ao início
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
    <div className="flex min-h-screen items-center justify-center bg-halo-bg px-4 text-halo-text">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-xl font-semibold">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-halo-muted">
          Algo deu errado. Tente atualizar ou voltar para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded bg-halo-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-medceo-default hover:bg-halo-primary-hover"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-halo-text hover:bg-white/5"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

const TITLE = "MedCEO — Diagnóstico de Maturidade Empresarial para Clínicas";
const DESCRIPTION =
  "Diagnóstico gratuito em 20 perguntas para médicos donos de clínica. Descubra o nível de maturidade da operação, o gargalo prioritário e os próximos passos.";

const getSiteOrigin = createServerFn({ method: "GET" }).handler(
  () => getRequestUrl({ xForwardedHost: true }).origin,
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => getSiteOrigin(),
  head: ({ loaderData }) => {
    const origin = loaderData ?? "";
    const ogImage = origin ? new URL("/og.png", origin).toString() : "/og.png";

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { name: "author", content: "MedCEO" },
        { name: "theme-color", content: "#041019" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:site_name", content: "MedCEO" },
        ...(origin ? [{ property: "og:url", content: new URL("/", origin).toString() }] : []),
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        {
          property: "og:image:alt",
          content: "Diagnóstico MedCEO — a clínica continuaria crescendo sem o dono por 30 dias?",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "stylesheet", href: nocturneCss },
        { rel: "icon", href: "/logo.png" },
        ...(origin ? [{ rel: "canonical", href: new URL("/", origin).toString() }] : []),
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
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
      <Outlet />
    </QueryClientProvider>
  );
}
