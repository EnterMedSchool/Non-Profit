import type { KlaroConfig } from "klaro";
import enMessages from "@/i18n/messages/en.json";

export const CONSENT_STORAGE_KEY = "ems-org-consent";

const consent = (enMessages as { consent?: Record<string, unknown> }).consent as {
  acceptAll: string;
  acceptSelected: string;
  decline: string;
  ok: string;
  save: string;
  poweredBy: string;
  consentNotice: { title: string; changeDescription: string; description: string; learnMore: string };
  consentModal: { title: string; description: string };
  purposes: { essential: string; analytics: string };
  essential: { title: string; description: string };
  analytics: { title: string; description: string };
  privacyPolicy: { name: string; text: string };
  services: { essential: string; analytics: string };
};

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
  privacyPolicy: "/privacy",
  translations: {
    en: {
      acceptAll: consent.acceptAll,
      acceptSelected: consent.acceptSelected,
      decline: consent.decline,
      ok: consent.ok,
      save: consent.save,
      poweredBy: consent.poweredBy,
      consentNotice: consent.consentNotice,
      consentModal: consent.consentModal,
      purposes: consent.purposes,
      essential: consent.essential,
      analytics: consent.analytics,
      privacyPolicy: consent.privacyPolicy,
    },
  },
  services: [
    {
      name: "essential",
      title: consent.services.essential,
      purposes: ["essential"],
      required: true,
      default: true,
      onlyOnce: true,
      cookies: [CONSENT_STORAGE_KEY],
    },
    {
      name: "analytics",
      title: consent.services.analytics,
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
