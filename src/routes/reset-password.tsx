import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { z }                  from 'zod'
import { toast }              from 'react-hot-toast'
import { useState }           from 'react'
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react'
import { apiPost }            from '@/lib/api'
import { AuthLayout }         from '@/components/layout/AuthLayout'
import { Button }             from '@/components/ui/Button'
import { Input }              from '@/components/ui/Input'

const schema = z.object({
  newPassword: z.string()
    .min(8,    'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

// Token comes from ?token= query param
type SearchParams = { token?: string }

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: search.token as string | undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token }             = Route.useSearch()
  const navigate              = useNavigate()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This reset link is invalid or has expired">
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 p-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}
          >
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">No reset token found in the URL.</p>
          </div>
          <Link to="/forgot-password">
            <Button variant="primary" fullWidth>Request a new link</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await apiPost('/users/reset-password', {
        token:       token,
        newPassword: data.newPassword,
      })
      toast.success('Password reset successfully')
      navigate({ to: '/login' })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Reset failed'
      const code = err?.response?.data?.code

      if (code === 'TOKEN_EXPIRED') {
        toast.error('Reset link has expired. Request a new one.')
      } else if (code === 'INVALID_TOKEN') {
        toast.error('This link is invalid or already used.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="New Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Create a strong password"
          prefix={<Lock size={14} />}
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="transition-colors hover:text-amber-400">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.newPassword?.message}
          autoFocus
          {...register('newPassword')}
        />

        <Input
          label="Confirm New Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Repeat password"
          prefix={<Lock size={14} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div
          className="p-3 text-xs"
          style={{
            background:   'var(--bg-elevated)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color:        'var(--text-muted)',
            fontFamily:   'var(--font-mono)',
          }}
        >
          Min 8 characters · 1 uppercase · 1 number
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Reset Password
        </Button>

        <Link to="/login" className="block">
          <Button variant="ghost" fullWidth>
            Back to sign in
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}