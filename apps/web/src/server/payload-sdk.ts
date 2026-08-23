import { env } from "@/env";
import { PayloadSDK } from "@payloadcms/sdk";
import type { Config } from "@repo/payload-cms-types";

export const payloadSdk = new PayloadSDK<Config>({
  baseURL: env.CMS_URL,
});
