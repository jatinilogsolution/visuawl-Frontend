import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile, useChangePassword } from '@/hooks/useSettings'
import { SettingSection } from '../SettingSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const profileSchema = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
        .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match', path: ['confirmPassword'],
})

export function ProfileSection() {
    const { profile, fetchMe, tenant } = useAuthStore()
    const updateProfile = useUpdateProfile()
    const changePwd = useChangePassword()
    const [showPw, setShowPw] = useState(false)

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { firstName: profile?.firstName || '', lastName: profile?.lastName || '' },
    })

    const pwdForm = useForm({ resolver: zodResolver(passwordSchema) })

    const onProfile = profileForm.handleSubmit(async data => {
        await updateProfile.mutateAsync(data)
        fetchMe()
    })

    const onPassword = pwdForm.handleSubmit(async data => {
        await changePwd.mutateAsync(data)
        pwdForm.reset()
    })

    return (
        <div>
            <div className="mb-8">
                <div className="text-xs tracking-widest uppercase mb-1"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    account
                </div>
                <h1 className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    Profile
                </h1>
            </div>

            {/* Avatar */}
            <SettingSection title="Identity">
                <div className="flex items-center gap-4 mb-6">
                    {tenant?.logoUrl ?

                    <div className=' w-30 h-15 flex items-center justify-center overflow-hidden'>

                       <img src={tenant.logoUrl}
                       alt='logo'
                       className='max-w-full max-h-full object-contain'
                       />
                    </div>

                        :  <div
                            className="w-14 h-14 flex items-center justify-center text-lg font-bold"
                            style={{
                                background: 'var(--amber-dim)',
                                color: 'var(--amber)',
                                fontFamily: 'var(--font-mono)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            {getInitials(profile?.firstName, profile?.lastName)}
                        </div>}
                    <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {profile?.firstName} {profile?.lastName}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {profile?.email}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                            {profile?.role?.replace('tenant_', '')}
                        </div>
                    </div>
                </div>


                <form onSubmit={onProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" error={profileForm.formState.errors.firstName?.message}
                            {...profileForm.register('firstName')} />
                        <Input label="Last Name" error={profileForm.formState.errors.lastName?.message}
                            {...profileForm.register('lastName')} />
                    </div>
                    <Button type="submit" variant="primary" size="md" loading={updateProfile.isPending}>
                        Save Profile
                    </Button>
                </form>
            </SettingSection>

            {/* Change password */}
            <SettingSection title="Change Password">
                <form onSubmit={onPassword} className="space-y-4">
                    <Input label="Current Password" type={showPw ? 'text' : 'password'}
                        error={pwdForm.formState.errors.currentPassword?.message}
                        suffix={<button type="button" onClick={() => setShowPw(!showPw)}>
                            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>}
                        {...pwdForm.register('currentPassword')} />
                    <Input label="New Password" type={showPw ? 'text' : 'password'}
                        hint="8+ characters, 1 uppercase, 1 number"
                        error={pwdForm.formState.errors.newPassword?.message}
                        {...pwdForm.register('newPassword')} />
                    <Input label="Confirm New Password" type={showPw ? 'text' : 'password'}
                        error={pwdForm.formState.errors.confirmPassword?.message}
                        {...pwdForm.register('confirmPassword')} />
                    <Button type="submit" variant="secondary" size="md" loading={changePwd.isPending}>
                        Change Password
                    </Button>
                </form>
            </SettingSection>
        </div>
    )
}
