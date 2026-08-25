import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: "o7hc0ctd",
  dataset: "production",
  useCdn: process.env.NODE_ENV === "production",
  apiVersion: "2026-05-15",
});

const builder = createImageUrlBuilder(sanityClient);
export const urlFor = (source: any) => builder.image(source);
