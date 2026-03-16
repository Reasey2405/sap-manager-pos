import { useState, useEffect, useCallback } from 'react'

import { API_BASE, fetchJSON, postJSON, putJSON } from '../service/api'

/* ===== Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
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

const BankSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="20" width="22" height="2" rx="1" />
        <path d="M12 2L2 8h20L12 2z" />
        <line x1="4" y1="10" x2="4" y2="18" />
        <line x1="8" y1="10" x2="8" y2="18" />
        <line x1="12" y1="10" x2="12" y2="18" />
        <line x1="16" y1="10" x2="16" y2="18" />
        <line x1="20" y1="10" x2="20" y2="18" />
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

/* ===== Add / Edit Bank Modal ===== */
function BankModal({ bank, onSubmit, onClose }) {
    const isEdit = !!bank
    const [form, setForm] = useState({
        bankCode: bank?.bankCode || '',
        bankNumber: bank?.bankNumber || '',
        description: bank?.description || '',
        accountingGlAccount: bank?.accountingGlAccount || '',
        posGlAccount: bank?.posGlAccount || '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.bankCode) {
            setError('Bank Code is required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                bankCode: form.bankCode,
                bankNumber: form.bankNumber || null,
                description: form.description || null,
                accountingGlAccount: form.accountingGlAccount || null,
                posGlAccount: form.posGlAccount || null,
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
                        <BankSvgIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit Bank Information' : 'Add Bank Information'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    <div className="org-form-grid">
                        <FormField label="Bank Code" required>
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.bankCode}
                                onChange={e => updateField('bankCode', e.target.value)}
                                placeholder="e.g. ABA"
                                id="input-bank-code"
                                disabled={isEdit}
                            />
                        </FormField>

                        <FormField label="Bank Number">
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.bankNumber}
                                onChange={e => updateField('bankNumber', e.target.value)}
                                placeholder="e.g. st 2021"
                                id="input-bank-number"
                            />
                        </FormField>
                    </div>

                    <FormField label="Description">
                        <input
                            type="text"
                            className="org-form-input"
                            value={form.description}
                            onChange={e => updateField('description', e.target.value)}
                            placeholder="e.g. ABA Bank 2021"
                            id="input-bank-description"
                        />
                    </FormField>

                    <div className="org-form-grid">
                        <FormField label="Accounting GL Account">
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.accountingGlAccount}
                                onChange={e => updateField('accountingGlAccount', e.target.value)}
                                placeholder="GL Account"
                                id="input-accounting-gl"
                            />
                        </FormField>

                        <FormField label="POS GL Account">
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.posGlAccount}
                                onChange={e => updateField('posGlAccount', e.target.value)}
                                placeholder="POS GL Account"
                                id="input-pos-gl"
                            />
                        </FormField>
                    </div>

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting} id="btn-submit-bank">
                            {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Bank')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Bank Detail Panel ===== */
function BankDetailPanel({ bank, onClose, onUpdate }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [form, setForm] = useState({})

    useEffect(() => {
        setEditing(false)
        setSaveMsg('')
        setForm({ ...bank })
    }, [bank])

    if (!bank) return null

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSave = async () => {
        setSaving(true)
        setSaveMsg('')
        try {
            await putJSON(`${API_BASE}/api/pos_terminal/bank/${bank.bankCode}`, {
                bankCode: form.bankCode,
                bankNumber: form.bankNumber || null,
                description: form.description || null,
                accountingGlAccount: form.accountingGlAccount || null,
                posGlAccount: form.posGlAccount || null,
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

    const handleCancel = () => {
        setForm({ ...bank })
        setEditing(false)
        setSaveMsg('')
    }

    const renderValue = (label, value) => (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{value === null || value === undefined || value === '' ? '—' : String(value)}</span>
        </div>
    )

    return (
        <div className="org-settings-panel" id={`settings-panel-${bank.bankCode}`}>
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row">
                    <BankSvgIcon />
                    <h3 className="org-settings-panel-title">{bank.description || bank.bankCode}</h3>
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

            {!editing ? (
                <>
                    <div className="org-settings-info-grid">
                        <div className="org-settings-info-item">
                            <span className="org-settings-info-label">Bank Code</span>
                            <span className="org-settings-info-value mono">{bank.bankCode}</span>
                        </div>
                        <div className="org-settings-info-item">
                            <span className="org-settings-info-label">Bank Number</span>
                            <span className="org-settings-info-value">{bank.bankNumber || '—'}</span>
                        </div>
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Details</h4>
                    <div className="org-settings-list">
                        {renderValue('Description', bank.description)}
                        {renderValue('Accounting GL Account', bank.accountingGlAccount)}
                        {renderValue('POS GL Account', bank.posGlAccount)}
                    </div>
                </>
            ) : (
                <div className="org-settings-edit-form">
                    <FormField label="Bank Code">
                        <input className="org-form-input" value={form.bankCode || ''} disabled />
                    </FormField>
                    <FormField label="Bank Number">
                        <input className="org-form-input" value={form.bankNumber || ''} onChange={e => updateField('bankNumber', e.target.value)} />
                    </FormField>
                    <FormField label="Description">
                        <input className="org-form-input" value={form.description || ''} onChange={e => updateField('description', e.target.value)} />
                    </FormField>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">GL Accounts</h4>
                    <FormField label="Accounting GL Account">
                        <input className="org-form-input" value={form.accountingGlAccount || ''} onChange={e => updateField('accountingGlAccount', e.target.value)} />
                    </FormField>
                    <FormField label="POS GL Account">
                        <input className="org-form-input" value={form.posGlAccount || ''} onChange={e => updateField('posGlAccount', e.target.value)} />
                    </FormField>
                </div>
            )}
        </div>
    )
}

/* ===== Bank Card ===== */
function BankCard({ bank, isSelected, onSelect }) {
    return (
        <div
            className={`bank-card ${isSelected ? 'selected' : ''}`}
            id={`bank-card-${bank.bankCode}`}
            onClick={() => onSelect(bank)}
        >
            <div className="bank-card-header">
                <div className="bank-card-icon-wrapper">
                    <BankSvgIcon />
                </div>
                <div className="bank-card-info">
                    <span className="bank-card-code">{bank.bankCode}</span>
                    <span className="bank-card-desc">{bank.description || '—'}</span>
                </div>
            </div>

            <div className="bank-card-meta">
                <div className="bank-card-meta-item">
                    <span className="bank-card-meta-label">Bank Number</span>
                    <span className="bank-card-meta-value">{bank.bankNumber || '—'}</span>
                </div>
                <div className="bank-card-meta-item">
                    <span className="bank-card-meta-label">Accounting GL</span>
                    <span className="bank-card-meta-value">{bank.accountingGlAccount || '—'}</span>
                </div>
                <div className="bank-card-meta-item">
                    <span className="bank-card-meta-label">POS GL</span>
                    <span className="bank-card-meta-value">{bank.posGlAccount || '—'}</span>
                </div>
            </div>

            <div className="bank-card-footer">
                <button
                    className="bank-card-details-btn"
                    onClick={(e) => { e.stopPropagation(); onSelect(bank) }}
                    id={`open-bank-details-${bank.bankCode}`}
                >
                    <EditIcon />
                    <span>Details</span>
                </button>
            </div>
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

/* ===== Bank Information Page ===== */
function BankInformationPage({ onBack }) {
    const [banks, setBanks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedBank, setSelectedBank] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)

    /* Fetch all bank data */
    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const banksRes = await fetchJSON(`${API_BASE}/api/pos_terminal/allBank`)
            setBanks(Array.isArray(banksRes) ? banksRes : [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    /* Create Bank */
    const handleCreateBank = async (data) => {
        await postJSON(`${API_BASE}/api/pos_terminal/bank`, data)
        await loadData()
    }

    /* Update Bank */
    const handleUpdateBank = async (data) => {
        await putJSON(`${API_BASE}/api/pos_terminal/bank/${data.bankCode}`, data)
        await loadData()
    }

    /* Submit Handler for modal (handles both create and update) */
    const handleSubmit = async (data, isEdit) => {
        if (isEdit) {
            await handleUpdateBank(data)
        } else {
            await handleCreateBank(data)
        }
    }

    /* Filter logic */
    const query = searchQuery.toLowerCase()
    const filteredBanks = banks.filter(b =>
        (b.bankCode || '').toLowerCase().includes(query) ||
        (b.bankNumber || '').toLowerCase().includes(query) ||
        (b.description || '').toLowerCase().includes(query) ||
        (b.accountingGlAccount || '').toLowerCase().includes(query) ||
        (b.posGlAccount || '').toLowerCase().includes(query)
    )

    return (
        <div className={`org-page ${selectedBank ? 'panel-open' : ''}`}>
            {/* Content */}
            <div className="org-content">
                <div className={`org-main ${selectedBank ? 'with-panel' : ''}`}>
                    {/* Page Title with Back button */}
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack} id="bank-back-btn">
                            <BackIcon />
                            <span>Back to Dashboard</span>
                        </button>
                        <h2 className="org-page-title">Bank Information</h2>
                        <p className="org-page-subtitle">Manage bank accounts and GL account configurations</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="org-summary-stats bank-summary-stats">
                        <div className="org-stat-card" id="stat-total-banks">
                            <span className="org-stat-number">{banks.length}</span>
                            <span className="org-stat-label">Total Banks</span>
                        </div>
                        <div className="org-stat-card" id="stat-with-accounting-gl">
                            <span className="org-stat-number">{banks.filter(b => b.accountingGlAccount && b.accountingGlAccount !== 'string').length}</span>
                            <span className="org-stat-label">With Accounting GL</span>
                        </div>
                        <div className="org-stat-card" id="stat-with-pos-gl">
                            <span className="org-stat-number">{banks.filter(b => b.posGlAccount && b.posGlAccount !== 'string').length}</span>
                            <span className="org-stat-label">With POS GL</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="org-toolbar">
                        <div className="org-search-wrapper">
                            <SearchIcon />
                            <input type="text" className="org-search-input" placeholder="Search banks by code, number, description..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="bank-search-input" />
                        </div>
                        <div className="org-toolbar-actions">
                            <button className="toolbar-btn" onClick={loadData} id="btn-refresh-banks" title="Refresh data">
                                <RefreshIcon /> Refresh
                            </button>
                            <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)} id="btn-add-bank">
                                <PlusIcon /> Add Bank
                            </button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="org-error-banner" id="bank-error-banner">
                            <span>⚠ {error}</span>
                            <button className="org-error-retry" onClick={loadData}>Retry</button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && <LoadingSpinner text="Loading bank data..." />}

                    {/* Banks Grid */}
                    {!loading && (
                        <div className="bank-grid">
                            {filteredBanks.length > 0 ? (
                                filteredBanks.map(bank => (
                                    <BankCard
                                        key={bank.bankCode}
                                        bank={bank}
                                        isSelected={selectedBank?.bankCode === bank.bankCode}
                                        onSelect={setSelectedBank}
                                    />
                                ))
                            ) : (
                                <div className="org-empty-state">
                                    <SearchIcon />
                                    <p>{searchQuery ? `No results matching "${searchQuery}"` : 'No bank records found. Add one to get started.'}</p>
                                    {!searchQuery && (
                                        <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)}>
                                            <PlusIcon /> Add Bank
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Detail Side Panel */}
                {selectedBank && (
                    <BankDetailPanel
                        bank={selectedBank}
                        onClose={() => setSelectedBank(null)}
                        onUpdate={loadData}
                    />
                )}
            </div>

            {/* Add Bank Modal */}
            {showAddModal && (
                <BankModal
                    bank={null}
                    onSubmit={handleSubmit}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    )
}

export default BankInformationPage
