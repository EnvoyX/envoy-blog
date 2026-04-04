export function QuranSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1 backdrop-blur-md animate-pulse">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6">
        <div className="h-20 w-20 rounded-2xl bg-zinc-800" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-8 w-64 bg-zinc-800 rounded" />
          <div className="h-3 w-40 bg-zinc-800 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-20 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 animate-pulse"
        >
          <div className="flex justify-between mb-4">
            <div className="h-5 w-32 bg-zinc-800 rounded" />
            <div className="h-2 w-2 rounded-full bg-zinc-800" />
          </div>
          <div className="h-4 w-full bg-zinc-800 rounded mb-4" />
          <div className="flex gap-3">
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
