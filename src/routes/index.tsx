import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/components/component-example'
import { Navbar } from '@/components/web/navbar'

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
        <main>
            <Navbar />
            <ComponentExample />
        </main>
    )
}
