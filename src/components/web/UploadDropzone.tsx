import { saveImageUrl } from "@/data/image";
import { useSettingStore } from "@/store/settings";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
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
interface FileEntry {
  file: File;
  src: string;
}

export default function UploadDropzone() {
  const router = useRouter();
  const { ImgbbAPIKey } = useSettingStore();

  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [fileProgress, setFileProgress] = useState<Record<number, number | "done" | "error">>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(files: File[]) {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setError("No valid image files found");
      return;
    } else if (validFiles.length !== files.length) {
      setError("Only image files are supported.");
      return;
    }
    setError(null);

    const srcs = await Promise.all(validFiles.map((file) => readFile(file)));
    const newEntries: FileEntry[] = validFiles.map((file, i) => ({ file, src: srcs[i] }));
    setEntries((prev) => [...prev, ...newEntries]);
    setFileProgress({});
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files;
    if (dropped) void handleFiles(Array.from(dropped));
  }, []);

  async function uploadEntry(entry: FileEntry, index: number): Promise<void> {
    if (!ImgbbAPIKey) {
      toast.error("API Key missing", { description: "Set your API Key in settings." });
      throw new Error("No API key");
    }

    const setProgress = (progress: number | "done" | "error") =>
      setFileProgress((prev) => ({ ...prev, [index]: progress }));

    setProgress(10);

    const base64 = entry.src.includes(",") ? entry.src.split(",")[1] : entry.src;
    const formData = new FormData();
    formData.append("image", base64);
    formData.append("name", entry.file.name.replace(/\.[^.]+$/, ""));

    setProgress(30);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${ImgbbAPIKey}`, {
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
        size: String(json.data.size),
        imgbbId: json.data.id,
      },
    });

    setProgress("done");
  }

  async function onUploadAll() {
    if (entries.length === 0) return;
    setUploading(true);
    setError(null);

    let hadError = false;

    for (let i = 0; i < entries.length; i++) {
      try {
        await uploadEntry(entries[i], i);
        toast.success(`Uploaded ${entries[i].file.name}`);
      } catch (err) {
        hadError = true;
        setFileProgress((prev) => ({ ...prev, [i]: "error" }));
        toast.error(`Failed: ${entries[i].file.name}`, {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setUploading(false);

    if (!hadError) {
      setEntries([]);
      setFileProgress({});
      void router.invalidate();
    }
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setFileProgress((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  return (
    <div className="w-full mx-auto space-y-8">
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
            <p className="text-emerald-300 font-semibold">Drop images here</p>
            <p className="text-slate-500 text-sm mt-1">
              or click to browse · PNG, JPG, GIF, WebP up to 32 MB
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(Array.from(e.target.files));
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
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, i) => {
            const progress = fileProgress[i];
            return (
              <li
                key={i}
                className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700"
              >
                <img
                  src={entry.src}
                  alt={entry.file.name}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-slate-200 text-xs truncate">{entry.file.name}</p>
                  {typeof progress === "number" && (
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div
                        className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {progress === "done" && <p className="text-emerald-400 text-xs">Uploaded ✓</p>}
                  {progress === "error" && <p className="text-red-400 text-xs">Failed ✗</p>}
                </div>
                {!uploading && progress !== "done" && (
                  <button
                    onClick={() => removeEntry(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {entries.length > 0 && (
        <button
          disabled={uploading}
          onClick={() => void onUploadAll()}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-semibold rounded-xl py-2.5 transition-colors
                     shadow-[0_0_20px_rgba(52,211,153,0.2)] cursor-pointer"
        >
          {uploading
            ? `Uploading…`
            : `Upload ${entries.length} image${entries.length > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}
