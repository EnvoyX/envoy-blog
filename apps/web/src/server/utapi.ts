import { env } from "@/env";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  // ...options,
  token: env.UPLOADTHING_TOKEN,
});
