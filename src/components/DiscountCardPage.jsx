import { useState, useEffect, useCallback } from 'react'

import {
    fetchDiscountCardData,
    createDiscountCard,
    updateDiscountCard,
    deleteDiscountCard,
    uploadDiscountCardImage,
    deleteDiscountCardImage,
    discountCardImageUrl,
} from '../service/api'
import { resetDiscountLookupCache } from '../service/discountLookups'

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

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
)

const CardSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
)

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE']

/* ===== Form Field ===== */
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

/* ===== Add / Edit Modal ===== */
function DiscountCardModal({ card, onSubmit, onClose, onRemoveImage, imageCacheKey }) {
    const isEdit = !!card
    const [form, setForm] = useState({
        code: card?.code || '',
        description: card?.description || '',
        cardType: card?.cardType || '',
        status: card?.status || 'ACTIVE',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [removingImage, setRemovingImage] = useState(false)

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleFileChange = (e) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (!f.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        setError('')
        setImageFile(f)
        const reader = new FileReader()
        reader.onload = (ev) => setImagePreview(ev.target.result)
        reader.readAsDataURL(f)
    }

    const handleRemoveImage = async () => {
        if (!isEdit || !card.hasImage) return
        if (!window.confirm('Remove the current image?')) return
        setRemovingImage(true)
        setError('')
        try {
            await onRemoveImage(card.id)
            setImageFile(null)
            setImagePreview(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setRemovingImage(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.code.trim()) {
            setError('Code is required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                code: form.code.trim(),
                description: form.description || null,
                cardType: form.cardType || null,
                status: form.status,
            }, isEdit, imageFile)
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const showExistingImage = isEdit && card.hasImage && !imagePreview
    const existingSrc = showExistingImage
        ? `${discountCardImageUrl(card.id)}?v=${imageCacheKey || ''}`
        : null

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <CardSvgIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit Discount Card' : 'Add Discount Card'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    <div className="org-form-grid">
                        <FormField label="Code" required>
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.code}
                                onChange={e => updateField('code', e.target.value)}
                                placeholder="e.g. STUDENT_001"
                                disabled={isEdit}
                                id="input-card-code"
                            />
                        </FormField>

                        <FormField label="Card Type">
                            <input
                                type="text"
                                className="org-form-input"
                                value={form.cardType}
                                onChange={e => updateField('cardType', e.target.value)}
                                placeholder="e.g. STUDENT, LOYALTY"
                                id="input-card-type"
                            />
                        </FormField>
                    </div>

                    <FormField label="Description">
                        <input
                            type="text"
                            className="org-form-input"
                            value={form.description}
                            onChange={e => updateField('description', e.target.value)}
                            placeholder="e.g. Student Discount Card"
                            id="input-card-description"
                        />
                    </FormField>

                    <FormField label="Status">
                        <select
                            className="org-form-input"
                            value={form.status}
                            onChange={e => updateField('status', e.target.value)}
                            id="input-card-status"
                        >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </FormField>

                    <FormField label="Card Image">
                        <div className="discount-card-image-uploader">
                            {(imagePreview || existingSrc) && (
                                <div className="discount-card-image-preview">
                                    <img
                                        src={imagePreview || existingSrc}
                                        alt={form.code || 'card preview'}
                                    />
                                </div>
                            )}
                            <div className="discount-card-image-actions">
                                <label className="toolbar-btn" htmlFor="input-card-image">
                                    {imagePreview
                                        ? 'Change selection'
                                        : (showExistingImage ? 'Replace image' : 'Choose image...')}
                                </label>
                                <input
                                    id="input-card-image"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                {imagePreview && (
                                    <button
                                        type="button"
                                        className="toolbar-btn"
                                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                                    >
                                        Clear selection
                                    </button>
                                )}
                                {showExistingImage && (
                                    <button
                                        type="button"
                                        className="toolbar-btn"
                                        style={{ color: '#dc2626' }}
                                        onClick={handleRemoveImage}
                                        disabled={removingImage}
                                    >
                                        {removingImage ? 'Removing...' : 'Remove image'}
                                    </button>
                                )}
                            </div>
                            {!isEdit && (
                                <small style={{ color: 'var(--text-muted, #888)' }}>
                                    Image uploads after the card is created.
                                </small>
                            )}
                            {imageFile && (
                                <small style={{ color: 'var(--text-muted, #888)' }}>
                                    Selected: {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                                </small>
                            )}
                        </div>
                    </FormField>

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting} id="btn-submit-card">
                            {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Card')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ===== Confirm Delete ===== */
function ConfirmDeleteModal({ card, onConfirm, onClose }) {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleConfirm = async () => {
        setSubmitting(true)
        setError('')
        try {
            await onConfirm()
            onClose()
        } catch (err) {
            setError(err.message)
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div className="org-modal-header">
                    <h3 className="org-modal-title">Delete Discount Card</h3>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    <p style={{ margin: 0 }}>
                        Are you sure you want to delete <strong>{card.code}</strong>
                        {card.description ? ` — ${card.description}` : ''}? This cannot be undone.
                    </p>
                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button
                            type="button"
                            className="toolbar-btn primary"
                            style={{ background: '#dc2626', borderColor: '#dc2626' }}
                            onClick={handleConfirm}
                            disabled={submitting}
                            id="btn-confirm-delete-card"
                        >
                            {submitting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ===== Card Tile ===== */
function DiscountCardTile({ card, onEdit, onDelete, imageCacheKey }) {
    return (
        <div className="bank-card" id={`discount-card-${card.id}`}>
            {card.hasImage && (
                <div className="discount-card-tile-image">
                    <img
                        src={`${discountCardImageUrl(card.id)}?v=${imageCacheKey || ''}`}
                        alt={card.code}
                    />
                </div>
            )}
            <div className="bank-card-header">
                <div className="bank-card-icon-wrapper">
                    <CardSvgIcon />
                </div>
                <div className="bank-card-info">
                    <span className="bank-card-code">{card.code}</span>
                    <span className="bank-card-desc">{card.description || '—'}</span>
                </div>
                <span
                    className="discount-card-status-pill"
                    data-status={card.status}
                >
                    {card.status}
                </span>
            </div>

            <div className="bank-card-meta">
                <div className="bank-card-meta-item">
                    <span className="bank-card-meta-label">Card Type</span>
                    <span className="bank-card-meta-value">{card.cardType || '—'}</span>
                </div>
                <div className="bank-card-meta-item">
                    <span className="bank-card-meta-label">ID</span>
                    <span className="bank-card-meta-value">{card.id}</span>
                </div>
            </div>

            <div className="bank-card-footer">
                <button
                    className="bank-card-details-btn"
                    onClick={() => onEdit(card)}
                    id={`btn-edit-card-${card.id}`}
                >
                    <EditIcon />
                    <span>Edit</span>
                </button>
                <button
                    className="bank-card-details-btn"
                    onClick={() => onDelete(card)}
                    id={`btn-delete-card-${card.id}`}
                    style={{ color: '#dc2626' }}
                >
                    <TrashIcon />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    )
}

/* ===== Loading ===== */
function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

/* ===== Page ===== */
function DiscountCardPage({ onBack }) {
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [imageCacheKey, setImageCacheKey] = useState(Date.now())

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetchDiscountCardData()
            setCards(Array.isArray(res) ? res : [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleSubmit = async (data, isEdit, imageFile) => {
        let savedId
        if (isEdit) {
            const updated = await updateDiscountCard(editing.id, data)
            savedId = updated?.id ?? editing.id
        } else {
            const created = await createDiscountCard(data)
            savedId = created?.id
        }
        if (imageFile && savedId != null) {
            await uploadDiscountCardImage(savedId, imageFile)
            setImageCacheKey(Date.now())
        }
        resetDiscountLookupCache()
        await loadData()
    }

    const handleRemoveImage = async (id) => {
        await deleteDiscountCardImage(id)
        setImageCacheKey(Date.now())
        const fresh = await fetchDiscountCardData()
        const list = Array.isArray(fresh) ? fresh : []
        setCards(list)
        if (editing) {
            const updated = list.find(c => c.id === editing.id)
            if (updated) setEditing(updated)
        }
    }

    const handleDelete = async () => {
        await deleteDiscountCard(deleting.id)
        resetDiscountLookupCache()
        await loadData()
    }

    const query = searchQuery.toLowerCase()
    const filtered = cards.filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
        if (!query) return true
        return (
            (c.code || '').toLowerCase().includes(query) ||
            (c.description || '').toLowerCase().includes(query) ||
            (c.cardType || '').toLowerCase().includes(query)
        )
    })

    const activeCount = cards.filter(c => c.status === 'ACTIVE').length
    const inactiveCount = cards.filter(c => c.status === 'INACTIVE').length

    return (
        <div className="org-page">
            <div className="org-content">
                <div className="org-main">
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack} id="discount-card-back-btn">
                            <BackIcon />
                            <span>Back to Dashboard</span>
                        </button>
                        <h2 className="org-page-title">Discount Cards</h2>
                        <p className="org-page-subtitle">Manage non-payment cards (student, loyalty, employee) that qualify receipts for discounts</p>
                    </div>

                    <div className="org-summary-stats bank-summary-stats">
                        <div className="org-stat-card">
                            <span className="org-stat-number">{cards.length}</span>
                            <span className="org-stat-label">Total Cards</span>
                        </div>
                        <div className="org-stat-card">
                            <span className="org-stat-number">{activeCount}</span>
                            <span className="org-stat-label">Active</span>
                        </div>
                        <div className="org-stat-card">
                            <span className="org-stat-number">{inactiveCount}</span>
                            <span className="org-stat-label">Inactive</span>
                        </div>
                    </div>

                    <div className="org-toolbar">
                        <div className="org-search-wrapper">
                            <SearchIcon />
                            <input
                                type="text"
                                className="org-search-input"
                                placeholder="Search by code, description, or type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="discount-card-search-input"
                            />
                        </div>
                        <div className="org-toolbar-actions">
                            <select
                                className="toolbar-btn"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                id="discount-card-status-filter"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <button className="toolbar-btn" onClick={loadData} title="Refresh">
                                <RefreshIcon /> Refresh
                            </button>
                            <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)} id="btn-add-discount-card">
                                <PlusIcon /> Add Card
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="org-error-banner">
                            <span>⚠ {error}</span>
                            <button className="org-error-retry" onClick={loadData}>Retry</button>
                        </div>
                    )}

                    {loading && <LoadingSpinner text="Loading discount cards..." />}

                    {!loading && (
                        <div className="bank-grid">
                            {filtered.length > 0 ? (
                                filtered.map(card => (
                                    <DiscountCardTile
                                        key={card.id}
                                        card={card}
                                        onEdit={setEditing}
                                        onDelete={setDeleting}
                                        imageCacheKey={imageCacheKey}
                                    />
                                ))
                            ) : (
                                <div className="org-empty-state">
                                    <SearchIcon />
                                    <p>{searchQuery || statusFilter !== 'ALL'
                                        ? 'No cards match your filters'
                                        : 'No discount cards yet. Add one to get started.'}</p>
                                    {!searchQuery && statusFilter === 'ALL' && (
                                        <button className="toolbar-btn primary" onClick={() => setShowAddModal(true)}>
                                            <PlusIcon /> Add Card
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <DiscountCardModal
                    card={null}
                    onSubmit={handleSubmit}
                    onClose={() => setShowAddModal(false)}
                    onRemoveImage={handleRemoveImage}
                    imageCacheKey={imageCacheKey}
                />
            )}

            {editing && (
                <DiscountCardModal
                    card={editing}
                    onSubmit={handleSubmit}
                    onClose={() => setEditing(null)}
                    onRemoveImage={handleRemoveImage}
                    imageCacheKey={imageCacheKey}
                />
            )}

            {deleting && (
                <ConfirmDeleteModal
                    card={deleting}
                    onConfirm={handleDelete}
                    onClose={() => setDeleting(null)}
                />
            )}
        </div>
    )
}

export default DiscountCardPage
