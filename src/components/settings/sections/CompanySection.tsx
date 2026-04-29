import { useEffect }       from 'react'
import { useForm }         from 'react-hook-form'
import { useAuthStore }    from '@/store/authStore'
import { useUpdateCompany } from '@/hooks/useSettings'
import { SettingSection }  from '../SettingSection'
import { Input }           from '@/components/ui/Input'
import { Button }          from '@/components/ui/Button'

export function CompanySection() {
  const { tenant, fetchMe } = useAuthStore()
  const updateCompany       = useUpdateCompany()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name:     tenant?.name     || '',
      phone:    '',
      country:  '',
      timezone: 'Asia/Kolkata',
      logoUrl:  tenant?.logoUrl || '',
    },
  })

  useEffect(() => {
    reset({
      name: tenant?.name || '',
      phone: '',
      country: '',
      timezone: 'Asia/Kolkata',
      logoUrl: tenant?.logoUrl || '',
    })
  }, [tenant?.name, tenant?.logoUrl, reset])

  const onSubmit = handleSubmit(async data => {
    console.log(data)
    await updateCompany.mutateAsync(data)
    await fetchMe()
  })

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-widest uppercase mb-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>workspace</div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Company
        </h1>
      </div>

      <SettingSection title="Workspace Details"
        subtitle="Updates are encrypted before storage">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Company Name" {...register('name')} />
          <Input label="Phone" type="tel" placeholder="+91 9999999999" {...register('phone')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Country Code" placeholder="IN" {...register('country')} />
            <Input label="Timezone" placeholder="Asia/Kolkata" {...register('timezone')} />
          </div>
          <Input label="Logo URL" type="url" placeholder="https://..." {...register('logoUrl')} />
          <Button type="submit" variant="primary" size="md" loading={updateCompany.isPending}>
            Save Company Details
          </Button>
        </form>
      </SettingSection>

      {/* Workspace info */}
      <SettingSection title="Workspace Info">
        <div className="space-y-3">
          {[
            { label: 'Slug',   value: tenant?.slug   },
            { label: 'Status', value: tenant?.status },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-xs uppercase tracking-widest"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {label}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {value || '—'}
              </span>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}
