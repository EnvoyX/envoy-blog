import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  LayoutGrid,
  ListTodo,
  Zap,
} from 'lucide-react'
import { fetchDashboardData, fetchDashboardTasksData } from '@/data/dashboard'
import { Separator } from '@/components/ui/separator'
import {
  QuranSkeleton,
  TaskListSkeleton,
} from '@/components/web/skeleton/dashboard-skeletons'
import { EmptyState } from '@/components/web/skeleton/dashboard-empty'
import { intlFormatDistance } from 'date-fns'

export const Route = createFileRoute('/dashboard/')({
  head: () => ({
    meta: [
      { title: 'Dashboard | Envoy Blog' },
      {
        name: 'Envoy Blog',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Dashboard | Envoy Blog' },
      {
        property: 'og:description',
        content: 'Dashboard Overview | Envoy Blog',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading: isLoadingDashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardData,
  })
  const { data: tasksData, isLoading: isLoadingTasksData } = useQuery({
    queryKey: ['dashboard-summary-tasks'],
    queryFn: fetchDashboardTasksData,
  })

  return (
    <div className="p-6 space-y-8 bg-[#09090b] min-h-screen text-zinc-100">
      {isLoadingDashboardData ? (
        <QuranSkeleton />
      ) : !data?.quranTrack ? (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <h3 className="font-bold">No Quran Progress</h3>
                <p className="text-zinc-500 text-sm">
                  Start your tilawah journey today.
                </p>
              </div>
            </div>
            <Link to="/dashboard/quran-tracker">
              <button className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer">
                Setup Tracker
              </button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 p-1 backdrop-blur-md">
          <div className="absolute top-0 right-0 max-sm:top-1/4 max-sm:right-1/4 p-8 opacity-10">
            <BookOpen size={120} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
              <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                <Flame className="text-white size-10" />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <h2 className="text-zinc-400 text-sm font-medium tracking-widest uppercase">
                Current Tilawah
              </h2>
              <div className="flex items-baseline gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold italic tracking-tighter">
                  {data?.quranTrack?.currentSurah ?? 'No Surah tracked yet'}
                </span>
                <span className="text-emerald-400 font-mono text-lg">
                  Ayat: {data?.quranTrack?.currentAyat ?? 'N/A'}
                </span>
              </div>
              <p className="text-zinc-500 text-sm italic">
                Keep the streak alive:{' '}
                {data?.quranTrack?.currentStreak ?? 'N/A'} days
              </p>
            </div>

            <div className="flex gap-4">
              <StatMini
                label="Juz"
                value={(data?.quranTrack?.currentJuz as string) ?? 'N/A'}
              />
              {/* <StatMini label="Progress" value="84%" color="text-emerald-400" /> */}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Activity className="text-emerald-400 size-5" />
              Activity Overview
            </h3>
            {isLoadingTasksData ? (
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-3 w-full bg-zinc-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : tasksData?.tasks?.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4">
                No active task data available yet.
              </p>
            ) : (
              <div className="space-y-4">
                <ProgressRow
                  label="Tasks Done"
                  current={tasksData?.doneTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-emerald-400"
                />
                <ProgressRow
                  label="In Progress"
                  current={tasksData?.inProgressTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-sky-400"
                />
                <ProgressRow
                  label="Unassigned Status"
                  current={tasksData?.todoTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-zinc-400"
                />
                <Separator className="bg-white/25" />
                <ProgressRow
                  label="Urgent Priority"
                  current={tasksData?.urgentTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-red-400"
                />
                <ProgressRow
                  label="High Priority"
                  current={tasksData?.highTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-orange-400"
                />
                <ProgressRow
                  label="Medium Priority"
                  current={tasksData?.mediumTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-amber-400"
                />
                <ProgressRow
                  label="Low Priority"
                  current={tasksData?.lowTasks.length as number}
                  total={tasksData?.tasks?.length as number}
                  color="bg-amber-200"
                />
              </div>
            )}
          </div>

          <Link to="/dashboard/task-tracker">
            <button className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95">
              <Zap className="fill-current size-4" />
              Create Task
            </button>
          </Link>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <LayoutGrid className="size-5 text-zinc-500" />
              Active Task Lists
            </h3>
            <Link
              to="/dashboard/task-tracker"
              className="text-xs text-zinc-500 font-mono uppercase hover:text-zinc-300"
            >
              View All
            </Link>
          </div>

          {isLoadingDashboardData ? (
            <TaskListSkeleton />
          ) : !data?.taksLists || data.taksLists.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No active Task Lists available"
              message="Organize your work by creating your first list."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.taksLists?.map((list) => (
                <Link
                  to="/dashboard/task-tracker/$taskListId"
                  params={{
                    taskListId: list.id,
                  }}
                >
                  <div
                    key={list.id}
                    className="group relative p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-800/40 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-zinc-200 group-hover:text-white">
                        {list.title}
                      </h4>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-1 mb-4">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <ListTodo size={12} /> {list.tasks.length} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Updated{' '}
                        {intlFormatDistance(
                          new Date(list.updatedAt),
                          new Date(),
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatMini({
  label,
  value,
  color = 'text-white',
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="px-4 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
        {label}
      </p>
      <p className={`text-lg font-bold text-center ${color}`}>{value}</p>
    </div>
  )
}

function ProgressRow({
  label,
  current,
  total,
  color,
}: {
  label: string
  current: number
  total: number
  color: string
}) {
  const percentage = (current / total) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200">
          {current}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
