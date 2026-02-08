"use client";

import { useEffect } from "react";
import type { KlaroConfig, KlaroInstance, KlaroManager, KlaroWatcher } from "klaro";
import { klaroConfig } from "@/lib/consent/klaroConfig";

const emitAnalyticsConsent = (
  config: KlaroConfig,
  manager?: KlaroManager
) => {
  if (typeof window === "undefined" || !manager) return;
  window.dispatchEvent(
    new CustomEvent("consent:analytics", {
      detail: {
        consent: Boolean(manager.getConsent("analytics")),
        explicit: Boolean(manager.confirmed),
        config,
      },
    })
  );
};

export default function KlaroConsent() {
  useEffect(() => {
    let cancelled = false;
    let manager: KlaroManager | undefined;
    let handleOpen: (() => void) | undefined;

    const watcher: KlaroWatcher = {
      update(currentManager, eventName) {
        if (eventName === "consents") {
          emitAnalyticsConsent(klaroConfig, currentManager);
        }
      },
    };

    const init = async () => {
      const mod = await import("klaro");
      if (cancelled) return;
      const instance: KlaroInstance = (mod.default ?? mod) as KlaroInstance;
      if (typeof window === "undefined") return;

      instance.setup(klaroConfig);
      window.klaro = instance;

      manager = instance.getManager(klaroConfig);
      emitAnalyticsConsent(klaroConfig, manager);

      try {
        manager.watch?.(watcher);
      } catch (error) {
        console.error("Failed to attach Klaro watcher", error);
      }

      handleOpen = () => instance.show(klaroConfig);
      window.addEventListener("consent:open", handleOpen);
    };

    void init();

    return () => {
      cancelled = true;
      if (handleOpen) {
        window.removeEventListener("consent:open", handleOpen);
      }
      if (manager?.unwatch) {
        try {
          manager.unwatch(watcher);
        } catch (error) {
          console.error("Failed to detach Klaro watcher", error);
        }
      }
    };
  }, []);

  return null;
}
