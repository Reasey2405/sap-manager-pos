import { useState, useEffect, useCallback } from 'react'
import './PaymentMethodsPage.css'

import { API_BASE, fetchJSON, postJSON, putJSON } from '../service/api'

/* ===== Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
)

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const SaveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
)

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const PaymentIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
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

const GroupIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
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

/* ===== Add / Edit Group Modal ===== */
function PaymentGroupModal({ group, onSubmit, onClose }) {
    const isEdit = !!group
    const [form, setForm] = useState({
        code: group?.code || '',
        description: group?.description || '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.code || !form.description) {
            setError('Code and Description are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit(form, isEdit)
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
                        <h3 className="org-modal-title">{isEdit ? 'Edit Payment Group' : 'Add Payment Group'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    <FormField label="Group Code" required>
                        <input
                            className="org-form-input"
                            value={form.code}
                            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                            placeholder="e.g. CASH_GROUP"
                            disabled={isEdit}
                        />
                    </FormField>
                    <FormField label="Description" required>
                        <input
                            className="org-form-input"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="e.g. Cash & Direct Payments"
                        />
                    </FormField>
                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? 'Processing...' : (isEdit ? 'Save Changes' : 'Create Group')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Add / Edit Method Modal ===== */
function PaymentMethodModal({ method, groupId, banks, onSubmit, onClose }) {
    const isEdit = !!method
    const [form, setForm] = useState({
        code: method?.code || '',
        description: method?.description || '',
        paymentGroupId: groupId || method?.paymentGroupId || '',
        paymentType: method?.paymentType || 'Cash',
        bankInformationCode: method?.bankInformationCode || '',
        accountingGlAccount: method?.accountingGlAccount || '',
        posGlAccount: method?.posGlAccount || '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.code || !form.description || !form.paymentGroupId) {
            setError('Code, Description, and Group are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit(form, isEdit)
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
                        <PaymentIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    <div className="org-form-grid">
                        <FormField label="Method Code" required>
                            <input className="org-form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CASH_USD" />
                        </FormField>
                        <FormField label="Description" required>
                            <input className="org-form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Cash US Dollar" />
                        </FormField>
                    </div>
                    <div className="org-form-grid">
                        <FormField label="Payment Type" required>
                            <select className="org-form-select" value={form.paymentType} onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}>
                                <option value="Cash">Cash</option>
                                <option value="Transfer">Transfer</option>
                            </select>
                        </FormField>
                        <FormField label="Bank Information">
                            <select className="org-form-select" value={form.bankInformationCode} onChange={e => setForm(f => ({ ...f, bankInformationCode: e.target.value }))}>
                                <option value="">Select Bank (Optional)</option>
                                {banks.map(b => <option key={b.bankCode} value={b.bankCode}>{b.description || b.bankCode}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <div className="org-form-grid">
                        <FormField label="Accounting GL">
                            <input className="org-form-input" value={form.accountingGlAccount} onChange={e => setForm(f => ({ ...f, accountingGlAccount: e.target.value }))} placeholder="GL Account" />
                        </FormField>
                        <FormField label="POS GL">
                            <input className="org-form-input" value={form.posGlAccount} onChange={e => setForm(f => ({ ...f, posGlAccount: e.target.value }))} placeholder="POS GL Account" />
                        </FormField>
                    </div>
                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? 'Processing...' : (isEdit ? 'Save Changes' : 'Create Method')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Detail Panel ===== */
function PaymentMethodPanel({ method, banks, groups, onClose, onUpdate }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [form, setForm] = useState({})

    useEffect(() => {
        setEditing(false); setSaveMsg(''); setForm({ ...method })
    }, [method])

    if (!method) return null

    const handleSave = async () => {
        setSaving(true); setSaveMsg('')
        try {
            await putJSON(`${API_BASE}/api/pos_terminal/paymentMethod/${method.id}`, form)
            setSaveMsg('Saved successfully'); setEditing(false)
            if (onUpdate) onUpdate()
        } catch (err) { setSaveMsg('Error: ' + err.message) }
        finally { setSaving(false) }
    }

    const renderValue = (label, value) => (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{value || '—'}</span>
        </div>
    )

    return (
        <div className="org-settings-panel">
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row"><PaymentIcon /> <h3 className="org-settings-panel-title">{method.description}</h3></div>
                <div className="org-settings-header-actions">
                    {!editing ? <button className="org-settings-edit-btn" onClick={() => setEditing(true)}><EditIcon /></button> :
                        <><button className="org-settings-save-btn" onClick={handleSave} disabled={saving}><SaveIcon /></button>
                            <button className="org-settings-cancel-btn" onClick={() => setEditing(false)}><CloseIcon /></button></>}
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>
            {saveMsg && <div className={`org-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>{saveMsg}</div>}

            {!editing ? (
                <>
                    <div className="org-settings-info-grid">
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Code</span><span className="org-settings-info-value mono">{method.code}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Type</span><span className="org-settings-info-value">{method.paymentType}</span></div>
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Details</h4>
                    <div className="org-settings-list">
                        {renderValue('Description', method.description)}
                        {renderValue('Group ID', method.paymentGroupId)}
                        {renderValue('Bank Code', method.bankInformationCode)}
                        {renderValue('Accounting GL', method.accountingGlAccount)}
                        {renderValue('POS GL', method.posGlAccount)}
                    </div>
                </>
            ) : (
                <div className="org-settings-edit-form">
                    <FormField label="Description"><input className="org-form-input" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></FormField>
                    <FormField label="Type">
                        <select className="org-form-select" value={form.paymentType || ''} onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}>
                            <option value="Cash">Cash</option><option value="Transfer">Transfer</option>
                        </select>
                    </FormField>
                    <FormField label="Bank">
                        <select className="org-form-select" value={form.bankInformationCode || ''} onChange={e => setForm(f => ({ ...f, bankInformationCode: e.target.value }))}>
                            <option value="">None</option>{banks.map(b => <option key={b.bankCode} value={b.bankCode}>{b.description}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Accounting GL"><input className="org-form-input" value={form.accountingGlAccount || ''} onChange={e => setForm(f => ({ ...f, accountingGlAccount: e.target.value }))} /></FormField>
                    <FormField label="POS GL"><input className="org-form-input" value={form.posGlAccount || ''} onChange={e => setForm(f => ({ ...f, posGlAccount: e.target.value }))} /></FormField>
                </div>
            )}
        </div>
    )
}

/* ===== Page Component ===== */
export default function PaymentMethodsPage({ onBack }) {
    const [groups, setGroups] = useState([]); const [banks, setBanks] = useState([])
    const [loading, setLoading] = useState(true); const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMethod, setSelectedMethod] = useState(null)
    const [showGroupModal, setShowGroupModal] = useState(false); const [addMethodToGroup, setAddMethodToGroup] = useState(null)
    const [expandedGroups, setExpandedGroups] = useState({})
    const [editingGroup, setEditingGroup] = useState(null); // The group being edited

    const loadData = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const [gRes, bRes] = await Promise.all([
                fetchJSON(`${API_BASE}/api/pos_terminal/paymentGroup`),
                fetchJSON(`${API_BASE}/api/pos_terminal/allBank`)
            ])
            setGroups(gRes); setBanks(bRes)
        } catch (err) { setError(err.message) }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleCreateGroup = async (data) => {
        await postJSON(`${API_BASE}/api/pos_terminal/paymentGroup`, data); loadData()
    }
    const handleCreateMethod = async (data) => {
        await postJSON(`${API_BASE}/api/pos_terminal/paymentMethod`, data); loadData()
    }

    // -- Group Editing Handlers --
    const handleStartEditing = (e, group) => {
        e.stopPropagation()
        setEditingGroup(JSON.parse(JSON.stringify(group))) // Deep copy
        setSelectedMethod(null) // Ensure detail panel is closed
    }

    const handleCancelEditing = (e) => {
        e.stopPropagation()
        setEditingGroup(null)
    }

    const handleUpdateGroup = async (e) => {
        e.stopPropagation()
        if (!editingGroup) return
        setLoading(true); setError('')
        try {
            await putJSON(`${API_BASE}/api/pos_terminal/paymentGroup/${editingGroup.code}`, editingGroup)
            setEditingGroup(null)
            loadData()
        } catch (err) {
            setError(`Update failed: ${err.message}`)
            setLoading(false)
        }
    }

    const handleAddMethodToGroup = (newMethod) => {
        setEditingGroup(g => ({ ...g, paymentMethods: [...g.paymentMethods, newMethod] }))
        setAddMethodToGroup(null) // Close modal
    }

    const handleRemoveMethodFromGroup = (e, methodToRemove) => {
        e.stopPropagation();
        setEditingGroup(g => ({
            ...g,
            paymentMethods: g.paymentMethods.filter(m => m.code !== methodToRemove.code)
        }));
    };
    // -- End Group Editing Handlers --

    const filteredGroups = groups.map(g => ({
        ...g,
        paymentMethods: g.paymentMethods?.filter(m =>
            m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.code?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
    })).filter(g => g.paymentMethods.length > 0 || g.description?.toLowerCase().includes(searchQuery.toLowerCase()))

    const isEditing = !!editingGroup;

    return (
        <div className={`org-page ${selectedMethod ? 'panel-open' : ''} ${isEditing ? 'is-editing' : ''}`}>
            <div className="org-content">
                <div className="org-main">
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack}><BackIcon /> <span>Back to Dashboard</span></button>
                        <h2 className="org-page-title">Payment Methods</h2>
                        <p className="org-page-subtitle">Configure payment groups and transaction methods</p>
                    </div>

                    <div className="org-summary-stats bank-summary-stats">
                        <div className="org-stat-card"><span className="org-stat-number">{groups.length}</span><span className="org-stat-label">Groups</span></div>
                        <div className="org-stat-card"><span className="org-stat-number">{groups.reduce((acc, g) => acc + (g.paymentMethods?.length || 0), 0)}</span><span className="org-stat-label">Methods</span></div>
                        <div className="org-stat-card"><span className="org-stat-number">{banks.length}</span><span className="org-stat-label">Banks</span></div>
                    </div>

                    <div className="org-toolbar">
                        <div className="org-search-wrapper"><SearchIcon /><input className="org-search-input" placeholder="Search methods..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                        <div className="org-toolbar-actions">
                            <button className="toolbar-btn" onClick={loadData} disabled={isEditing}><RefreshIcon /> Refresh</button>
                            <button className="toolbar-btn primary" onClick={() => setShowGroupModal(true)} disabled={isEditing}><PlusIcon /> Add Group</button>
                        </div>
                    </div>

                    {loading && <div className="org-loading"><div className="org-spinner" /><span>Loading payments...</span></div>}
                    {!loading && error && <div className="org-form-error" style={{ margin: '0 20px' }}>{error}</div>}
                    {!loading && filteredGroups.map(g => {
                        const isEditingThisGroup = editingGroup?.code === g.code;
                        const groupData = isEditingThisGroup ? editingGroup : g;

                        return (
                            <div key={g.code} className={`org-group ${expandedGroups[g.code] !== false || isEditingThisGroup ? 'expanded' : ''} ${isEditingThisGroup ? 'editing' : ''}`}>
                                <div className="org-group-header" onClick={() => !isEditingThisGroup && setExpandedGroups(prev => ({ ...prev, [g.code]: prev[g.code] === false }))}>
                                    <div className="org-group-header-left">
                                        <ChevronDownIcon open={expandedGroups[g.code] !== false || isEditingThisGroup} />
                                        <div className="org-group-icon-wrapper"><GroupIcon /></div>
                                        <div className="org-group-info"><span className="org-group-name">{g.description}</span><span className="org-group-desc">Code: {g.code}</span></div>
                                    </div>
                                    <div className="org-group-header-right">
                                        <span className="org-group-stat"><strong>{groupData.paymentMethods?.length || 0}</strong> methods</span>
                                        {isEditingThisGroup ? (
                                            <>
                                                <button className="toolbar-btn" onClick={e => { e.stopPropagation(); setAddMethodToGroup(g.code) }}><PlusIcon /> Add Method</button>
                                                <button className="toolbar-btn primary" onClick={handleUpdateGroup}><SaveIcon /> Save</button>
                                                <button className="toolbar-btn" onClick={handleCancelEditing}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="toolbar-btn" onClick={(e) => handleStartEditing(e, g)} disabled={isEditing}><EditIcon /> Edit</button>
                                                <button className="org-add-terminal-btn" onClick={e => { e.stopPropagation(); setAddMethodToGroup(g.code) }} disabled={isEditing}><PlusIcon /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {(expandedGroups[g.code] !== false || isEditingThisGroup) && (
                                    <div className="org-group-body">
                                        <div className="org-terminals-grid">
                                            {groupData.paymentMethods?.map(m => (
                                                <div key={m.id || m.code} className={`org-terminal-card ${selectedMethod?.id === m.id ? 'selected' : ''}`} onClick={() => !isEditingThisGroup && setSelectedMethod(m)}>
                                                    {isEditingThisGroup && <button className="org-card-delete-btn" onClick={e => handleRemoveMethodFromGroup(e, m)}><CloseIcon /></button>}
                                                    <div className="org-terminal-card-header"><div className="org-terminal-icon-wrapper"><PaymentIcon /></div><div className="org-terminal-info"><span className="org-terminal-name">{m.description}</span><span className="org-terminal-id">{m.code}</span></div></div>
                                                    <div className="org-terminal-meta"><div className="org-terminal-meta-item"><span>Type: {m.paymentType}</span></div><div className="org-terminal-meta-item"><span>GL: {m.accountingGlAccount || '—'}</span></div></div>
                                                    <div className="org-terminal-footer"><span className="org-terminal-sync">Bank: {m.bankInformationCode || '—'}</span><button className="org-terminal-settings-btn" onClick={e => { e.stopPropagation(); !isEditingThisGroup && setSelectedMethod(m) }}><EditIcon /> Details</button></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                {selectedMethod && <PaymentMethodPanel method={selectedMethod} banks={banks} groups={groups} onClose={() => setSelectedMethod(null)} onUpdate={loadData} />}
            </div>
            {showGroupModal && <PaymentGroupModal onSubmit={handleCreateGroup} onClose={() => setShowGroupModal(false)} />}
            {addMethodToGroup && <PaymentMethodModal groupId={addMethodToGroup} banks={banks} onSubmit={(editingGroup && editingGroup.code === addMethodToGroup) ? handleAddMethodToGroup : handleCreateMethod} onClose={() => setAddMethodToGroup(null)} />}
        </div>
    )
}
