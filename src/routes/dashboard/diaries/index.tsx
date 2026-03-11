import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/diaries/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="px-4 min-h-screen flex flex-col">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold">Diaries</h1>
                <p className="text-muted-foreground">Your own private diary entries.</p>
            </div>
        </div>
    )
}
