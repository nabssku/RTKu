declare module "next-pwa" {
  import { NextConfig } from "next";
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    dynamicStartUrl?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    buildExcludes?: Array<string | RegExp>;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    customWorkerDir?: string;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}

declare module "qrcode";
