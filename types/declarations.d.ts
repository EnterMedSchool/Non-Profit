declare module "latex.js" {
  export class HtmlGenerator {
    constructor(options?: { hyphenate?: boolean });
  }
  export function parse(
    input: string,
    options?: { generator?: HtmlGenerator },
  ): { htmlDocument(): Document };
}

declare module "klaro/dist/klaro.css" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "klaro" {
  export interface KlaroConfig {
    version?: number;
    elementID?: string;
    styling?: {
      theme?: string[];
    };
    storageMethod?: string;
    storageName?: string;
    cookieName?: string;
    cookieExpiresAfterDays?: number;
    default?: boolean;
    mustConsent?: boolean;
    acceptAll?: boolean;
    hideDeclineAll?: boolean;
    groupByPurpose?: boolean;
    privacyPolicy?: string;
    translations?: Record<string, unknown>;
    services?: KlaroService[];
  }

  export interface KlaroService {
    name: string;
    title?: string;
    purposes?: string[];
    required?: boolean;
    default?: boolean;
    onlyOnce?: boolean;
    cookies?: Array<string | RegExp>;
    callback?: (consent: boolean) => void;
  }

  export interface KlaroManager {
    getConsent(name: string): boolean;
    confirmed?: boolean;
    watch?(watcher: KlaroWatcher): void;
    unwatch?(watcher: KlaroWatcher): void;
  }

  export interface KlaroWatcher {
    update(manager: KlaroManager, eventName: string): void;
  }

  export interface KlaroInstance {
    setup(config: KlaroConfig): void;
    show(config: KlaroConfig): void;
    getManager(config: KlaroConfig): KlaroManager;
  }

  const klaro: KlaroInstance;
  export default klaro;
}

interface Window {
  klaro?: import("klaro").KlaroInstance;
}
