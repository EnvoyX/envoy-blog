import pkg from "file-saver";
import JSZip from "jszip";

import { Image } from "@/generated/prisma/browser";

export const downloadAlbumClientSide = async (albumName: string, images: Image[]) => {
  const zip = new JSZip();
  const { saveAs } = pkg;
  const folder = zip.folder(albumName);

  if (!folder) return;

  const downloadPromises = images.map(async (image) => {
    try {
      const response = await fetch(`/api/proxy-image?url=${image.url}`);

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      folder.file(`${image.id}.jpg`, blob);
    } catch (error) {
      console.error(`Could not download image ${image.id}:`, error);
    }
  });

  await Promise.all(downloadPromises);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${albumName.replace(/\s+/g, "_")}.zip`);
};

export async function downloadExternalFile(
  externalUrl: string | undefined,
  fileName: string | undefined,
) {
  if (!externalUrl || !fileName) return;
  try {
    const response = await fetch(externalUrl, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("External download failed:", error);
    window.open(externalUrl, "_blank");
  }
}
