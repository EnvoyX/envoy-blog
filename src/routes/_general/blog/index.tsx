import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/blog/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello Blog Page</div>
}
