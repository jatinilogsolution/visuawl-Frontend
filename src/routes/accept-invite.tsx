import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { toast }         from 'react-hot-toast'
import { useState }      from 'react'
import { Eye, EyeOff, Lock, User, AlertTriangle, CheckCircle } from 'lucide-react'
import { apiPost }       from '@/lib/api'
import { AuthLayout }    from '@/components/layout/AuthLayout'
import { Button }        from '@/components/ui/Button'
import { Input }         from '@/components/ui/Input'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName:  z.string().min(1, 'Required'),
  password:  z.string()
    .min(8,    'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type FormData = z.infer<typeof schema>
type SearchParams = { token?: string }

export const Route = createFileRoute('/accept-invite')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: search.token as string | undefined,
  }),
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const { token }             = Route.useSearch()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout title="Invalid Invitation" subtitle="This invitation link is missing or broken">
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 p-4"
            style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}
          >
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">No invitation token found in the URL.</p>
          </div>
          <Link to="/login">
            <Button variant="primary" fullWidth>Go to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="Account Created!" subtitle="You can now sign in to your new account">
        <div className="space-y-6">
          <div
            className="flex items-center justify-center w-14 h-14"
            style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle size={24} className="text-amber-400" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your account has been created successfully. Use your email and password to sign in.
          </p>
          <Link to="/login">
            <Button variant="primary" size="lg" fullWidth>Sign In Now</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await apiPost('/users/invite/accept', {
        token:     token,
        firstName: data.firstName,
        lastName:  data.lastName,
        password:  data.password,
      })
      setDone(true)
      toast.success('Welcome aboard!')
    } catch (err: any) {
      const code = err?.response?.data?.code
      if (code === 'TOKEN_EXPIRED') {
        toast.error('Invitation has expired. Request a new one from your team admin.')
      } else if (code === 'INVALID_TOKEN') {
        toast.error('Invalid invitation token.')
      } else {
        toast.error(err?.response?.data?.message || 'Failed to accept invitation')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Accept Invitation"
      subtitle="Complete your profile to join your team"
    >
      {/* Info banner */}
      <div
        className="flex items-center gap-3 p-3 mb-6"
        style={{
          background:   'var(--amber-glow)',
          border:       '1px solid var(--amber-dim)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <CheckCircle size={14} className="text-amber-400 shrink-0" />
        <p className="text-xs" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
          Invitation verified — set your password to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 stagger">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            prefix={<User size={14} />}
            error={errors.firstName?.message}
            autoFocus
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Create a strong password"
          prefix={<Lock size={14} />}
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="transition-colors hover:text-amber-400">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Repeat password"
          prefix={<Lock size={14} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Activate Account
        </Button>
      </form>
    </AuthLayout>
  )
}
