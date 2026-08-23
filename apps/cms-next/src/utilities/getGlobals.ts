import type { Config } from "@repo/payload-cms-types";
import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { type DataFromGlobalSlug, getPayload } from "payload";

type Global = keyof Config["globals"];

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise });

  const global = await payload.findGlobal({
    depth,
    slug,
  });

  return global;
}

/** Returns a unstable_cache function mapped with the cache tag for the slug */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  unstable_cache(async () => getGlobal<T>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  });
