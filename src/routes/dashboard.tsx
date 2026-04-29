import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useEffect, useState }               from 'react'
import { getAccessToken }                    from '@/lib/api'
import { useAuthStore }                      from '@/store/authStore'
import { DashboardLayout }                   from '@/components/layout/DashboardLayout'
import { PageLoader }                        from '@/components/ui/Spinner'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const token = getAccessToken()
    if (!token) throw redirect({ to: '/login' })
  },
  component: DashboardGuard,
})

function DashboardGuard() {
  const { fetchMe, profile } = useAuthStore()
  const [booting, setBooting] = useState(!profile)

  useEffect(() => {
    if (!profile) {
      fetchMe().finally(() => setBooting(false))
    } else {
      setBooting(false)
    }
  }, [])

  if (booting) return <PageLoader />

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
