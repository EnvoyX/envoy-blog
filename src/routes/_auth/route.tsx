import { buttonVariants } from '@/components/ui/button'
import { getUserData } from '@/data/session'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: async () => {
    const data = await getUserData()
    if (data.session || data.user) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-emerald-500/30 linear text-slate-50 selection:bg-emerald-500/30">
      <div className="absolute top-8 left-8">
        <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex min-h-screen justify-center items-center">
        <Outlet />
      </div>
    </div>
  )
}
