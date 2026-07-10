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
            className="inline-flex items-center justify-center rounded-full bg-halo-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070807] transition-colors hover:bg-halo-primary-hover"
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
            className="inline-flex items-center justify-center rounded-full bg-halo-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#070807] hover:bg-halo-primary-hover"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-halo-text hover:bg-white/5"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

const TITLE = "MedCEO · Diagnóstico de Maturidade Empresarial Médica";
const DESCRIPTION =
  "Diagnóstico gratuito para médicos donos de clínica. Descubra o nível de maturidade da sua operação e receba um plano estratégico de 12 meses.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "MedCEO" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { title: "Lovable App" },
      { property: "og:title", content: "Lovable App" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "description", content: "Chic Website Design creates and deploys premium, refined websites with fine-tuned adjustments." },
      { property: "og:description", content: "Chic Website Design creates and deploys premium, refined websites with fine-tuned adjustments." },
      { name: "twitter:description", content: "Chic Website Design creates and deploys premium, refined websites with fine-tuned adjustments." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/XOeNX6cvz2Y2unUIBU3s4iZz4cH3/social-images/social-1783713256991-ChatGPT-Image-1-de-jun.-de-2026_-16_12_15_(1).webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/XOeNX6cvz2Y2unUIBU3s4iZz4cH3/social-images/social-1783713256991-ChatGPT-Image-1-de-jun.-de-2026_-16_12_15_(1).webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap",
      },
    ],
  }),
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
