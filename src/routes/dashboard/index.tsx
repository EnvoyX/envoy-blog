import { getSession } from '@/data/session'
import { createFileRoute } from '@tanstack/react-router'
import { redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
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
