import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAccessToken }            from '@/lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = getAccessToken()
    if (token) {
      throw redirect({ to: '/dashboard' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
  component: () => null,
})