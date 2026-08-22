import { createId } from '@paralleldrive/cuid2';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Effect } from 'effect';
import { Grid2x2, ListIcon, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { match } from 'ts-pattern';

import { saveImageUrl } from '@/data/image';
import { imageGalleryOptions } from '@/data/query-options/dashboardQueryOptions';
import { cn } from '@/lib/utils';
import { useSettingStore } from '@/store/settings';

import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
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
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [fileProgress, setFileProgress] = useState<Record<number, number | 'done' | 'error'>>({});
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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
    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('No valid image files found');
      return;
    } else if (validFiles.length !== files.length) {
      setError('Only image files are supported.');
      return;
    }
    setError(null);

    const srcsEffects = validFiles.map((file) => Effect.tryPromise(() => readFile(file)));
    const srcs = await Effect.runPromise(
      Effect.all(srcsEffects, {
        concurrency: 10,
      }),
    );
    const newEntries: FileEntry[] = validFiles.map((file, i) => ({ file, src: srcs[i] as string }));
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
      toast.error('API Key missing', { description: 'Set your API Key in settings.' });
      throw new Error('No API key');
    }

    const setProgress = (progress: number | 'done' | 'error') =>
      setFileProgress((prev) => ({ ...prev, [index]: progress }));

    setProgress(10);

    const base64 = entry.src.includes(',') ? entry.src.split(',')[1] : entry.src;
    const formData = new FormData();
    formData.append('image', base64 as string);
    formData.append('name', entry.file.name.replace(/\.[^.]+$/, ''));

    setProgress(30);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${ImgbbAPIKey}`, {
      method: 'POST',
      body: formData,
    });

    setProgress(70);

    if (!res.ok) throw new Error(`ImgBB responded with ${res.status}`);
    const json: ImgBBResponse = await res.json();
    if (!json.success) throw new Error('ImgBB upload failed');

    setProgress(85);

    await saveImageUrl({
      data: {
        id: createId(),
        url: json.data.url,
        filename: json.data.image.filename,
        size: String(json.data.size),
        imgbbId: json.data.id,
      },
    });

    setProgress('done');
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
        setFileProgress((prev) => ({ ...prev, [i]: 'error' }));
        toast.error(`Failed: ${entries[i].file.name}`, {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setUploading(false);

    if (!hadError) {
      setEntries([]);
      setFileProgress({});
      void queryClient.invalidateQueries({ queryKey: [...imageGalleryOptions().queryKey] });
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
            <p className="text-emerald-300 font-semibold">Drop or Upload images here</p>
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
            e.target.value = '';
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
        <ButtonGroup orientation="horizontal" aria-label="Media controls" className="h-fit">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={() => setViewMode('list')}
          >
            <ListIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={() => setViewMode('grid')}
          >
            <Grid2x2 />
          </Button>
          <Button
            disabled={uploading}
            variant="destructive"
            size="icon"
            className="cursor-pointer"
            onClick={() => {
              setEntries([]);
              setFileProgress({});
            }}
          >
            <Trash2 />
          </Button>
        </ButtonGroup>
      )}
      {entries.length > 0 && (
        <AnimatePresence mode="wait">
          {match(viewMode)
            .with('list', () => (
              <motion.ul key="list" className={cn('space-y-2 flex flex-col')} exit={{ opacity: 0 }}>
                {entries.map((entry, i) => {
                  const progress = fileProgress[i];
                  const itemKey = entry.src;
                  return (
                    <motion.li
                      key={itemKey}
                      className={cn(
                        'overflow-hidden transition-all flex items-center gap-3 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700',
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                        delay: i * 0.1,
                      }}
                    >
                      <img
                        src={entry.src}
                        alt={entry.file.name}
                        className={cn('w-10 h-10 rounded-lg object-cover shrink-0')}
                      />
                      <div className={cn('flex-1 min-w-0 space-y-1')}>
                        <p className="text-slate-200 text-xs truncate">{entry.file.name}</p>
                        {typeof progress === 'number' && (
                          <div className="w-full bg-slate-700 rounded-full h-1">
                            <div
                              className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        {progress === 'done' && (
                          <p className="text-emerald-400 text-xs">Uploaded ✓</p>
                        )}
                        {progress === 'error' && <p className="text-red-400 text-xs">Failed ✗</p>}
                      </div>
                      {!uploading && progress !== 'done' && (
                        <button
                          onClick={() => removeEntry(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </motion.ul>
            ))
            .with('grid', () => (
              <motion.ul
                key="grid"
                className={cn(
                  'space-y-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2',
                )}
                exit={{ opacity: 0 }}
              >
                {entries.map((entry, i) => {
                  const progress = fileProgress[i];
                  const itemKey = entry.src;
                  return (
                    <motion.li
                      key={itemKey}
                      className={cn('group flex flex-col gap-3')}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut',
                        delay: i * 0.1,
                      }}
                    >
                      <div className="overflow-hidden transition-all relative aspect-square w-full rounded-2xl  group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-focus:ring-2 group-focus:ring-emerald-500 group cursor-pointer">
                        <img
                          src={entry.src}
                          alt={entry.file.name}
                          className={cn(
                            'h-full w-full object-contain transition-transform duration-500 group-hover:scale-110',
                          )}
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8 rounded-full opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-black/40 backdrop-blur-xl border-white/10 text-white hover:text-red-400 hover:bg-black/60 hover:scale-110 shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeEntry(i);
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className={cn('flex-1 min-w-0 space-y-1')}>
                        <p className="text-slate-200 text-xs truncate">{entry.file.name}</p>
                        {typeof progress === 'number' && (
                          <div className="w-full bg-slate-700 rounded-full h-1">
                            <div
                              className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        {progress === 'done' && (
                          <p className="text-emerald-400 text-xs text-center">Uploaded ✓</p>
                        )}
                        {progress === 'error' && (
                          <p className="text-red-400 text-xs text-center">Failed ✗</p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            ))
            .exhaustive()}
        </AnimatePresence>
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
            : `Upload ${entries.length} image${entries.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
