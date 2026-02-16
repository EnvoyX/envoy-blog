import { getSession } from '@/data/session'
import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
    head: () => ({
        meta: [
            { title: 'Dashboard | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
            { property: 'og:title', content: "Dashboard | Envoy Blog" },
            { property: 'og:description', content: "Dashboard Overview | Envoy Blog" },
            { property: 'og:image', content: "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'website' },
        ],
    }),
    component: RouteComponent,
    beforeLoad: () => {
        throw redirect({
            to: "/dashboard/import"
        })
    },
    loader: () => getSession()
})

function RouteComponent() {
    const data = Route.useLoaderData()
    return <div>Hello {data.user.name}</div>
}
