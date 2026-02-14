import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/components/component-example'
import { Navbar } from '@/components/web/navbar'

export const Route = createFileRoute('/')({

    head: () => ({
        meta: [
            { title: 'Home | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
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
