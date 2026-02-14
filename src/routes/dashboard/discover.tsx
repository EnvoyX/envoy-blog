import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/discover')({
    head: () => ({
        meta: [
            { title: 'Discover | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/dashboard/discover"!</div>
}
