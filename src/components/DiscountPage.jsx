import { useState, useEffect, useCallback } from 'react'
import {
    API_BASE, fetchJSON,
    fetchDiscountSchemes, createDiscountScheme, updateDiscountScheme,
    deleteDiscountScheme, generateCoupons, fetchCouponsByScheme,
    activateCoupon, deactivateCoupon
} from '../service/api'
import { formatDate } from './discount/constants'
import { prefetchDiscountLookups } from '../service/discountLookups'
import {
    BackIcon, SearchIcon, PlusIcon, RefreshIcon,
    PlayIcon, PauseIcon, StopIcon, EditIcon, TagSvgIcon
} from './discount/Icons'
import { LoadingSpinner, StatusBadge, ConfirmDialog, FormField } from './discount/FormField'
import SchemeCard from './discount/SchemeCard'
import SchemeDetailPanel from './discount/SchemeDetailPanel'
import SchemeModal from './discount/SchemeModal'
import GenerateCouponsModal from './discount/GenerateCouponsModal'
import CouponCard from './discount/CouponCard'
import CouponValidator from './discount/CouponValidator'

export default function DiscountPage({ onBack, initialTab = 'schemes' }) {
    const [activeTab, setActiveTab] = useState(initialTab)

    // ── Terminals (for scope selector) ──
    const [terminals, setTerminals] = useState([])

    // ── Scheme state ──
    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedScheme, setSelectedScheme] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [showSchemeModal, setShowSchemeModal] = useState(false)
    const [editingScheme, setEditingScheme] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    // ── Coupon state ──
    const [coupons, setCoupons] = useState([])
    const [couponSchemeId, setCouponSchemeId] = useState('')
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponSearch, setCouponSearch] = useState('')
    const [showGenerateModal, setShowGenerateModal] = useState(false)

    /* ── Load Schemes ── */
    const loadSchemes = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await fetchDiscountSchemes()
            const nextSchemes = Array.isArray(data) ? data : []
            setSchemes(nextSchemes)
            setSelectedScheme(current => {
                if (!current) return current
                return nextSchemes.find(scheme => scheme.id === current.id) || current
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadSchemes() }, [loadSchemes])
    useEffect(() => { prefetchDiscountLookups() }, [])

    /* ── Load Terminals once (for scope selector) ── */
    useEffect(() => {
        fetchJSON(`${API_BASE}/api/pos_terminal/all`)
            .then(data => setTerminals(Array.isArray(data) ? data : []))
            .catch(() => setTerminals([]))
    }, [])

    /* ── Load Coupons by scheme ── */
    const loadCoupons = useCallback(async (schemeId) => {
        if (!schemeId) { setCoupons([]); return }
        setCouponLoading(true)
        try {
            const data = await fetchCouponsByScheme(schemeId)
            setCoupons(Array.isArray(data) ? data : [])
        } catch {
            setCoupons([])
        } finally {
            setCouponLoading(false)
        }
    }, [])

    useEffect(() => {
        if (couponSchemeId) loadCoupons(couponSchemeId)
    }, [couponSchemeId, loadCoupons])

    /* ── Scheme CRUD handlers ── */
    const handleSubmitScheme = async (data, isEdit) => {
        if (isEdit) await updateDiscountScheme(editingScheme.id, data)
        else await createDiscountScheme(data)
        await loadSchemes()
    }
    const handleDeleteScheme = async () => {
        if (!confirmDelete) return
        try {
            await deleteDiscountScheme(confirmDelete.id)
            setSelectedScheme(null)
            setConfirmDelete(null)
            await loadSchemes()
        } catch (err) {
            setError(err.message)
            setConfirmDelete(null)
        }
    }
    const handleEditScheme = (scheme) => {
        setEditingScheme(scheme)
        setShowSchemeModal(true)
    }

    /* ── Coupon handlers ── */
    const handleGenerateCoupons = async (data) => {
        await generateCoupons(data)
        if (couponSchemeId) await loadCoupons(couponSchemeId)
    }
    const handleToggleCoupon = async (coupon) => {
        try {
            if (coupon.isActive) await deactivateCoupon(coupon.id)
            else await activateCoupon(coupon.id)
            if (couponSchemeId) await loadCoupons(couponSchemeId)
        } catch (err) {
            setError(err.message)
        }
    }

    /* ── Filtering ── */
    const query = searchQuery.toLowerCase()
    const filteredSchemes = schemes.filter(s => {
        const matchesQuery = (s.name || '').toLowerCase().includes(query)
            || (s.description || '').toLowerCase().includes(query)
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
        return matchesQuery && matchesStatus
    })

    const filteredCoupons = coupons.filter(c =>
        (c.code || '').toLowerCase().includes(couponSearch.toLowerCase())
    )

    /* ── Stats ── */
    const activeCount = schemes.filter(s => s.status === 'ACTIVE').length
    const draftCount = schemes.filter(s => s.status === 'DRAFT').length
    const pausedCount = schemes.filter(s => s.status === 'PAUSED').length
    const expiredCount = schemes.filter(s => s.status === 'EXPIRED').length

    const pageTabs = [
        { key: 'schemes', label: 'Discount Schemes' },
        { key: 'coupons', label: 'Coupon Management' },
        { key: 'campaigns', label: 'Campaign Overview' },
    ]

    return (
        <div className={`org-page ${selectedScheme ? 'panel-open' : ''}`}>
            <div className="org-content">
                <div className={`org-main ${selectedScheme ? 'with-panel' : ''}`}>
                    {/* Page Title */}
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack}>
                            <BackIcon /><span>Back to Dashboard</span>
                        </button>
                        <h2 className="org-page-title">Discount Management</h2>
                        <p className="org-page-subtitle">Configure discount schemes, rules, coupons, and campaigns</p>
                    </div>

                    {/* Page-level Tabs */}
                    <div className="disc-page-tabs">
                        {pageTabs.map(t => (
                            <button key={t.key}
                                className={`disc-page-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >{t.label}</button>
                        ))}
                    </div>

                    {/* ════════ SCHEMES TAB ════════ */}
                    {activeTab === 'schemes' && (
                        <>
                            {/* Summary Stats */}
                            <div className="org-summary-stats disc-summary-stats">
                                <div className="org-stat-card" onClick={() => setStatusFilter('ALL')}>
                                    <span className="org-stat-number">{schemes.length}</span>
                                    <span className="org-stat-label">Total Schemes</span>
                                </div>
                                <div className="org-stat-card stat-active" onClick={() => setStatusFilter('ACTIVE')}>
                                    <span className="org-stat-number">{activeCount}</span>
                                    <span className="org-stat-label">Active</span>
                                </div>
                                <div className="org-stat-card stat-draft" onClick={() => setStatusFilter('DRAFT')}>
                                    <span className="org-stat-number">{draftCount}</span>
                                    <span className="org-stat-label">Draft</span>
                                </div>
                                <div className="org-stat-card stat-paused" onClick={() => setStatusFilter('PAUSED')}>
                                    <span className="org-stat-number">{pausedCount}</span>
                                    <span className="org-stat-label">Paused</span>
                                </div>
                                <div className="org-stat-card stat-expired" onClick={() => setStatusFilter('EXPIRED')}>
                                    <span className="org-stat-number">{expiredCount}</span>
                                    <span className="org-stat-label">Expired</span>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="org-toolbar">
                                <div className="org-search-wrapper">
                                    <SearchIcon />
                                    <input type="text" className="org-search-input" placeholder="Search schemes..."
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>
                                <div className="org-toolbar-actions">
                                    {statusFilter !== 'ALL' && (
                                        <button className="toolbar-btn small" onClick={() => setStatusFilter('ALL')}>
                                            Clear Filter
                                        </button>
                                    )}
                                    <button className="toolbar-btn" onClick={loadSchemes} title="Refresh">
                                        <RefreshIcon /> Refresh
                                    </button>
                                    <button className="toolbar-btn primary" onClick={() => { setEditingScheme(null); setShowSchemeModal(true) }}>
                                        <PlusIcon /> New Scheme
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="org-error-banner">
                                    <span>{error}</span>
                                    <button className="org-error-retry" onClick={loadSchemes}>Retry</button>
                                </div>
                            )}

                            {loading && <LoadingSpinner text="Loading discount schemes..." />}

                            {!loading && (
                                <div className="disc-scheme-grid">
                                    {filteredSchemes.length > 0 ? (
                                        filteredSchemes.map(scheme => (
                                            <SchemeCard
                                                key={scheme.id}
                                                scheme={scheme}
                                                isSelected={selectedScheme?.id === scheme.id}
                                                onSelect={setSelectedScheme}
                                            />
                                        ))
                                    ) : (
                                        <div className="org-empty-state">
                                            <SearchIcon />
                                            <p>{searchQuery || statusFilter !== 'ALL'
                                                ? 'No schemes match your filters'
                                                : 'No discount schemes yet. Create one to get started.'}</p>
                                            {!searchQuery && statusFilter === 'ALL' && (
                                                <button className="toolbar-btn primary" onClick={() => { setEditingScheme(null); setShowSchemeModal(true) }}>
                                                    <PlusIcon /> New Scheme
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ════════ COUPONS TAB ════════ */}
                    {activeTab === 'coupons' && (
                        <>
                            <CouponValidator />

                            <div className="org-toolbar">
                                <div className="disc-coupon-toolbar-left">
                                    <FormField label="Filter by Scheme">
                                        <select className="org-form-input" value={couponSchemeId} onChange={e => setCouponSchemeId(e.target.value)}>
                                            <option value="">-- Select Scheme --</option>
                                            {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </FormField>
                                    {couponSchemeId && (
                                        <div className="org-search-wrapper">
                                            <SearchIcon />
                                            <input type="text" className="org-search-input" placeholder="Search coupons..."
                                                value={couponSearch} onChange={e => setCouponSearch(e.target.value)} />
                                        </div>
                                    )}
                                </div>
                                <div className="org-toolbar-actions">
                                    <button className="toolbar-btn primary" onClick={() => setShowGenerateModal(true)}>
                                        <PlusIcon /> Generate Coupons
                                    </button>
                                </div>
                            </div>

                            {!couponSchemeId && (
                                <div className="org-empty-state">
                                    <TagSvgIcon />
                                    <p>Select a discount scheme above to view its coupons</p>
                                </div>
                            )}

                            {couponSchemeId && couponLoading && <LoadingSpinner text="Loading coupons..." />}

                            {couponSchemeId && !couponLoading && (
                                <div className="disc-coupon-stats-row">
                                    <span className="disc-coupon-stat">Total: <strong>{coupons.length}</strong></span>
                                    <span className="disc-coupon-stat">Active: <strong>{coupons.filter(c => c.isActive).length}</strong></span>
                                    <span className="disc-coupon-stat">Used: <strong>{coupons.filter(c => (c.usedCount || 0) > 0).length}</strong></span>
                                </div>
                            )}

                            {couponSchemeId && !couponLoading && (
                                <div className="disc-coupon-grid">
                                    {filteredCoupons.length > 0 ? (
                                        filteredCoupons.map(coupon => (
                                            <CouponCard key={coupon.id} coupon={coupon} onToggle={handleToggleCoupon} />
                                        ))
                                    ) : (
                                        <div className="org-empty-state">
                                            <TagSvgIcon />
                                            <p>No coupons found for this scheme</p>
                                            <button className="toolbar-btn primary" onClick={() => setShowGenerateModal(true)}>
                                                <PlusIcon /> Generate Coupons
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ════════ CAMPAIGNS TAB ════════ */}
                    {activeTab === 'campaigns' && (
                        <div className="disc-campaigns-overview">
                            <div className="disc-campaign-summary-grid">
                                <div className="disc-campaign-card">
                                    <div className="disc-campaign-card-icon active"><PlayIcon /></div>
                                    <div className="disc-campaign-card-content">
                                        <span className="disc-campaign-card-number">{activeCount}</span>
                                        <span className="disc-campaign-card-label">Active Campaigns</span>
                                    </div>
                                </div>
                                <div className="disc-campaign-card">
                                    <div className="disc-campaign-card-icon draft"><EditIcon /></div>
                                    <div className="disc-campaign-card-content">
                                        <span className="disc-campaign-card-number">{draftCount}</span>
                                        <span className="disc-campaign-card-label">Drafts</span>
                                    </div>
                                </div>
                                <div className="disc-campaign-card">
                                    <div className="disc-campaign-card-icon paused"><PauseIcon /></div>
                                    <div className="disc-campaign-card-content">
                                        <span className="disc-campaign-card-number">{pausedCount}</span>
                                        <span className="disc-campaign-card-label">Paused</span>
                                    </div>
                                </div>
                                <div className="disc-campaign-card">
                                    <div className="disc-campaign-card-icon expired"><StopIcon /></div>
                                    <div className="disc-campaign-card-content">
                                        <span className="disc-campaign-card-number">{expiredCount}</span>
                                        <span className="disc-campaign-card-label">Expired</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="disc-section-title">Active Campaigns</h3>
                            {schemes.filter(s => s.status === 'ACTIVE').length > 0 ? (
                                <div className="disc-campaign-list">
                                    {schemes.filter(s => s.status === 'ACTIVE').map(s => (
                                        <div key={s.id} className="disc-campaign-list-item">
                                            <div className="disc-campaign-list-left">
                                                <span className="disc-campaign-list-name">{s.name}</span>
                                                <span className="disc-campaign-list-desc">{s.description || 'No description'}</span>
                                            </div>
                                            <div className="disc-campaign-list-right">
                                                <span className="disc-campaign-list-dates">{formatDate(s.validFrom)} - {formatDate(s.validTo)}</span>
                                                <span className="disc-campaign-list-rules">{s.rules?.length || 0} rules</span>
                                            </div>
                                            <button className="toolbar-btn tiny" onClick={() => { setActiveTab('schemes'); setSelectedScheme(s) }}>
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="org-empty-state">
                                    <PlayIcon />
                                    <p>No active campaigns right now</p>
                                </div>
                            )}

                            <h3 className="disc-section-title">Upcoming (Drafts)</h3>
                            {schemes.filter(s => s.status === 'DRAFT').length > 0 ? (
                                <div className="disc-campaign-list">
                                    {schemes.filter(s => s.status === 'DRAFT').map(s => (
                                        <div key={s.id} className="disc-campaign-list-item draft">
                                            <div className="disc-campaign-list-left">
                                                <span className="disc-campaign-list-name">{s.name}</span>
                                                <span className="disc-campaign-list-desc">{s.description || 'No description'}</span>
                                            </div>
                                            <div className="disc-campaign-list-right">
                                                <span className="disc-campaign-list-dates">{formatDate(s.validFrom)} - {formatDate(s.validTo)}</span>
                                                <StatusBadge status={s.status} />
                                            </div>
                                            <button className="toolbar-btn tiny primary" onClick={() => { setActiveTab('schemes'); setSelectedScheme(s) }}>
                                                Edit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="disc-empty-text">No drafts</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Detail Side Panel */}
                {selectedScheme && activeTab === 'schemes' && (
                    <SchemeDetailPanel
                        scheme={selectedScheme}
                        onClose={() => setSelectedScheme(null)}
                        onRefresh={loadSchemes}
                        onEdit={handleEditScheme}
                    />
                )}
            </div>

            {/* Modals */}
            {showSchemeModal && (
                <SchemeModal
                    scheme={editingScheme}
                    terminals={terminals}
                    onSubmit={handleSubmitScheme}
                    onClose={() => { setShowSchemeModal(false); setEditingScheme(null) }}
                />
            )}

            {showGenerateModal && (
                <GenerateCouponsModal
                    schemes={schemes}
                    onSubmit={handleGenerateCoupons}
                    onClose={() => setShowGenerateModal(false)}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    title="Delete Scheme"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
                    onConfirm={handleDeleteScheme}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    )
}
