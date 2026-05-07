import { useRef, useState, useCallback } from "react";
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
import { useSelector } from "@tanstack/react-store";
import { imageUploadModalStore } from "@/store/imageUploadStore";
import { useUploadThing } from "@/utils/uploadthing";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import {
  CropperRef,
  CircleStencil,
  Cropper,
  Coordinates,
  CropperPreviewRef,
  ImageRestriction,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { FlipHorizontal, FlipVertical } from "lucide-react";

function applyEditToCanvas(
  source: HTMLImageElement,
  rotation: number,
  naturalW: number,
  naturalH: number,
): string {
  const rad = (rotation * Math.PI) / 180;
  const swapped = rotation === 90 || rotation === 270;

  // dimensions after rotation
  const rotW = swapped ? naturalH : naturalW;
  const rotH = swapped ? naturalW : naturalH;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // draw rotated source, then crop
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = rotW;
  tmpCanvas.height = rotH;
  const tmpCtx = tmpCanvas.getContext("2d")!;
  tmpCtx.translate(rotW / 2, rotH / 2);
  tmpCtx.rotate(rad);
  tmpCtx.drawImage(source, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
  ctx.drawImage(tmpCanvas, 0, 0);
  return canvas.toDataURL("image/jpeg", 1);
}

export function UploadThingModal() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isDialogOpen = useSelector(imageUploadModalStore, (state) => state.isDialogOpen);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [editedSrc, setEditedSrc] = useState<string | null>(null);
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  // const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cropperRef = useRef<CropperRef>(null);
  const previewRef = useRef<CropperPreviewRef>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    setFile(f);
    setError(null);
    setRotation(0);
    setIsCropping(false);
    setEditedSrc(null);
    setEditedFile(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(e.target?.result as string);
      imageUploadModalStore.setState((prev) => ({ ...prev, isDialogOpen: true }));
    };
    reader.readAsDataURL(f);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const applyEdits = useCallback(() => {
    if (!imgRef.current || !previewSrc) return;
    const img = imgRef.current;
    const result = applyEditToCanvas(img, rotation, img.naturalWidth, img.naturalHeight);
    setEditedSrc(result);
    setIsCropping(false);
  }, [rotation, previewSrc]);

  function rotate(deg: number) {
    setRotation((r) => (r + deg + 360) % 360);
    setEditedSrc(null);
    setEditedFile(null);
  }

  function resetEdits() {
    setRotation(0);
    setEditedSrc(null);
    setEditedFile(null);
    setIsCropping(false);
  }

  // rotate & flip while cropping
  function flipWhileCrop(horizontal: boolean, vertical: boolean) {
    if (cropperRef.current) {
      cropperRef.current.flipImage(horizontal, vertical);
    }
  }
  function rotateWhileCrop(angle: number) {
    if (cropperRef.current) {
      cropperRef.current.rotateImage(angle);
    }
  }

  // UploadThing
  const { startUpload } = useUploadThing("updateProfilePicture", {
    onBeforeUploadBegin(files) {
      toast.loading(`Presigning URL for profile image...`, {
        id: "presigning-url",
      });
      return files;
    },
    onUploadBegin: (filename: string) => {
      setUploading(true);
      setError(null);
      toast.dismiss("presigning-url");
      toast.info(`Upload has begun for profile image`, {
        description: `Uploading ${filename}`,
      });
    },
    onUploadProgress(p) {
      if (p === 0) {
        setProgress(p);
        toast.loading(`Uploading profile image...`, {
          id: "upload-profile-image",
          description: `Starting upload...`,
        });
      }
      if (p < 100) {
        setProgress(p);
        toast.loading(`Uploading profile image...`, {
          id: "upload-profile-image",
          description: `${p}%`,
        });
      }
      if (p === 100) {
        setProgress(p);
        toast.loading(`Uploading profile image...`, {
          id: "upload-profile-image",
          description: `Finalizing upload...`,
        });
      }
    },
    onClientUploadComplete: () => {
      toast.dismiss("upload-profile-image");
      toast.success(`Profile image uploaded successfully!`);
      imageUploadModalStore.setState((prev) => ({ ...prev, isDialogOpen: false }));
      setFile(null);
      setPreviewSrc(null);
      setEditedSrc(null);
      setEditedFile(null);
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
      void router.invalidate();
    },
    onUploadError: (e) => {
      setError(e.message ?? "Upload failed");
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
      toast.dismiss("upload-profile-image");
      toast.error(`Failed to upload profile image`, {
        description: e.message,
      });
    },
    uploadProgressGranularity: "fine",
  });

  const displaySrc = editedSrc ?? previewSrc;

  function onCrop() {
    if (cropperRef.current) {
      setCoordinates(cropperRef.current.getCoordinates());
      // You are able to do different manipulations at a canvas
      // but there we just get a cropped image, that can be used
      // as src for <img/> to preview result
      setEditedSrc(cropperRef.current.getCanvas()?.toDataURL() as string);
      const canvas = cropperRef.current?.getCanvas();
      if (canvas) {
        canvas.toBlob((blob) => {
          console.log("Blob: ", blob);
          if (blob) {
            const newFile = new File([blob], `${file?.name}-cropped`, {
              // blob.type ---> if don't specify type it defaults to png. choose either jpeg or webp for better compression
              // type: blob.type,
              type: "image/jpeg",
            });
            console.log("New File: ", newFile);
            setEditedFile(newFile);
          }
        }, "image/jpeg");
      }
      setIsCropping(false);
    }
  }

  function onUpdate(cropper: CropperRef) {
    previewRef.current?.update(cropper);
  }

  async function onUpload() {
    console.log("EditedFile: ", editedFile);
    if (editedSrc && editedFile) {
      await startUpload([editedFile]);
      return;
    } else {
      const fileToUpload = file;
      console.log("File: ", fileToUpload);

      if (fileToUpload) await startUpload([fileToUpload]);
      return;
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!uploading) imageUploadModalStore.setState((prev) => ({ ...prev, isDialogOpen: open }));
        resetEdits();
      }}
    >
      <DialogContent
        className="max-w-2xl max-sm:max-w-sm bg-slate-900 border-emerald-900 text-slate-100 p-0 overflow-auto
                     shadow-[0_0_60px_rgba(52,211,153,0.15)] "
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-emerald-400 text-lg font-semibold">
            Edit &amp; Upload
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Crop or rotate your image before uploading.
          </DialogDescription>
        </DialogHeader>

        {!file && !isCropping && (
          <div className="max-w-sm mx-auto space-y-8">
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
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
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
          </div>
        )}
        {file && !isCropping && (
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
                    className={cn("w-full object-contain", {
                      "object-cover rounded-full": editedSrc,
                    })}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.3s ease",
                      maxHeight: 360,
                      display: "block",
                    }}
                    crossOrigin="anonymous"
                  />
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

              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => {
                  setFile(null);
                  resetEdits();
                }}
              >
                Reset Image
              </Button>

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
        )}
        {isCropping && (
          <Cropper
            src={previewSrc}
            ref={cropperRef}
            onUpdate={onUpdate}
            stencilComponent={CircleStencil}
            stencilProps={{
              aspectRatio: 1 / 1,
              movable: isMobile ? false : true,
              resizable: true,
              lines: true,
              handlers: false,
            }}
            imageRestriction={isMobile ? ImageRestriction.stencil : undefined}
          />
        )}
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

        {isCropping && (
          <div className="flex flex-wrap w-full items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
              onClick={() => rotateWhileCrop(-90)}
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
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
              onClick={() => rotateWhileCrop(90)}
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
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
              onClick={() => flipWhileCrop(true, false)}
            >
              <FlipHorizontal />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:border-emerald-600 hover:text-emerald-300"
              onClick={() => flipWhileCrop(false, true)}
            >
              <FlipVertical />
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
                  variant="default"
                  className="text-white"
                  disabled={uploading}
                  onClick={onCrop}
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
        )}

        <DialogFooter className="px-6 pb-6 gap-2">
          {file && !isCropping && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 shadow-[0_0_20px_rgba(52,211,153,0.3)]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || isCropping}
              onClick={onUpload}
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
                "Upload"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
