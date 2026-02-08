"use client";

import { useEffect } from "react";
import { type EmbedTheme, themeToCSS, getFontOption } from "@/lib/embedTheme";

interface EmbedThemeProviderProps {
  theme: EmbedTheme;
  children: React.ReactNode;
}

/**
 * Client wrapper that applies CSS custom properties from the decoded embed
 * theme onto a container div. Also injects a Google Fonts <link> when a
 * non-system font is chosen.
 */
export default function EmbedThemeProvider({
  theme,
  children,
}: EmbedThemeProviderProps) {
  const font = getFontOption(theme.ff);

  // Dynamically inject Google Fonts stylesheet when a custom font is selected
  useEffect(() => {
    if (!font.googleUrl) return;

    const id = `embed-font-${theme.ff}`;
    if (document.getElementById(id)) return; // already injected

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = font.googleUrl;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [font.googleUrl, theme.ff]);

  const cssVars = themeToCSS(theme);

  return (
    <div style={cssVars} className="min-h-screen">
      {children}
    </div>
  );
}
