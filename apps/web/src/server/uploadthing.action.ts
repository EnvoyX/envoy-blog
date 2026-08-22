import { utapi } from "./utapi";

export async function deleteFiles(fileKeys: string | null | (string | null)[]) {
  if (!fileKeys) return;

  // If it's a single key
  if (typeof fileKeys === "string") {
    if (fileKeys.trim() === "") return; // null or empty ignore
    return await utapi.deleteFiles(fileKeys);
  }

  // If it's an array
  const validKeys = fileKeys.filter((key) => key && key.trim() !== "");

  if (!validKeys.length) return; // null or empty ignore

  return await utapi.deleteFiles(validKeys as string[]);
}
