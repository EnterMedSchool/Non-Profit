"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CONSENT_STORAGE_KEY, klaroConfig } from "@/lib/consent/klaroConfig";

const KlaroConsent = dynamic(() => import("@/components/consent/KlaroConsent"), {
  ssr: false,
});

type IdleCallbackWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout: number }
    ) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

type StoredConsentState = {
  analytics?: boolean;
  version?: number;
};

const CONFIG_VERSION =
  typeof klaroConfig.version === "number" ? klaroConfig.version : 0;

function parseStoredConsent(): StoredConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_STORAGE_KEY}=([^;]+)`)
  );
  if (!match) return null;
  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded);
    const consents =
      typeof parsed.consents === "object" && parsed.consents !== null
        ? parsed.consents
        : undefined;
    const analytics =
      consents && typeof consents.analytics === "boolean"
        ? (consents.analytics as boolean)
        : undefined;
    const versionCandidates = [
      parsed.version,
      parsed.consentVersion,
      parsed.configVersion,
    ];
    const version = versionCandidates.find(
      (value) => typeof value === "number"
    ) as number | undefined;
    return { analytics, version };
  } catch {
    return null;
  }
}

function emitStoredAnalytics(consent: boolean | undefined) {
  if (typeof window === "undefined" || typeof consent === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("consent:analytics", {
      detail: {
        consent,
        explicit: true,
        config: klaroConfig,
        source: "stored-consent",
      },
    })
  );
}

export default function DeferredConsent() {
  const storedConsent = useMemo(() => parseStoredConsent(), []);
  const [shouldLoad, setShouldLoad] = useState(() => {
    if (!storedConsent) return true;
    const storedVersion =
      typeof storedConsent.version === "number" ? storedConsent.version : 0;
    return storedVersion < CONFIG_VERSION;
  });
  const [ready, setReady] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  const primeConsentManager = useCallback(() => {
    void import("@/components/consent/KlaroConsent");
  }, []);

  useEffect(() => {
    emitStoredAnalytics(storedConsent?.analytics);
  }, [storedConsent?.analytics]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpenRequest = () => {
      if (ready) return;
      setPendingOpen(true);
      setShouldLoad(true);
    };
    window.addEventListener("consent:open", handleOpenRequest);
    return () => window.removeEventListener("consent:open", handleOpenRequest);
  }, [ready]);

  useEffect(() => {
    if (ready || !shouldLoad) return;
    if (typeof window === "undefined") return;

    void import("klaro/dist/klaro.css").then(
      () => import("@/styles/klaro-consent.css")
    );

    let cancelled = false;
    const idleWindow = window as IdleCallbackWindow;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(enable, { timeout: 1500 });
    } else {
      timeoutHandle = setTimeout(enable, 800);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    };
  }, [ready, shouldLoad]);

  useEffect(() => {
    if (!ready || !pendingOpen) return;
    setPendingOpen(false);
    window.dispatchEvent(new CustomEvent("consent:open"));
  }, [pendingOpen, ready]);

  useEffect(() => {
    if (!shouldLoad || ready) return;
    primeConsentManager();
  }, [primeConsentManager, ready, shouldLoad]);

  return ready ? <KlaroConsent /> : null;
}
