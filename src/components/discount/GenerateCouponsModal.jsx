import { useState } from 'react'
import { COUPON_TYPES } from './constants'
import { FormField } from './FormField'
import { TagSvgIcon, CloseIcon } from './Icons'

export default function GenerateCouponsModal({ schemes, onSubmit, onClose }) {
    const [form, setForm] = useState({
        schemeId: schemes[0]?.id || '', type: 'SINGLE_USE', count: 5,
        prefix: '', maxUses: 1, validFrom: '', validTo: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.schemeId) { setError('Select a scheme'); return }
        if (!form.count || form.count < 1) { setError('Count must be at least 1'); return }
        setSubmitting(true); setError('')
        try {
            await onSubmit({
                schemeId: Number(form.schemeId), type: form.type, count: Number(form.count),
                prefix: form.prefix || null, maxUses: form.type === 'MULTI_USE' ? Number(form.maxUses) : 1,
                validFrom: form.validFrom || null, validTo: form.validTo || null,
            })
            onClose()
        } catch (err) { setError(err.message) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="org-modal-overlay">
            <div className="org-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row"><TagSvgIcon /><h3 className="org-modal-title">Generate Coupons</h3></div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    <FormField label="Discount Scheme" required>
                        <select className="org-form-input" value={form.schemeId} onChange={e => updateField('schemeId', e.target.value)}>
                            <option value="">-- Select Scheme --</option>
                            {schemes.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                        </select>
                    </FormField>
                    <div className="org-form-grid three-col">
                        <FormField label="Coupon Type">
                            <select className="org-form-input" value={form.type} onChange={e => updateField('type', e.target.value)}>
                                {COUPON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Count" required>
                            <input type="number" className="org-form-input" value={form.count} onChange={e => updateField('count', e.target.value)} min={1} max={100} />
                        </FormField>
                        <FormField label="Prefix">
                            <input type="text" className="org-form-input" value={form.prefix} onChange={e => updateField('prefix', e.target.value)} placeholder="e.g. RAMADAN" />
                        </FormField>
                    </div>
                    {form.type === 'MULTI_USE' && (
                        <FormField label="Max Uses per Coupon">
                            <input type="number" className="org-form-input" value={form.maxUses} onChange={e => updateField('maxUses', e.target.value)} min={1} />
                        </FormField>
                    )}
                    <div className="org-form-grid">
                        <FormField label="Valid From"><input type="datetime-local" className="org-form-input" value={form.validFrom} onChange={e => updateField('validFrom', e.target.value)} /></FormField>
                        <FormField label="Valid To"><input type="datetime-local" className="org-form-input" value={form.validTo} onChange={e => updateField('validTo', e.target.value)} /></FormField>
                    </div>
                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? 'Generating...' : `Generate ${form.count} Coupon${Number(form.count) !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
