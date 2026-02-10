import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getToolById } from "@/data/tools";
import { calculatorRegistry } from "@/components/tools/calculators";
import CalculatorLoader from "@/components/tools/calculators/CalculatorLoader";
import EmbedAttribution from "@/components/tools/EmbedAttribution";
import EmbedThemeProvider from "@/components/tools/EmbedThemeProvider";
import { routing } from "@/i18n/routing";
import { decodeTheme, getVisibleSections } from "@/lib/embedTheme";

// Embed pages read searchParams (theme config) so they must be dynamic
export const dynamic = "force-dynamic";

interface EmbedPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { locale, id } = await params;
  const { theme: themeParam } = await searchParams;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Validate tool exists
  const tool = getToolById(id);
  if (!tool) {
    notFound();
  }

  // The illustration maker has its own full-screen route at /create
  if (id === "illustration-maker") {
    notFound();
  }

  // Check if there's a calculator component for this tool
  if (!calculatorRegistry[id]) {
    notFound();
  }

  // Decode theme from URL parameter (falls back to defaults)
  const theme = decodeTheme(themeParam);
  const visibleSections = getVisibleSections(theme);

  // Load messages for the locale
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EmbedThemeProvider theme={theme}>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 p-4 sm:p-6">
            <CalculatorLoader
              id={id}
              compact={theme.cp}
              visibleSections={visibleSections}
              themed
            />
          </main>
          <EmbedAttribution
            toolId={id}
            locale={locale}
            variant={theme.ab}
          />
        </div>
      </EmbedThemeProvider>
    </NextIntlClientProvider>
  );
}
