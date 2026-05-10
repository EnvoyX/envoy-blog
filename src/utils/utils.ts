import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Image } from "@/generated/prisma/browser";

export const downloadAlbumClientSide = async (albumName: string, images: Image[]) => {
  const zip = new JSZip();
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
