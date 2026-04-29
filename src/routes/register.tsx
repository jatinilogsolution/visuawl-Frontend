import { createFileRoute, Link, useNavigate, redirect } from '@tanstack/react-router'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { toast }         from 'react-hot-toast'
import { useState }      from 'react'
import { Eye, EyeOff, Building2, Mail, Lock, User } from 'lucide-react'
import { useAuthStore }  from '@/store/authStore'
import { getAccessToken } from '@/lib/api'
import { AuthLayout }    from '@/components/layout/AuthLayout'
import { Button }        from '@/components/ui/Button'
import { Input }         from '@/components/ui/Input'

const schema = z.object({
  companyName: z.string().min(2,  'Company name must be at least 2 characters'),
  email:       z.string().email('Enter a valid email'),
  password:    z.string()
    .min(8,    'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  firstName:   z.string().min(1, 'Required'),
  lastName:    z.string().min(1, 'Required'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (getAccessToken()) throw redirect({ to: '/dashboard' })
  },
  component: RegisterPage,
})

function RegisterPage() {
  const navigate              = useNavigate()
  const { register: regFn, isLoading } = useAuthStore()
  const [showPw, setShowPw]   = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const password = watch('password', '')

  const strengthChecks = [
    { label: '8+ characters',    ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number',           ok: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data: FormData) => {
    try {
      await regFn({
        companyName: data.companyName,
        email:       data.email,
        password:    data.password,
        firstName:   data.firstName,
        lastName:    data.lastName,
      })
      toast.success('Workspace created')
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <AuthLayout
      title="Create Workspace"
      subtitle="Set up your VISUAWL account"
      backLink={
        <Link to="/login"
          className="text-xs flex items-center gap-1.5 transition-colors hover:text-amber-400"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ← Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 stagger">

        {/* Company */}
        <Input
          label="Company / Workspace Name"
          placeholder="Acme Corporation"
          prefix={<Building2 size={14} />}
          error={errors.companyName?.message}
          {...register('companyName')}
        />

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            prefix={<User size={14} />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {/* Email */}
        <Input
          label="Work Email"
          type="email"
          placeholder="john@acme.com"
          prefix={<Mail size={14} />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password */}
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

        {/* Password strength */}
        {password.length > 0 && (
          <div className="flex gap-3">
            {strengthChecks.map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${ok ? 'bg-green-400' : 'bg-(--border-light)'}`} />
                <span className="text-xs" style={{
                  color: ok ? 'var(--green)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Confirm */}
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
          loading={isLoading}
          className="mt-2"
        >
          Create Workspace
        </Button>

        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login"
            className="font-medium transition-colors hover:text-amber-400"
            style={{ color: 'var(--amber)' }}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}