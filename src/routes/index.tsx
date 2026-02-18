import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/web/navbar'
import LandingPage from '@/components/landing-page'

export const Route = createFileRoute('/')({

    head: () => ({
        meta: [
            { title: 'Home | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to my TanStack Start playground!',
            },
            { property: 'og:title', content: "Home | Envoy Blog" },
            { property: 'og:description', content: "Welcome to my TanStack Start playground" },
            { property: 'og:image', content: "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'website' },
        ],
    }),
    component: App
})

function App() {
    return (
        <main className="min-h-screen bg-linear-to-b from-slate-950 to-cyan-500/30 linear text-slate-50 selection:bg-cyan-500/30">
            <Navbar />
            <LandingPage />
        </main>
    )
}
