"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ExternalLink } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import StickerBadge from "@/components/shared/StickerBadge";
import ChunkyButton from "@/components/shared/ChunkyButton";

const LICENSE_TEXT = `Non-Commercial Educational Use License

Copyright (c) 2024-present EnterMedSchool (Ari Horesh)
https://entermedschool.org

TERMS AND CONDITIONS

1. GRANT OF LICENSE

   All resources, tools, and content provided through EnterMedSchool.org
   (the "Materials") are licensed free of charge for non-commercial
   educational use, subject to the conditions below.

2. PERMITTED USE

   You may:

   a) Download resources for use in lectures and slides
   b) Embed tools and visuals on your website or learning management system
   c) Share materials with your students
   d) Modify content for use in your classes
   e) Print resources for educational handouts

3. RESTRICTIONS

   You may NOT:

   a) Sell, sublicense, or otherwise monetize the Materials
   b) Use the Materials for commercial purposes without prior written permission
   c) Remove, obscure, or alter any attribution notices
   d) Claim the Materials as your own original work

4. ATTRIBUTION

   All use of the Materials must include proper attribution to
   EnterMedSchool.org. Attribution must be clearly visible and include
   a reference to https://entermedschool.org.

   An attribution badge generator is available at:
   https://entermedschool.org/en/license#generator

5. COMMERCIAL USE

   Commercial use of any Materials requires prior written permission.
   Contact ari@entermedschool.com for commercial licensing inquiries.

6. NO WARRANTY

   THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
   IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
   CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
   MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.

7. SOURCE CODE

   The source code of the EnterMedSchool.org website and tools is made
   available under this same license at:
   https://github.com/enterMedSchool/Non-Profit

   You are free to study, fork, and contribute to the codebase under
   the same terms described above.

For questions, contact: ari@entermedschool.com`;

export default function FullLicenseViewer() {
  const t = useTranslations("license.fullLicense");
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <StickerBadge color="navy" size="sm">Legal</StickerBadge>
        <h2 className="font-display text-2xl font-extrabold text-ink-dark">
          {t("title")}
        </h2>
      </div>
      <p className="text-sm text-ink-muted mb-6">{t("description")}</p>

      <div className="group relative overflow-hidden rounded-2xl border-2 border-showcase-navy/15 bg-white/60 backdrop-blur-md shadow-lg transition-all hover:shadow-xl">
        {/* Shimmer */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />

        <button
          onClick={() => setExpanded(!expanded)}
          className="relative flex w-full items-center justify-between gap-3 px-6 py-5 text-start"
        >
          <span className="font-display text-sm font-bold text-ink-dark sm:text-base">
            {expanded ? t("collapseBtn") : t("expandBtn")}
          </span>
          <m.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown
              className={`h-5 w-5 transition-colors ${
                expanded ? "text-showcase-purple" : "text-ink-light"
              }`}
            />
          </m.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-showcase-navy/5 px-6 pb-6 pt-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink-muted sm:text-sm">
                  {LICENSE_TEXT}
                </pre>

                <div className="mt-6 flex flex-wrap gap-3">
                  <ChunkyButton
                    variant="ghost"
                    size="sm"
                    href="https://github.com/enterMedSchool/Non-Profit/blob/main/LICENSE"
                    external
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("viewOnGithub")}
                  </ChunkyButton>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
