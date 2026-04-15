import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/tic-tac-toe/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/tic-tac-toe/"!</div>
}
