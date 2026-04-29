import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/executions')({
  component: ExecutionsLayout,
})

function ExecutionsLayout() {
  return <Outlet />
}
