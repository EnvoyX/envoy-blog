import { createFileRoute } from "@tanstack/react-router";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getImagesFn, saveImageUrl } from "@/data/image";
import PhotoGallery from "@/components/web/PhotoGallery";
import { useRouter } from "@tanstack/react-router";

interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    delete_url: string;
    image: { url: string; filename: string; extension: string };
    thumb: { url: string };
    medium?: { url: string };
  };
  success: boolean;
  status: number;
}

// interface UploadedImage {
//   id: string;
//   url: string;
//   thumbUrl: string;
//   deleteUrl: string;
//   filename: string;
//   size: string;
//   savedAt: string;
// }

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function applyEditToCanvas(
  source: HTMLImageElement,
  rotation: number,
  crop: CropRect,
  naturalW: number,
  naturalH: number,
): string {
  const rad = (rotation * Math.PI) / 180;
  const swapped = rotation === 90 || rotation === 270;

  // dimensions after rotation
  const rotW = swapped ? naturalH : naturalW;
  const rotH = swapped ? naturalW : naturalH;

  // compute cropped region in rotated-image space
  const cropX = (crop.x / 100) * rotW;
  const cropY = (crop.y / 100) * rotH;
  const cropW = (crop.w / 100) * rotW;
  const cropH = (crop.h / 100) * rotH;

  const canvas = document.createElement("canvas");
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext("2d")!;

  // draw rotated source, then crop
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = rotW;
  tmpCanvas.height = rotH;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.translate(rotW / 2, rotH / 2);
  tmpCtx.rotate(rad);
  tmpCtx.drawImage(source, -naturalW / 2, -naturalH / 2, naturalW, naturalH);

  ctx.drawImage(tmpCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function CropOverlay({ crop, onChange }: { crop: CropRect; onChange: (c: CropRect) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    type: "move" | "resize";
    handle?: string;
    startX: number;
    startY: number;
    startCrop: CropRect;
  } | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const onMouseDown = (e: React.MouseEvent, type: "move" | "resize", handle?: string) => {
    e.preventDefault();
    dragRef.current = {
      type,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
      const sc = dragRef.current.startCrop;

      if (dragRef.current.type === "move") {
        onChange({
          x: clamp(sc.x + dx, 0, 100 - sc.w),
          y: clamp(sc.y + dy, 0, 100 - sc.h),
          w: sc.w,
          h: sc.h,
        });
      } else {
        const h = dragRef.current.handle!;
        let { x, y, w, h: ch } = sc;
        const MIN = 10;
        if (h.includes("e")) w = clamp(sc.w + dx, MIN, 100 - x);
        if (h.includes("s")) ch = clamp(sc.h + dy, MIN, 100 - y);
        if (h.includes("w")) {
          const newX = clamp(sc.x + dx, 0, sc.x + sc.w - MIN);
          w = sc.w + sc.x - newX;
          x = newX;
        }
        if (h.includes("n")) {
          const newY = clamp(sc.y + dy, 0, sc.y + sc.h - MIN);
          ch = sc.h + sc.y - newY;
          y = newY;
        }
        onChange({ x, y, w, h: ch });
      }
    };
    const onMouseUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [crop, onChange]);

  const handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  const handlePos: Record<string, React.CSSProperties> = {
    n: { top: -5, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" },
    ne: { top: -5, right: -5, cursor: "ne-resize" },
    e: { right: -5, top: "50%", transform: "translateY(-50%)", cursor: "e-resize" },
    se: { bottom: -5, right: -5, cursor: "se-resize" },
    s: { bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" },
    sw: { bottom: -5, left: -5, cursor: "sw-resize" },
    w: { left: -5, top: "50%", transform: "translateY(-50%)", cursor: "w-resize" },
    nw: { top: -5, left: -5, cursor: "nw-resize" },
  };

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      {/* crop window */}
      <div
        className="absolute border-2 border-emerald-400 cursor-move"
        style={{
          left: `${crop.x}%`,
          top: `${crop.y}%`,
          width: `${crop.w}%`,
          height: `${crop.h}%`,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          background: "transparent",
        }}
        onMouseDown={(e) => onMouseDown(e, "move")}
      >
        {/* Rrle-of-thirds grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-emerald-300/50" />
          ))}
        </div>
        {/* resize handles */}
        {handles.map((h) => (
          <div
            key={h}
            className="absolute w-3 h-3 bg-emerald-400 rounded-sm border border-emerald-600 z-10"
            style={handlePos[h]}
            onMouseDown={(e) => {
              e.stopPropagation();
              onMouseDown(e, "resize", h);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/image-upload/")({
  component: ImageUploader,
  loader: async () => {
    const images = await getImagesFn();
    return {
      images,
    };
  },
});

function ImageUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [editedSrc, setEditedSrc] = useState<string | null>(null);

  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState<CropRect>({ x: 5, y: 5, w: 90, h: 90 });
  const [isCropping, setIsCropping] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    setFile(f);
    setError(null);
    setRotation(0);
    setCrop({ x: 5, y: 5, w: 90, h: 90 });
    setIsCropping(false);
    setEditedSrc(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(e.target?.result as string);
      setDialogOpen(true);
    };
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const applyEdits = useCallback(() => {
    if (!imgRef.current || !previewSrc) return;
    const img = imgRef.current;
    const result = applyEditToCanvas(img, rotation, crop, img.naturalWidth, img.naturalHeight);
    setEditedSrc(result);
    setIsCropping(false);
  }, [rotation, crop, previewSrc]);

  const rotate = (deg: number) => {
    setRotation((r) => (r + deg + 360) % 360);
    setEditedSrc(null);
  };

  const resetEdits = () => {
    setRotation(0);
    setCrop({ x: 5, y: 5, w: 90, h: 90 });
    setEditedSrc(null);
    setIsCropping(false);
  };

  // ImgBB Upload
  const upload = async () => {
    const src = editedSrc ?? previewSrc;
    if (!src || !file) return;

    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      // convert data-URL to base64 string (strip prefix)
      const base64 = src.includes(",") ? src.split(",")[1] : src;

      const formData = new FormData();
      formData.append("image", base64);
      formData.append("name", file.name.replace(/\.[^.]+$/, ""));

      setProgress(30);

      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!res.ok) throw new Error(`ImgBB responded with ${res.status}`);
      const json: ImgBBResponse = await res.json();
      if (!json.success) throw new Error("ImgBB upload failed");

      setProgress(85);

      await saveImageUrl({
        data: {
          url: json.data.url,
          filename: json.data.image.filename,
          size: json.data.size,
          imgbbId: json.data.id,
        },
      });

      setProgress(100);

      // setUploadedImages((prev) => [
      //   {
      //     id: json.data.id,
      //     url: json.data.url,
      //     thumbUrl: json.data.thumb.url,
      //     deleteUrl: json.data.delete_url,
      //     filename: json.data.image.filename,
      //     size: `${Math.round(Number(json.data.size) / 1024)} KB`,
      //     savedAt: saved.savedAt,
      //   },
      //   ...prev,
      // ]);

      setDialogOpen(false);
      setFile(null);
      setPreviewSrc(null);
      setEditedSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
      void router.invalidate();
    }
  };

  const displaySrc = editedSrc ?? previewSrc;
  const { images } = Route.useLoaderData();
  const uploadedImages = images.filter((image) => image.source === "IMGBB");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-emerald-950/30 to-slate-950 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.4)]">
            Image Upload
          </h1>
          <p className="text-slate-400 text-sm">Crop, rotate, preview — then publish to ImgBB</p>
        </div>

        {/* drop zone */}
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-emerald-700 rounded-2xl p-14 text-center cursor-pointer
                     hover:border-emerald-400 hover:bg-emerald-950/30 transition-all duration-300 group"
        >
          <div className="flex flex-col items-center gap-3 pointer-events-none select-none">
            <div
              className="w-16 h-16 rounded-2xl bg-emerald-900/60 flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-700"
            >
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-emerald-300 font-semibold">Drop an image here</p>
              <p className="text-slate-500 text-sm mt-1">
                or click to browse · PNG, JPG, GIF, WebP up to 32 MB
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
            {error}
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-emerald-300 font-semibold text-sm uppercase tracking-widest">
                Uploaded
              </h2>
              <Separator className="flex-1 bg-emerald-900/60" />
              <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-xs">
                {uploadedImages.length}
              </Badge>
            </div>
            <PhotoGallery images={uploadedImages} type="private" />
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!uploading) setDialogOpen(o);
        }}
      >
        <DialogContent
          className="max-w-2xl bg-slate-900 border-emerald-900 text-slate-100 p-0 overflow-hidden
                     shadow-[0_0_60px_rgba(52,211,153,0.15)]"
        >
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-emerald-400 text-lg font-semibold">
              Edit &amp; Upload
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Crop or rotate your image before uploading.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-5">
            <div
              className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 select-none"
              style={{ minHeight: 280 }}
            >
              {displaySrc && (
                <>
                  <img
                    ref={imgRef}
                    src={displaySrc}
                    alt="preview"
                    className="w-full object-contain"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.3s ease",
                      maxHeight: 360,
                      display: "block",
                    }}
                    crossOrigin="anonymous"
                  />
                  {isCropping && <CropOverlay crop={crop} onChange={setCrop} />}
                </>
              )}
              {editedSrc && !isCropping && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-emerald-700 text-emerald-100 text-xs">Edits applied</Badge>
                </div>
              )}
            </div>

            {/* toolbar */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
                onClick={() => rotate(-90)}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Rotate Left
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
                onClick={() => rotate(90)}
              >
                <svg
                  className="w-4 h-4 mr-1 scale-x-[-1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Rotate Right
              </Button>

              <Separator orientation="vertical" className="h-8 bg-slate-700" />

              {!isCropping ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
                  onClick={() => setIsCropping(true)}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 3v4.5m0 0H3m4.5 0H21M3 16.5h13.5m0 0V21m0-4.5H21"
                    />
                  </svg>
                  Crop
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={applyEdits}
                  >
                    Apply Crop
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-200"
                    onClick={() => setIsCropping(false)}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {(editedSrc || rotation !== 0) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-red-400 ml-auto"
                  onClick={resetEdits}
                >
                  Reset
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-700 [&>div]:bg-emerald-500" />
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 gap-2">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-200"
              disabled={uploading}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 shadow-[0_0_20px_rgba(52,211,153,0.3)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || isCropping}
              onClick={upload}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Uploading…
                </span>
              ) : (
                "Upload to ImgBB"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
