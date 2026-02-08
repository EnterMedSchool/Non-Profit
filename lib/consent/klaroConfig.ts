import type { KlaroConfig } from "klaro";

export const CONSENT_STORAGE_KEY = "ems-org-consent";

const analyticsCookieNames: Array<string | RegExp> = [
  "_ga",
  "_gid",
  "_gat",
  /_ga_.*/,
  /_gcl_.*/,
  /_gid.*/,
  /_gat_.*/,
  /__utm.*/,
];

const expireCookies = (patterns: Array<string | RegExp>) => {
  if (typeof document === "undefined") return;
  const allCookies = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(Boolean);

  const matchesPattern = (name: string, pattern: string | RegExp) => {
    if (typeof pattern === "string") {
      if (pattern === name) return true;
      if (pattern.includes("*")) {
        const escaped = pattern
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\\*/g, ".*");
        return new RegExp(`^${escaped}$`).test(name);
      }
      return false;
    }
    return pattern.test(name);
  };

  const expire = (cookieName: string, domain?: string) => {
    const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
    const base = `${cookieName}=; Expires=${expires}; Max-Age=0; Path=/;`;
    document.cookie = base;
    if (domain) {
      document.cookie = `${cookieName}=; Expires=${expires}; Max-Age=0; Path=/; Domain=${domain};`;
    }
  };

  const host =
    typeof window !== "undefined" ? window.location.hostname : undefined;
  const domainCandidates = host
    ? host
        .split(".")
        .map((_, index, parts) => `.${parts.slice(index).join(".")}`)
    : [];

  allCookies.forEach((cookieName) => {
    if (patterns.some((pattern) => matchesPattern(cookieName, pattern))) {
      expire(cookieName);
      domainCandidates.forEach((domain) => expire(cookieName, domain));
    }
  });
};

export const klaroConfig: KlaroConfig = {
  version: 1,
  elementID: "ems-klaro",
  styling: {
    theme: ["light", "bottom", "wide", "ems"],
  },
  storageMethod: "cookie",
  storageName: CONSENT_STORAGE_KEY,
  cookieName: CONSENT_STORAGE_KEY,
  cookieExpiresAfterDays: 365,
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  groupByPurpose: true,
  privacyPolicy: "/en/privacy",
  translations: {
    en: {
      acceptAll: "Enable everything",
      acceptSelected: "Save selection",
      decline: "Keep essentials only",
      ok: "Enable analytics",
      save: "Save selection",
      poweredBy: "Consent manager by Klaro",
      consentNotice: {
        title: "Control your privacy",
        changeDescription:
          "We tweaked our cookie settings; please review your choices.",
        description:
          "We rely on essential cookies to keep EnterMedSchool.org working. Optional analytics help us understand how our resources are used so we can keep improving.",
        learnMore: "Review preferences",
      },
      consentModal: {
        title: "Personalize your privacy settings",
        description:
          "Choose the services you'd like to enable. You can revisit these settings any time via the footer link or by clearing your cookies.",
      },
      purposes: {
        essential: "Strictly necessary",
        analytics: "Analytics",
      },
      essential: {
        title: "Essential cookies",
        description:
          "Required for the website to function properly. These stay on to keep EnterMedSchool.org working.",
      },
      analytics: {
        title: "Performance & insights",
        description:
          "Enable privacy-friendly Plausible analytics so we can see aggregate usage patterns and keep improving our free resources.",
      },
      privacyPolicy: {
        name: "privacy notice",
        text: "Read the details in our {privacyPolicy}.",
      },
    },
  },
  services: [
    {
      name: "essential",
      title: "Essential cookies",
      purposes: ["essential"],
      required: true,
      default: true,
      onlyOnce: true,
      cookies: [CONSENT_STORAGE_KEY],
    },
    {
      name: "analytics",
      title: "Usage analytics",
      default: false,
      purposes: ["analytics"],
      cookies: analyticsCookieNames,
      callback: (consent) => {
        if (typeof window === "undefined") return;
        window.dispatchEvent(
          new CustomEvent("consent:analytics", {
            detail: { consent },
          })
        );
        if (!consent) {
          expireCookies(analyticsCookieNames);
        }
      },
    },
  ],
};

export type { KlaroConfig };
