import { useState, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:9988'

/* ===== API Helpers ===== */
async function fetchJSON(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
    return res.json()
}

async function postJSON(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: '*/*' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`POST ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

async function putJSON(url, body) {
    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: '*/*' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`PUT ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

/* ===== Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const ChevronDownIcon = ({ open }) => (
    <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`org-chevron ${open ? 'open' : ''}`}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const TerminalSvgIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

const SettingsGearIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

const GroupIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
)

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const SaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

/* ===== Form Field Component ===== */
function FormField({ label, children, required }) {
    return (
        <div className="org-form-field">
            <label className="org-form-label">
                {label} {required && <span className="org-form-required">*</span>}
            </label>
            {children}
        </div>
    )
}

/* ===== Exchange Rate Row ===== */
function ExchangeRateRow({ rate, index, currencies, onChange, onRemove }) {
    return (
        <div className="org-exchange-rate-row">
            <select
                className="org-form-select"
                value={rate.currency}
                onChange={(e) => onChange(index, 'currency', e.target.value)}
            >
                <option value="">Select currency</option>
                {currencies.map(c => (
                    <option key={c.currCode} value={c.currCode}>{c.currCode} - {c.currName}</option>
                ))}
            </select>
            <input
                type="number"
                className="org-form-input"
                placeholder="Rate"
                step="any"
                value={rate.fallBackExchangeRate}
                onChange={(e) => onChange(index, 'fallBackExchangeRate', parseFloat(e.target.value) || 0)}
            />
            <button className="org-exchange-remove-btn" onClick={() => onRemove(index)} title="Remove">
                <TrashIcon />
            </button>
        </div>
    )
}

/* ===== Custom Payment Group Dropdown ===== */
/* ===== Generic Custom Select Dropdown ===== */
function CustomSelect({ options, value, placeholder, onChange, renderOption }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.org-custom-select')) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`org-custom-select ${isOpen ? 'open' : ''}`}>
            <div className="org-custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? (
                    <span className="org-custom-select-value">{selectedOption.label}</span>
                ) : (
                    <span className="org-custom-select-placeholder">{placeholder || 'Select option'}</span>
                )}
                <ChevronDownIcon open={isOpen} />
            </div>

            {isOpen && (
                <div className="org-custom-select-dropdown">
                    <div
                        className={`org-custom-select-option ${value === '' ? 'selected' : ''}`}
                        onClick={() => { onChange(''); setIsOpen(false) }}
                    >
                        <div className="org-custom-select-option-header">
                            <span className="org-custom-select-option-title">None (Unassigned)</span>
                            <span className="org-custom-select-check"><CheckIcon /></span>
                        </div>
                    </div>

                    {options.map(opt => {
                        const isSelected = value === opt.value;
                        return (
                            <div
                                key={opt.value}
                                className={`org-custom-select-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false) }}
                            >
                                <div className="org-custom-select-option-header">
                                    <span className="org-custom-select-option-title">{opt.label}</span>
                                    <span className="org-custom-select-check"><CheckIcon /></span>
                                </div>
                                {renderOption && renderOption(opt)}
                            </div>
                        )
                    })}

                    {options.length === 0 && (
                        <div className="org-custom-select-empty">No options found</div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ===== POS Group Modal (Add / Edit) ===== */
function PosGroupModal({ branches, paymentGroups, initialData, onSubmit, onClose }) {
    const isEdit = !!initialData
    const [form, setForm] = useState({
        groupCode: initialData?.groupCode || '',
        groupName: initialData?.groupName || '',
        branchId: initialData?.branchId || '',
        paymentGroupCode: initialData?.paymentGroupCode || ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.groupCode || !form.groupName) {
            setError('Group Code and Name are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                groupCode: form.groupCode,
                groupName: form.groupName,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                paymentGroupCode: form.paymentGroupCode || null
            }, isEdit)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <GroupIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit POS Group' : 'Add POS Group'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    <FormField label="Group Code" required>
                        <input
                            type="text"
                            className="org-form-input"
                            value={form.groupCode}
                            onChange={e => setForm(f => ({ ...f, groupCode: e.target.value }))}
                            placeholder="e.g. GRP-001"
                            id="input-group-code"
                            disabled={isEdit}
                        />
                    </FormField>

                    <FormField label="Group Name" required>
                        <input
                            type="text"
                            className="org-form-input"
                            value={form.groupName}
                            onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))}
                            placeholder="e.g. Main Store"
                            id="input-group-name"
                        />
                    </FormField>

                    <FormField label="Branch">
                        <CustomSelect
                            options={branches.map(b => ({ value: b.BPLId, label: b.BPLName }))}
                            value={form.branchId}
                            placeholder="Select branch"
                            onChange={val => setForm(f => ({ ...f, branchId: val }))}
                        />
                    </FormField>

                    <FormField label="Payment Group">
                        <CustomSelect
                            options={paymentGroups.map(pg => ({
                                value: pg.code,
                                label: pg.description || pg.code,
                                methods: pg.paymentMethods || []
                            }))}
                            value={form.paymentGroupCode}
                            placeholder="Select payment group"
                            onChange={val => setForm(f => ({ ...f, paymentGroupCode: val }))}
                            renderOption={(opt) => opt.methods.length > 0 && (
                                <div className="org-custom-select-option-methods">
                                    <div className="org-methods-label">Includes {opt.methods.length} methods:</div>
                                    <div className="org-methods-list">
                                        {opt.methods.map(m => (
                                            <div key={m.id || m.code} className="org-custom-select-method-row">
                                                <div className="org-method-main">
                                                    <span className={`org-method-indicator ${m.paymentType?.toLowerCase()}`}></span>
                                                    <span className="org-method-name">{m.description || m.code}</span>
                                                </div>
                                                <span className={`org-method-tag ${m.paymentType?.toLowerCase()}`}>
                                                    {m.paymentType}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        />
                    </FormField>

                    {form.paymentGroupCode && (
                        <div className="org-payment-group-preview">
                            <div className="org-preview-header">
                                <span className="org-preview-title">Group Methods Preview</span>
                                <span className="org-preview-count">
                                    {paymentGroups.find(pg => pg.code === form.paymentGroupCode)?.paymentMethods?.length || 0} Methods
                                </span>
                            </div>
                            <div className="org-preview-methods-grid">
                                {paymentGroups.find(pg => pg.code === form.paymentGroupCode)?.paymentMethods?.map(m => (
                                    <div key={m.id || m.code} className="org-preview-method-card">
                                        <div className="org-preview-method-info">
                                            <span className={`org-method-indicator ${m.paymentType?.toLowerCase()}`}></span>
                                            <span className="org-preview-method-name">{m.description || m.code}</span>
                                        </div>
                                        <span className={`org-method-tag ${m.paymentType?.toLowerCase()}`}>{m.paymentType}</span>
                                    </div>
                                ))}
                                {(paymentGroups.find(pg => pg.code === form.paymentGroupCode)?.paymentMethods?.length === 0) && (
                                    <div className="org-preview-empty">No methods assigned to this group</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting} id="btn-submit-group">
                            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Group')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Add Terminal Modal ===== */
function AddTerminalModal({ group, branches, seriesList, currencies, priceLists, onSubmit, onClose }) {
    const [activeTab, setActiveTab] = useState('general')
    const [form, setForm] = useState({
        posTerminalID: '',
        posName: '',
        bplname: '',
        branchId: group?.branchId || '',
        groupCode: group?.groupCode || '',
        arSeries: '',
        incomingPaymentSeries: '',
        outgoingPaymentSeries: '',
        priceListEntity: '',
        mainCurrency: '',
        amountScale: 2,
        priceScale: 2,
        qtyScale: 3,
        percentScale: 2,
        rateScale: 6,
        defaultExchangeRates: [],
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const invoiceSeries = seriesList.filter(s => s.objectCode === 13)
    const incomingPaymentSeries = seriesList.filter(s => s.objectCode === 24)
    const outgoingPaymentSeries = seriesList.filter(s => s.objectCode === 46)

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const addExchangeRate = () => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: [...f.defaultExchangeRates, { currency: '', fallBackExchangeRate: 0 }],
        }))
    }

    const updateExchangeRate = (index, field, value) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: f.defaultExchangeRates.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }))
    }

    const removeExchangeRate = (index) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: f.defaultExchangeRates.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.posTerminalID || !form.posName) {
            setError('Terminal ID and Name are required')
            setActiveTab('general')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                posTerminalID: form.posTerminalID,
                posName: form.posName,
                bplname: form.bplname || null,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                groupCode: form.groupCode || null,
                arSeries: form.arSeries ? parseInt(form.arSeries) : 0,
                incomingPaymentSeries: form.incomingPaymentSeries ? parseInt(form.incomingPaymentSeries) : 0,
                outgoingPaymentSeries: form.outgoingPaymentSeries ? parseInt(form.outgoingPaymentSeries) : 0,
                priceListEntity: form.priceListEntity ? parseInt(form.priceListEntity) : 0,
                mainCurrency: form.mainCurrency,
                amountScale: parseInt(form.amountScale) || 2,
                priceScale: parseInt(form.priceScale) || 2,
                qtyScale: parseInt(form.qtyScale) || 3,
                percentScale: parseInt(form.percentScale) || 2,
                rateScale: parseInt(form.rateScale) || 6,
                defaultExchangeRates: form.defaultExchangeRates.filter(r => r.currency),
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal org-modal-lg" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <TerminalSvgIcon />
                        <h3 className="org-modal-title">Add POS Terminal</h3>
                        {group && <span className="org-modal-subtitle">to {group.groupName}</span>}
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* Tabs */}
                <div className="org-modal-tabs">
                    <button className={`org-modal-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')} type="button">General</button>
                    <button className={`org-modal-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')} type="button">Advanced</button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <>
                            <h4 className="org-form-section-title">Basic Information</h4>
                            <div className="org-form-grid">
                                <FormField label="Terminal ID" required>
                                    <input type="text" className="org-form-input" value={form.posTerminalID}
                                        onChange={e => updateField('posTerminalID', e.target.value)}
                                        placeholder="e.g. POS-001" id="input-terminal-id" />
                                </FormField>
                                <FormField label="Terminal Name" required>
                                    <input type="text" className="org-form-input" value={form.posName}
                                        onChange={e => updateField('posName', e.target.value)}
                                        placeholder="e.g. Checkout 1" id="input-terminal-name" />
                                </FormField>
                                <FormField label="BPL Name">
                                    <input type="text" className="org-form-input" value={form.bplname}
                                        onChange={e => updateField('bplname', e.target.value)}
                                        placeholder="Branch name" id="input-bplname" />
                                </FormField>
                                <FormField label="Branch">
                                    <CustomSelect
                                        options={branches.map(b => ({ value: b.BPLId, label: b.BPLName }))}
                                        value={form.branchId}
                                        placeholder="Select branch"
                                        onChange={val => updateField('branchId', val)}
                                    />
                                </FormField>
                            </div>

                            <h4 className="org-form-section-title">Series Configuration</h4>
                            <div className="org-form-grid">
                                <FormField label="AR Series (Invoice)">
                                    <CustomSelect
                                        options={invoiceSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.arSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('arSeries', val)}
                                    />
                                </FormField>
                                <FormField label="Incoming Payment Series">
                                    <CustomSelect
                                        options={incomingPaymentSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.incomingPaymentSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('incomingPaymentSeries', val)}
                                    />
                                </FormField>
                                <FormField label="Outgoing Payment Series">
                                    <CustomSelect
                                        options={outgoingPaymentSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.outgoingPaymentSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('outgoingPaymentSeries', val)}
                                    />
                                </FormField>
                            </div>

                            <h4 className="org-form-section-title">Pricing & Currency</h4>
                            <div className="org-form-grid">
                                <FormField label="Price List">
                                    <CustomSelect
                                        options={priceLists.map(p => ({ value: p.listNum, label: p.listName }))}
                                        value={form.priceListEntity}
                                        placeholder="Select price list"
                                        onChange={val => updateField('priceListEntity', val)}
                                    />
                                </FormField>
                                <FormField label="Main Currency">
                                    <CustomSelect
                                        options={currencies.map(c => ({ value: c.currCode, label: `${c.currCode} - ${c.currName}` }))}
                                        value={form.mainCurrency}
                                        placeholder="Select currency"
                                        onChange={val => updateField('mainCurrency', val)}
                                    />
                                </FormField>
                            </div>
                        </>
                    )}

                    {/* Tab: Advanced */}
                    {activeTab === 'advanced' && (
                        <>
                            <h4 className="org-form-section-title">Decimal Scale Settings</h4>
                            <div className="org-form-grid org-form-grid-5">
                                <FormField label="Amount">
                                    <input type="number" className="org-form-input" value={form.amountScale}
                                        onChange={e => updateField('amountScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Price">
                                    <input type="number" className="org-form-input" value={form.priceScale}
                                        onChange={e => updateField('priceScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Quantity">
                                    <input type="number" className="org-form-input" value={form.qtyScale}
                                        onChange={e => updateField('qtyScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Percent">
                                    <input type="number" className="org-form-input" value={form.percentScale}
                                        onChange={e => updateField('percentScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Rate">
                                    <input type="number" className="org-form-input" value={form.rateScale}
                                        onChange={e => updateField('rateScale', e.target.value)} min="0" max="10" />
                                </FormField>
                            </div>

                            <h4 className="org-form-section-title">
                                Default Exchange Rates
                                <button type="button" className="org-form-add-inline-btn" onClick={addExchangeRate}>
                                    <PlusIcon /> Add Rate
                                </button>
                            </h4>
                            {form.defaultExchangeRates.length > 0 && (
                                <div className="org-exchange-rates-list">
                                    {form.defaultExchangeRates.map((rate, i) => (
                                        <ExchangeRateRow
                                            key={i} rate={rate} index={i}
                                            currencies={currencies}
                                            onChange={updateExchangeRate}
                                            onRemove={removeExchangeRate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting} id="btn-submit-terminal">
                            {submitting ? 'Creating...' : 'Create Terminal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Terminal Detail Row ===== */
function SettingRow({ label, value }) {
    const display = value === null || value === undefined || value === '' ? '—' : String(value)
    return (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{display}</span>
        </div>
    )
}

/* ===== Terminal Settings Panel ===== */
function TerminalSettingsPanel({ terminal, seriesList, currencies, priceLists, branches, groups, onClose, onUpdate }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [form, setForm] = useState({})
    const [activeTab, setActiveTab] = useState('general')

    useEffect(() => {
        setEditing(false)
        setSaveMsg('')
        setActiveTab('general')
        setForm({ ...terminal, defaultExchangeRates: terminal?.defaultExchangeRates ? [...terminal.defaultExchangeRates] : [] })
    }, [terminal])

    if (!terminal) return null

    const findSeries = (val) => { const s = seriesList.find(s => s.series === val); return s ? `${s.seriesName} (${s.series})` : val }
    const findCurrency = (code) => { const c = currencies.find(c => c.currCode === code); return c ? `${c.currCode} - ${c.currName}` : code }
    const findPriceList = (num) => { const p = priceLists.find(p => p.listNum === num); return p ? p.listName : num }
    const findBranch = (id) => { const b = branches.find(b => b.BPLId === id); return b ? b.BPLName : id }
    const findGroup = (code) => { const g = groups.find(g => g.groupCode === code); return g ? g.groupName : code }

    const invoiceSeries = seriesList.filter(s => s.objectCode === 13)
    const incomingPmtSeries = seriesList.filter(s => s.objectCode === 24)
    const outgoingPmtSeries = seriesList.filter(s => s.objectCode === 46)

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const addExchangeRate = () => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: [...(f.defaultExchangeRates || []), { currency: '', fallBackExchangeRate: 0 }],
        }))
    }

    const updateExchangeRate = (index, field, value) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: (f.defaultExchangeRates || []).map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }))
    }

    const removeExchangeRate = (index) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: (f.defaultExchangeRates || []).filter((_, i) => i !== index),
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveMsg('')
        try {
            await putJSON(`${API_BASE}/api/pos_terminal/${terminal.posTerminalID}`, {
                ...form,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                arSeries: form.arSeries ? parseInt(form.arSeries) : 0,
                incomingPaymentSeries: form.incomingPaymentSeries ? parseInt(form.incomingPaymentSeries) : 0,
                outgoingPaymentSeries: form.outgoingPaymentSeries ? parseInt(form.outgoingPaymentSeries) : 0,
                priceListEntity: form.priceListEntity ? parseInt(form.priceListEntity) : 0,
                amountScale: parseInt(form.amountScale) || 2,
                priceScale: parseInt(form.priceScale) || 2,
                qtyScale: parseInt(form.qtyScale) || 3,
                percentScale: parseInt(form.percentScale) || 2,
                rateScale: parseInt(form.rateScale) || 6,
                defaultExchangeRates: (form.defaultExchangeRates || []).filter(r => r.currency),
            })
            setSaveMsg('Saved successfully')
            setEditing(false)
            if (onUpdate) onUpdate()
        } catch (err) {
            setSaveMsg('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => { setForm({ ...terminal, defaultExchangeRates: terminal?.defaultExchangeRates ? [...terminal.defaultExchangeRates] : [] }); setEditing(false); setSaveMsg(''); setActiveTab('general') }

    const renderValue = (label, value) => (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{value === null || value === undefined || value === '' ? '—' : String(value)}</span>
        </div>
    )

    return (
        <div className="org-settings-panel" id={`settings-panel-${terminal.posTerminalID}`}>
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row">
                    <SettingsGearIcon />
                    <h3 className="org-settings-panel-title">{terminal.posName || terminal.posTerminalID}</h3>
                </div>
                <div className="org-settings-header-actions">
                    {!editing ? (
                        <button className="org-settings-edit-btn" onClick={() => setEditing(true)} title="Edit"><EditIcon /></button>
                    ) : (
                        <>
                            <button className="org-settings-save-btn" onClick={handleSave} disabled={saving} title="Save"><SaveIcon /></button>
                            <button className="org-settings-cancel-btn" onClick={handleCancel} disabled={saving} title="Cancel"><CloseIcon /></button>
                        </>
                    )}
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>

            {saveMsg && <div className={`org-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>{saveMsg}</div>}

            {/* Terminal Info */}
            {!editing ? (
                <>
                    <div className="org-settings-info-grid">
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Terminal ID</span><span className="org-settings-info-value mono">{terminal.posTerminalID}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Branch</span><span className="org-settings-info-value">{findBranch(terminal.branchId)}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Group</span><span className="org-settings-info-value">{terminal.groupCode ? findGroup(terminal.groupCode) : '—'}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">BPL Name</span><span className="org-settings-info-value">{terminal.bplname || '—'}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Currency</span><span className="org-settings-info-value">{findCurrency(terminal.mainCurrency)}</span></div>
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Series Configuration</h4>
                    <div className="org-settings-list">
                        {renderValue('AR Series', findSeries(terminal.arSeries))}
                        {renderValue('Incoming Payment', findSeries(terminal.incomingPaymentSeries))}
                        {renderValue('Outgoing Payment', findSeries(terminal.outgoingPaymentSeries))}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Pricing</h4>
                    <div className="org-settings-list">
                        {renderValue('Price List', findPriceList(terminal.priceListEntity))}
                        {renderValue('Main Currency', findCurrency(terminal.mainCurrency))}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Decimal Scales</h4>
                    <div className="org-settings-list">
                        {renderValue('Amount', terminal.amountScale)}
                        {renderValue('Price', terminal.priceScale)}
                        {renderValue('Qty', terminal.qtyScale)}
                        {renderValue('Percent', terminal.percentScale)}
                        {renderValue('Rate', terminal.rateScale)}
                    </div>
                    {terminal.defaultExchangeRates?.length > 0 && (
                        <><div className="org-settings-divider" /><h4 className="org-settings-section-title">Exchange Rates</h4>
                            <div className="org-settings-list">{terminal.defaultExchangeRates.map((r, i) => renderValue(findCurrency(r.currency), r.fallBackExchangeRate))}</div></>
                    )}
                </>
            ) : (
                <div className="org-settings-edit-form">
                    {/* Tabs */}
                    <div className="org-modal-tabs">
                        <button className={`org-modal-tab ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')} type="button">General</button>
                        <button className={`org-modal-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                            onClick={() => setActiveTab('advanced')} type="button">Advanced</button>
                    </div>

                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <>
                            <FormField label="POS Name"><input className="org-form-input" value={form.posName || ''} onChange={e => updateField('posName', e.target.value)} /></FormField>
                            <FormField label="BPL Name"><input className="org-form-input" value={form.bplname || ''} onChange={e => updateField('bplname', e.target.value)} /></FormField>
                            <FormField label="Branch">
                                <CustomSelect
                                    options={branches.map(b => ({ value: b.BPLId, label: b.BPLName }))}
                                    value={form.branchId || ''}
                                    placeholder="None"
                                    onChange={val => updateField('branchId', val)}
                                />
                            </FormField>
                            <FormField label="Group">
                                <CustomSelect
                                    options={groups.map(g => ({ value: g.groupCode, label: `${g.groupName} (${g.groupCode})` }))}
                                    value={form.groupCode || ''}
                                    placeholder="None (Unassigned)"
                                    onChange={val => updateField('groupCode', val)}
                                />
                            </FormField>
                            <div className="org-settings-divider" />
                            <h4 className="org-settings-section-title">Series</h4>
                            <FormField label="AR Series">
                                <CustomSelect
                                    options={invoiceSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.arSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('arSeries', val)}
                                />
                            </FormField>
                            <FormField label="Incoming Payment">
                                <CustomSelect
                                    options={incomingPmtSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.incomingPaymentSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('incomingPaymentSeries', val)}
                                />
                            </FormField>
                            <FormField label="Outgoing Payment">
                                <CustomSelect
                                    options={outgoingPmtSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.outgoingPaymentSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('outgoingPaymentSeries', val)}
                                />
                            </FormField>
                            <div className="org-settings-divider" />
                            <h4 className="org-settings-section-title">Pricing</h4>
                            <FormField label="Price List">
                                <CustomSelect
                                    options={priceLists.map(p => ({ value: p.listNum, label: p.listName }))}
                                    value={form.priceListEntity || ''}
                                    placeholder="None"
                                    onChange={val => updateField('priceListEntity', val)}
                                />
                            </FormField>
                            <FormField label="Main Currency">
                                <CustomSelect
                                    options={currencies.map(c => ({ value: c.currCode, label: `${c.currCode} - ${c.currName}` }))}
                                    value={form.mainCurrency || ''}
                                    placeholder="None"
                                    onChange={val => updateField('mainCurrency', val)}
                                />
                            </FormField>
                        </>
                    )}

                    {/* Tab: Advanced */}
                    {activeTab === 'advanced' && (
                        <>
                            <h4 className="org-settings-section-title">Decimal Scales</h4>
                            <div className="org-form-grid org-form-grid-5">
                                <FormField label="Amt"><input type="number" className="org-form-input" value={form.amountScale ?? ''} onChange={e => updateField('amountScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Price"><input type="number" className="org-form-input" value={form.priceScale ?? ''} onChange={e => updateField('priceScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Qty"><input type="number" className="org-form-input" value={form.qtyScale ?? ''} onChange={e => updateField('qtyScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="%"><input type="number" className="org-form-input" value={form.percentScale ?? ''} onChange={e => updateField('percentScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Rate"><input type="number" className="org-form-input" value={form.rateScale ?? ''} onChange={e => updateField('rateScale', e.target.value)} min="0" max="10" /></FormField>
                            </div>

                            <h4 className="org-form-section-title">
                                Default Exchange Rates
                                <button type="button" className="org-form-add-inline-btn" onClick={addExchangeRate}>
                                    <PlusIcon /> Add Rate
                                </button>
                            </h4>
                            {(form.defaultExchangeRates || []).length > 0 && (
                                <div className="org-exchange-rates-list">
                                    {form.defaultExchangeRates.map((rate, i) => (
                                        <ExchangeRateRow
                                            key={i} rate={rate} index={i}
                                            currencies={currencies}
                                            onChange={updateExchangeRate}
                                            onRemove={removeExchangeRate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

/* ===== Terminal Card ===== */
function TerminalCard({ terminal, isSelected, onSelect }) {
    return (
        <div
            className={`org-terminal-card ${isSelected ? 'selected' : ''}`}
            id={`terminal-card-${terminal.posTerminalID}`}
            onClick={() => onSelect(terminal)}
        >
            <div className="org-terminal-card-header">
                <div className="org-terminal-icon-wrapper">
                    <TerminalSvgIcon />
                </div>
                <div className="org-terminal-info">
                    <span className="org-terminal-name">{terminal.posName || terminal.posTerminalID}</span>
                    <span className="org-terminal-id mono">{terminal.posTerminalID}</span>
                </div>
            </div>

            <div className="org-terminal-meta">
                <div className="org-terminal-meta-item">
                    <SettingsGearIcon />
                    <span>Branch: {terminal.branchId}</span>
                </div>
                <div className="org-terminal-meta-item">
                    <SettingsGearIcon />
                    <span>Currency: {terminal.mainCurrency || '—'}</span>
                </div>
            </div>

            <div className="org-terminal-footer">
                <span className="org-terminal-sync">
                    Price List: {terminal.priceListEntity ?? '—'}
                </span>
                <button
                    className="org-terminal-settings-btn"
                    onClick={(e) => { e.stopPropagation(); onSelect(terminal) }}
                    id={`open-settings-${terminal.posTerminalID}`}
                >
                    <SettingsGearIcon />
                    <span>Details</span>
                </button>
            </div>
        </div>
    )
}

/* ===== POS Group ===== */
function PosGroup({ group, terminals, selectedTerminal, onSelectTerminal, onAddTerminal, onEditGroup }) {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className={`org-group ${expanded ? 'expanded' : ''}`} id={`group-${group.groupCode}`}>
            <div className="org-group-header" onClick={() => setExpanded(!expanded)}>
                <div className="org-group-header-left">
                    <ChevronDownIcon open={expanded} />
                    <div className="org-group-icon-wrapper">
                        <GroupIcon />
                    </div>
                    <div className="org-group-info">
                        <span className="org-group-name">{group.groupName}</span>
                        <span className="org-group-desc">
                            Code: {group.groupCode} · Branch ID: {group.branchId}
                            {group.paymentGroup && ` · Payment: ${group.paymentGroup.description}`}
                        </span>
                    </div>
                </div>
                <div className="org-group-header-right">
                    <div className="org-group-stats">
                        <span className="org-group-stat">
                            <TerminalSvgIcon />
                            <strong>{terminals.length}</strong> terminals
                        </span>
                    </div>
                    <button
                        className="org-add-terminal-btn btn-icon-only"
                        onClick={(e) => { e.stopPropagation(); onEditGroup(group) }}
                        title="Edit group"
                        style={{ marginLeft: '8px' }}
                    >
                        <EditIcon />
                    </button>
                    <button
                        className="org-add-terminal-btn btn-icon-only"
                        onClick={(e) => { e.stopPropagation(); onAddTerminal(group) }}
                        id={`add-terminal-${group.groupCode}`}
                        title="Add terminal"
                        style={{ marginLeft: '8px' }}
                    >
                        <PlusIcon />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="org-group-body">
                    {terminals.length > 0 ? (
                        <div className="org-terminals-grid">
                            {terminals.map(terminal => (
                                <TerminalCard
                                    key={terminal.posTerminalID}
                                    terminal={terminal}
                                    isSelected={selectedTerminal?.posTerminalID === terminal.posTerminalID}
                                    onSelect={onSelectTerminal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="org-empty-terminals">
                            <TerminalSvgIcon />
                            <span>No terminals in this group</span>
                            <button
                                className="org-add-inline-btn"
                                onClick={() => onAddTerminal(group)}
                            >
                                <PlusIcon /> Add Terminal
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ===== Loading Spinner ===== */
function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

/* ===== Org Structure Page ===== */
function OrgStructurePage({ onBack }) {
    const [groups, setGroups] = useState([])
    const [paymentGroups, setPaymentGroups] = useState([])
    const [terminals, setTerminals] = useState([])
    const [branches, setBranches] = useState([])
    const [seriesList, setSeriesList] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [priceLists, setPriceLists] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedTerminal, setSelectedTerminal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [showAddGroup, setShowAddGroup] = useState(false)
    const [editingGroup, setEditingGroup] = useState(null)
    const [addTerminalForGroup, setAddTerminalForGroup] = useState(null)

    /* Fetch all data */
    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [groupsRes, terminalsRes, branchesRes, seriesRes, currRes, priceRes, payGroupsRes] = await Promise.all([
                fetchJSON(`${API_BASE}/api/pos_terminal/posGroup`),
                fetchJSON(`${API_BASE}/api/pos_terminal/all`),
                fetchJSON(`${API_BASE}/api/master_data/branch`),
                fetchJSON(`${API_BASE}/api/master_data/series`),
                fetchJSON(`${API_BASE}/api/master_data/currency`),
                fetchJSON(`${API_BASE}/api/master_data/priceList`),
                fetchJSON(`${API_BASE}/api/pos_terminal/paymentGroup`),
            ])
            setGroups(Array.isArray(groupsRes) ? groupsRes : [])
            setTerminals(Array.isArray(terminalsRes) ? terminalsRes : [])
            setBranches(Array.isArray(branchesRes) ? branchesRes : [])
            setSeriesList(Array.isArray(seriesRes) ? seriesRes : [])
            setCurrencies(Array.isArray(currRes) ? currRes : [])
            setPriceLists(Array.isArray(priceRes) ? priceRes : [])
            setPaymentGroups(Array.isArray(payGroupsRes) ? payGroupsRes : [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    /* Create / Update POS Group */
    const handleSaveGroup = async (data, isEdit) => {
        if (isEdit) {
            await putJSON(`${API_BASE}/api/pos_terminal/posGroup/${data.groupCode}`, data)
        } else {
            await postJSON(`${API_BASE}/api/pos_terminal/posGroup`, data)
        }
        await loadData()
    }

    /* Create Terminal */
    const handleCreateTerminal = async (data) => {
        await postJSON(`${API_BASE}/api/pos_terminal`, data)
        await loadData()
    }

    /* Filter logic */
    const query = searchQuery.toLowerCase()
    const filteredGroups = groups.filter(g =>
        g.groupName?.toLowerCase().includes(query) ||
        g.groupCode?.toLowerCase().includes(query)
    )

    const getTerminalsForGroup = (group) => {
        return terminals.filter(t => {
            const matchGroup = t.groupCode === group.groupCode
            if (!query) return matchGroup
            return matchGroup && (
                (t.posName || '').toLowerCase().includes(query) ||
                (t.posTerminalID || '').toLowerCase().includes(query) ||
                (t.mainCurrency || '').toLowerCase().includes(query)
            )
        })
    }

    /* Unassigned terminals (groupCode is null) */
    const unassignedTerminals = terminals.filter(t => {
        if (t.groupCode !== null && t.groupCode !== undefined) return false
        if (!query) return true
        return (
            (t.posName || '').toLowerCase().includes(query) ||
            (t.posTerminalID || '').toLowerCase().includes(query) ||
            (t.mainCurrency || '').toLowerCase().includes(query)
        )
    })

    const showUnassigned = unassignedTerminals.length > 0 &&
        (!query || 'unassigned'.includes(query) || unassignedTerminals.length > 0)

    const totalTerminals = terminals.length

    return (
        <div className={`org-page ${selectedTerminal ? 'panel-open' : ''}`}>
            {/* Content */}
            <div className="org-content">
                <div className={`org-main ${selectedTerminal ? 'with-panel' : ''}`}>
                    {/* Page Title with Back button */}
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack} id="org-back-btn">
                            <BackIcon />
                            <span>Back to Dashboard</span>
                        </button>
                        <h2 className="org-page-title">Organizational Structure</h2>
                        <p className="org-page-subtitle">Manage POS groups and terminal configurations</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="org-summary-stats">
                        <div className="org-stat-card" id="stat-total-groups">
                            <span className="org-stat-number">{groups.length}</span>
                            <span className="org-stat-label">POS Groups</span>
                        </div>
                        <div className="org-stat-card" id="stat-total-terminals">
                            <span className="org-stat-number">{totalTerminals}</span>
                            <span className="org-stat-label">Total Terminals</span>
                        </div>
                        <div className="org-stat-card" id="stat-branches">
                            <span className="org-stat-number">{branches.length}</span>
                            <span className="org-stat-label">Branches</span>
                        </div>
                        <div className="org-stat-card" id="stat-currencies">
                            <span className="org-stat-number">{currencies.length}</span>
                            <span className="org-stat-label">Currencies</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="org-toolbar">
                        <div className="org-search-wrapper">
                            <SearchIcon />
                            <input type="text" className="org-search-input" placeholder="Search groups, terminals..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="org-search-input" />
                        </div>
                        <div className="org-toolbar-actions">
                            <button className="toolbar-btn" onClick={loadData} id="btn-refresh-data" title="Refresh data">
                                <RefreshIcon /> Refresh
                            </button>
                            <button className="toolbar-btn primary" onClick={() => setShowAddGroup(true)} id="btn-add-group">
                                <PlusIcon /> Add Group
                            </button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="org-error-banner" id="org-error-banner">
                            <span>⚠ {error}</span>
                            <button className="org-error-retry" onClick={loadData}>Retry</button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && <LoadingSpinner text="Loading POS data..." />}

                    {/* Groups List */}
                    {!loading && (
                        <div className="org-groups-list">
                            {filteredGroups.map(group => (
                                <PosGroup key={group.groupCode} group={group}
                                    terminals={getTerminalsForGroup(group)} selectedTerminal={selectedTerminal}
                                    onSelectTerminal={setSelectedTerminal} onAddTerminal={setAddTerminalForGroup}
                                    onEditGroup={(g) => { setEditingGroup(g); setShowAddGroup(true); }} />
                            ))}

                            {/* Unassigned Group */}
                            {showUnassigned && (
                                <div className="org-group org-group-unassigned expanded" id="group-unassigned">
                                    <div className="org-group-header" onClick={() => { }}>
                                        <div className="org-group-header-left">
                                            <div className="org-group-icon-wrapper org-group-icon-unassigned"><GroupIcon /></div>
                                            <div className="org-group-info">
                                                <span className="org-group-name">Unassigned</span>
                                                <span className="org-group-desc">Terminals not assigned to any group</span>
                                            </div>
                                        </div>
                                        <div className="org-group-header-right">
                                            <div className="org-group-stats">
                                                <span className="org-group-stat"><TerminalSvgIcon /><strong>{unassignedTerminals.length}</strong> terminals</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="org-group-body">
                                        <div className="org-terminals-grid">
                                            {unassignedTerminals.map(terminal => (
                                                <TerminalCard key={terminal.posTerminalID} terminal={terminal}
                                                    isSelected={selectedTerminal?.posTerminalID === terminal.posTerminalID}
                                                    onSelect={setSelectedTerminal} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filteredGroups.length === 0 && !showUnassigned && !error && (
                                <div className="org-empty-state">
                                    <SearchIcon />
                                    <p>{searchQuery ? `No results matching "${searchQuery}"` : 'No POS groups found. Create one to get started.'}</p>
                                    {!searchQuery && (
                                        <button className="toolbar-btn primary" onClick={() => setShowAddGroup(true)}>
                                            <PlusIcon /> Add Group
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Settings Side Panel - same level as main, scrolls independently */}
                {selectedTerminal && (
                    <TerminalSettingsPanel
                        terminal={selectedTerminal} seriesList={seriesList} currencies={currencies}
                        priceLists={priceLists} branches={branches} groups={groups}
                        onClose={() => setSelectedTerminal(null)} onUpdate={loadData}
                    />
                )}
            </div>

            {/* Add/Edit Group Modal */}
            {showAddGroup && (
                <PosGroupModal branches={branches} paymentGroups={paymentGroups} initialData={editingGroup} onSubmit={handleSaveGroup} onClose={() => { setShowAddGroup(false); setEditingGroup(null); }} />
            )}

            {/* Add Terminal Modal */}
            {addTerminalForGroup && (
                <AddTerminalModal group={addTerminalForGroup} branches={branches} seriesList={seriesList}
                    currencies={currencies} priceLists={priceLists}
                    onSubmit={handleCreateTerminal} onClose={() => setAddTerminalForGroup(null)} />
            )}
        </div>
    )
}

export default OrgStructurePage
