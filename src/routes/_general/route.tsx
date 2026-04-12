import { Footer } from '@/components/web/footer'
import { Navbar } from '@/components/web/navbar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_general')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 to-cyan-500/30 linear text-slate-50 selection:bg-cyan-500/30">
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  )
}
