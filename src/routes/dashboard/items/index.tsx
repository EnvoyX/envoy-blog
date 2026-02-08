import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/items/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/dashboard/items/"!</div>
}
