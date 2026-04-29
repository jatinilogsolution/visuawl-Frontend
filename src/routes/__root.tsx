import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#f59e0b', secondary: '#08090c' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#08090c' },
          },
        }}
      />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})