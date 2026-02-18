import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/journal/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello Journal page</div>
}
