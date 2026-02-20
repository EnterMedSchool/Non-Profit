import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getToolById } from "@/data/tools";
import { calculatorRegistry } from "@/components/tools/calculators";
import { algorithmRegistry } from "@/components/tools/algorithms";
import CalculatorLoader from "@/components/tools/calculators/CalculatorLoader";
import AlgorithmEmbedLoader from "@/components/tools/algorithms/AlgorithmEmbedLoader";
import EmbedAttribution from "@/components/tools/EmbedAttribution";
import EmbedThemeProvider from "@/components/tools/EmbedThemeProvider";
import { routing } from "@/i18n/routing";
import { decodeTheme, getVisibleSections } from "@/lib/embedTheme";

export const dynamic = "force-dynamic";

interface EmbedPageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ theme?: string }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const { locale, id } = await params;
  const { theme: themeParam } = await searchParams;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const tool = getToolById(id);
  if (!tool) {
    notFound();
  }

  if (id === "illustration-maker") {
    notFound();
  }

  const isAlgorithm = !!algorithmRegistry[id];
  const isCalculator = !!calculatorRegistry[id];

  if (!isAlgorithm && !isCalculator) {
    notFound();
  }

  const theme = decodeTheme(themeParam);
  const visibleSections = getVisibleSections(theme);

  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EmbedThemeProvider theme={theme}>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1 p-4 sm:p-6">
            {isAlgorithm ? (
              <AlgorithmEmbedLoader id={id} />
            ) : (
              <CalculatorLoader
                id={id}
                compact={theme.cp}
                visibleSections={visibleSections}
                themed
              />
            )}
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
