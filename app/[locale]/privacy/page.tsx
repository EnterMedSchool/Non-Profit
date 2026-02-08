import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Shield, Lock, Eye, Sparkles } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { getWebPageJsonLd } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";
  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      url: `${BASE_URL}/${locale}/privacy`,
      type: "website",
    },
  };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://entermedschool.org";

  return (
    <main className="relative z-10 py-12 sm:py-20">
      {/* JSON-LD structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebPageJsonLd("Privacy Policy", "EnterMedSchool.org privacy policy - how we handle information on our website.", `${BASE_URL}/en/privacy`)) }} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* ── Hero Section ── */}
        <PageHero
          titleHighlight="Privacy"
          titlePost="Policy"
          gradient="from-showcase-teal via-showcase-green to-showcase-purple"
          annotation="your data stays yours!"
          annotationColor="text-showcase-teal"
          subtitle="We respect your privacy. Here is how we handle information on our website."
          floatingIcons={<>
            <Shield className="absolute left-[8%] top-[10%] h-8 w-8 text-showcase-teal/15 animate-float-gentle" style={{ animationDelay: "0s" }} />
            <Lock className="absolute right-[12%] top-[5%] h-7 w-7 text-showcase-green/15 animate-float-playful" style={{ animationDelay: "1s" }} />
            <Eye className="absolute left-[18%] bottom-[5%] h-6 w-6 text-showcase-purple/15 animate-float-gentle" style={{ animationDelay: "2s" }} />
            <Sparkles className="absolute right-[20%] bottom-[10%] h-5 w-5 text-showcase-teal/15 animate-float-playful" style={{ animationDelay: "0.5s" }} />
          </>}
        />

        {/* Content -- glassmorphism card */}
        <AnimatedSection delay={0.15} animation="blurIn">
          <div className="group relative mt-10 overflow-hidden rounded-2xl border-2 border-showcase-teal/20 bg-white/60 backdrop-blur-md p-6 shadow-lg transition-all hover:shadow-xl sm:p-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink-dark prose-p:text-ink-muted prose-a:text-showcase-purple prose-strong:text-ink-dark">
            {/* Shimmer overlay */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative">
              <p><strong>Last updated:</strong> February 2026</p>

              <h2>Overview</h2>
              <p>EnterMedSchool.org (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains how we handle information when you visit our website.</p>

              <h2>Information We Collect</h2>
              <p>EnterMedSchool.org is a public, static website. We do not require registration, login, or any personal information to use our resources.</p>
              <p><strong>We do NOT collect:</strong></p>
              <ul>
                <li>Personal identification information</li>
                <li>Email addresses (unless you contact us directly)</li>
                <li>Payment information</li>
                <li>User-generated content</li>
              </ul>

              <h2>Cookies</h2>
              <p>We use a minimal set of cookies:</p>
              <ul>
                <li><strong>Essential cookies:</strong> A single cookie to store your cookie consent preferences. This is strictly necessary for the website to function.</li>
                <li><strong>Analytics cookies (optional):</strong> If you consent, we use Plausible Analytics, a privacy-friendly analytics service that does not use cookies for tracking. Plausible does not collect personal data and is fully GDPR compliant.</li>
              </ul>
              <p>You can manage your cookie preferences at any time using the &ldquo;Cookie Settings&rdquo; link in the footer.</p>

              <h2>Analytics</h2>
              <p>With your consent, we use Plausible Analytics to understand aggregate usage patterns. Plausible is privacy-focused and does not track individuals, use cookies for identification, or collect personal data. All data is aggregated and anonymous.</p>

              <h2>Third-Party Links</h2>
              <p>Our website may contain links to entermedschool.com and other external sites. We are not responsible for the privacy practices of other sites. We encourage you to review their privacy policies.</p>

              <h2>Children&rsquo;s Privacy</h2>
              <p>Our website is intended for educational use by medical students and professors. We do not knowingly collect information from children under 13.</p>

              <h2>Changes to This Policy</h2>
              <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>

              <h2>Contact</h2>
              <p>If you have questions about this privacy policy, contact us at <a href="mailto:ari@entermedschool.com">ari@entermedschool.com</a>.</p>

              <h2>Data Controller</h2>
              <p>EnterMedSchool.org is a project by EnterMedSchool. For more information, visit <a href="https://entermedschool.com" target="_blank" rel="noopener noreferrer">entermedschool.com</a>.</p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
