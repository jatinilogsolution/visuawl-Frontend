import { createFileRoute, Link, useNavigate, redirect } from '@tanstack/react-router'
import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { z }                from 'zod'
import { toast }            from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState }         from 'react'
import { useAuthStore }     from '@/store/authStore'
import { getAccessToken }   from '@/lib/api'
import { AuthLayout }       from '@/components/layout/AuthLayout'
import { Button }           from '@/components/ui/Button'
import { Input }            from '@/components/ui/Input'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (getAccessToken()) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate                = useNavigate()
  const { login, isLoading }   = useAuthStore()
  const [showPw, setShowPw]    = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back')
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your credentials to access the DOM"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          prefix={<Mail size={14} />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          prefix={<Lock size={14} />}
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="transition-colors hover:text-amber-400">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password"
            className="text-xs transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          No account?{' '}
          <Link to="/register"
            className="font-medium transition-colors hover:text-amber-400"
            style={{ color: 'var(--amber)' }}>
            Create workspace
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}