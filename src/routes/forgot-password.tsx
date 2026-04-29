import { createFileRoute, Link }  from '@tanstack/react-router'
import { useForm }                 from 'react-hook-form'
import { zodResolver }             from '@hookform/resolvers/zod'
import { z }                       from 'zod'
import { useState }                from 'react'
import { Mail, CheckCircle }       from 'lucide-react'
import { apiPost }                 from '@/lib/api'
import { AuthLayout }              from '@/components/layout/AuthLayout'
import { Button }                  from '@/components/ui/Button'
import { Input }                   from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [sent, setSent]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await apiPost('/users/forgot-password', { email: data.email })
      setSentEmail(data.email)
      setSent(true)
    } catch {
      // Always show success — backend never reveals if email exists
      setSentEmail(data.email)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Inbox"
        subtitle={`We sent a reset link to ${sentEmail}`}
        backLink={
          <Link to="/login"
            className="text-xs flex items-center gap-1.5 transition-colors hover:text-amber-400"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ← Back to sign in
          </Link>
        }
      >
        <div className="space-y-6">
          <div
            className="flex items-center justify-center w-14 h-14"
            style={{ background: 'var(--amber-glow)', border: '1px solid var(--amber-dim)', borderRadius: 'var(--radius-md)' }}
          >
            <CheckCircle size={24} className="text-amber-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If that email exists in our system, you will receive a password
              reset link within a few minutes.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Link expires in 2 hours.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setSent(false)}
            >
              Send another link
            </Button>
            <Link to="/login" className="block">
              <Button variant="ghost" fullWidth>
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email and we'll send a reset link"
      backLink={
        <Link to="/login"
          className="text-xs flex items-center gap-1.5 transition-colors hover:text-amber-400"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ← Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          prefix={<Mail size={14} />}
          error={errors.email?.message}
          autoFocus
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  )
}
