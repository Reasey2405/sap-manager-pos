import { useState, useEffect } from 'react'
import { API_BASE, fetchJSON, postJSON, putJSON } from '../../service/api'
import { GroupIcon, CloseIcon, CheckIcon } from './icons'
import FormField from './FormField'
import CustomSelect from './CustomSelect'

/* ===== POS Group Modal (Add / Edit) ===== */
function PosGroupModal({ branches, paymentGroups, initialData, onSubmit, onClose }) {
    const isEdit = !!initialData
    const [activeTab, setActiveTab] = useState('details')
    const [form, setForm] = useState({
        groupCode: initialData?.groupCode || '',
        groupName: initialData?.groupName || '',
        branchId: initialData?.branchId || '',
        paymentGroupCode: initialData?.paymentGroupCode || '',
        whsCode: initialData?.whsCode || ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [warehouses, setWarehouses] = useState([])
    const [warehousesLoading, setWarehousesLoading] = useState(false)

    useEffect(() => {
        setWarehousesLoading(true)
        fetchJSON(`${API_BASE}/api/master_data/warehouse`)
            .then(data => setWarehouses(Array.isArray(data) ? data : []))
            .catch(() => setWarehouses([]))
            .finally(() => setWarehousesLoading(false))
    }, [])

    const filteredWarehouses = form.branchId
        ? warehouses.filter(w => w.bplId === form.branchId || w.bplId === parseInt(form.branchId))
        : warehouses

    const handleBranchChange = (val) => {
        const newBranchId = val
        setForm(f => {
            const stillValid = newBranchId
                ? warehouses.some(w => w.whsCode === f.whsCode && (w.bplId === newBranchId || w.bplId === parseInt(newBranchId)))
                : true
            return { ...f, branchId: newBranchId, whsCode: stillValid ? f.whsCode : '' }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.groupCode || !form.groupName || !form.whsCode) {
            setError('Group Code, Name, and Warehouse are required')
            setActiveTab('details')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                groupCode: form.groupCode,
                groupName: form.groupName,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                paymentGroupCode: form.paymentGroupCode || null,
                whsCode: form.whsCode || null
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
            <div className="org-modal org-modal-pg" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <GroupIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit POS Group' : 'Add POS Group'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* Tabs */}
                <div className="org-modal-tabs">
                    <button
                        className={`org-modal-tab ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')} type="button"
                    >Details</button>
                    <button
                        className={`org-modal-tab ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')} type="button"
                    >
                        Payment
                        {form.paymentGroupCode && <span className="org-tab-badge">✓</span>}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    {/* Tab: Details */}
                    {activeTab === 'details' && (
                        <>
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
                                    onChange={handleBranchChange}
                                />
                            </FormField>
                            <FormField label="Warehouse" required>
                                <CustomSelect
                                    options={filteredWarehouses.map(w => ({ value: w.whsCode, label: `${w.whsName} (${w.whsCode})` }))}
                                    value={form.whsCode}
                                    placeholder={warehousesLoading ? 'Loading...' : (form.branchId && filteredWarehouses.length === 0 ? 'No warehouses for this branch' : 'Select warehouse')}
                                    onChange={val => setForm(f => ({ ...f, whsCode: val }))}
                                    hideNone
                                />
                            </FormField>

                            <div className="org-pg-tab-hint">
                                <span>Configure payment methods in the</span>
                                <button type="button" className="org-pg-tab-hint-btn" onClick={() => setActiveTab('payment')}>
                                    Payment tab →
                                </button>
                            </div>
                        </>
                    )}

                    {/* Tab: Payment */}
                    {activeTab === 'payment' && (
                        <div className="org-payment-tab">
                            <div className="org-payment-tab-header">
                                <span className="org-payment-tab-subtitle">Select a payment group to assign to this POS group</span>
                            </div>

                            {/* None Option */}
                            <div
                                className={`org-pg-card ${!form.paymentGroupCode ? 'selected' : ''}`}
                                onClick={() => setForm(f => ({ ...f, paymentGroupCode: '' }))}
                                id="pg-select-none"
                            >
                                <div className="org-pg-card-header">
                                    <div className="org-pg-card-info">
                                        <span className="org-pg-card-icon">🚫</span>
                                        <div>
                                            <span className="org-pg-card-name">None (Unassigned)</span>
                                            <span className="org-pg-card-desc">No payment group assigned</span>
                                        </div>
                                    </div>
                                    <span className="org-pg-card-check"><CheckIcon /></span>
                                </div>
                            </div>

                            {/* Payment Group Cards */}
                            {paymentGroups.map(pg => {
                                const methods = pg.paymentMethods || []
                                const isSelected = form.paymentGroupCode === pg.code
                                const groupedMethods = methods.reduce((acc, m) => {
                                    const type = (m.paymentType || 'Other').toLowerCase()
                                    if (!acc[type]) acc[type] = []
                                    acc[type].push(m)
                                    return acc
                                }, {})
                                const typeSummary = Object.entries(groupedMethods)

                                return (
                                    <div
                                        key={pg.code}
                                        className={`org-pg-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, paymentGroupCode: pg.code }))}
                                        id={`pg-select-${pg.code}`}
                                    >
                                        <div className="org-pg-card-header">
                                            <div className="org-pg-card-info">
                                                <span className="org-pg-card-icon">💳</span>
                                                <div>
                                                    <span className="org-pg-card-name">{pg.description || pg.code}</span>
                                                    <span className="org-pg-card-desc">{pg.code}</span>
                                                </div>
                                            </div>
                                            <span className="org-pg-card-check"><CheckIcon /></span>
                                        </div>

                                        {/* Method chips summary */}
                                        {methods.length > 0 && (
                                            <div className="org-pg-card-chips">
                                                {typeSummary.map(([type, typeMs]) => (
                                                    <span key={type} className={`org-pg-type-chip ${type}`}>
                                                        <span className={`org-method-indicator ${type}`}></span>
                                                        {typeMs.length} {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </span>
                                                ))}
                                                <span className="org-pg-total-chip">{methods.length} total</span>
                                            </div>
                                        )}

                                        {/* Expanded method list when selected */}
                                        {isSelected && methods.length > 0 && (
                                            <div className="org-pg-card-methods">
                                                {Object.entries(groupedMethods).map(([type, typeMs]) => (
                                                    <div key={type} className="org-pg-card-type-section">
                                                        <div className={`org-pg-card-type-label ${type}`}>
                                                            <span className={`org-method-indicator ${type}`}></span>
                                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                                        </div>
                                                        {typeMs.map(m => (
                                                            <div key={m.id || m.code} className="org-pg-card-method-row">
                                                                <span className="org-pg-card-method-name">{m.description || m.code}</span>
                                                                <span className="org-pg-card-method-code">{m.code}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {paymentGroups.length === 0 && (
                                <div className="org-pg-empty-state">
                                    <span>💳</span>
                                    <p>No payment groups configured yet</p>
                                </div>
                            )}
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

export default PosGroupModal
