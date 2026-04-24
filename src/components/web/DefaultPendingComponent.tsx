export function DefaultPendingComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent rounded-lg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-100 w-100 rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>

        <div className="mt-8 space-y-3 flex flex-col items-center">
          <div className="h-4 w-32 animate-pulse rounded-full bg-emerald-800" />
          <div className="h-3 w-48 animate-pulse rounded-full bg-emerald-900" />
        </div>

        <span className="sr-only">Loading content...</span>
      </div>
    </div>
  );
}
