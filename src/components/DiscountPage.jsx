import { useState, useEffect, useCallback } from 'react'
import {
    fetchDiscountSchemes, fetchDiscountScheme, createDiscountScheme, updateDiscountScheme,
    deleteDiscountScheme, activateScheme, pauseScheme, expireScheme,
    generateCoupons, fetchCouponsByScheme, activateCoupon, deactivateCoupon, validateCoupon
} from '../service/api'

/* ═══════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════ */
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
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)
const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
)
const PauseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
    </svg>
)
const StopIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
)
const TagSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
)
const PercentSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
)
const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
)
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)
const ChevronDownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const ChevronUpIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
    </svg>
)

/* ═══════════════════════════════════════════════════
   Constants / Enum Options
   ═══════════════════════════════════════════════════ */
const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED']
const COMBINATION_MODES = ['EXCLUSIVE', 'ADDITIVE', 'BEST_OF']
const SCOPES = ['GLOBAL', 'POS_GROUP', 'POS_TERMINAL']
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'TIERED', 'BUY_X_GET_Y', 'FREE_ITEM']
const APPLY_TO = ['TRANSACTION', 'LINE_ITEM', 'CHEAPEST_ITEM']
const ROUNDING_RULES = ['NEAREST_CENT', 'FLOOR', 'CEILING']
const CONDITION_TYPES = ['PRODUCT', 'CATEGORY', 'CUSTOMER_GROUP', 'PAYMENT_METHOD', 'TIME_OF_DAY', 'DAY_OF_WEEK', 'QUANTITY_THRESHOLD', 'BASKET_VALUE', 'FIRST_PURCHASE', 'COUPON_CODE']
const CONDITION_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'IN', 'NOT_IN', 'BETWEEN']
const ENTITLEMENT_TYPES = ['PUBLIC', 'CUSTOMER_GROUP', 'SPECIFIC_CUSTOMER', 'COUPON']
const COUPON_TYPES = ['SINGLE_USE', 'MULTI_USE']
const BUY_X_GET_Y_SCOPES = ['SPECIFIC_PRODUCTS', 'ANY_PRODUCT']

const STATUS_COLORS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired'
}

function formatDate(dt) {
    if (!dt) return '--'
    try {
        const d = new Date(dt)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch { return String(dt) }
}

function formatDateTime(dt) {
    if (!dt) return '--'
    try {
        const d = new Date(dt)
        return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return String(dt) }
}

function toLocalInput(dt) {
    if (!dt) return ''
    try {
        const d = new Date(dt)
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch { return '' }
}

/* ═══════════════════════════════════════════════════
   Reusable Sub-components
   ═══════════════════════════════════════════════════ */
function FormField({ label, children, required, hint }) {
    return (
        <div className="disc-form-field">
            <label className="disc-form-label">
                {label} {required && <span className="disc-form-required">*</span>}
            </label>
            {children}
            {hint && <span className="disc-form-hint">{hint}</span>}
        </div>
    )
}

function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

function StatusBadge({ status }) {
    return (
        <span className={`disc-status-badge ${STATUS_COLORS[status] || 'draft'}`}>
            {status}
        </span>
    )
}

function ConfirmDialog({ title, message, onConfirm, onCancel }) {
    return (
        <div className="org-modal-overlay" onClick={onCancel}>
            <div className="disc-confirm-dialog" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="disc-confirm-actions">
                    <button className="toolbar-btn" onClick={onCancel}>Cancel</button>
                    <button className="toolbar-btn danger" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Scheme Card
   ═══════════════════════════════════════════════════ */
function SchemeCard({ scheme, isSelected, onSelect }) {
    const ruleCount = scheme.rules?.length || 0
    const entCount = scheme.entitlements?.length || 0

    return (
        <div className={`disc-scheme-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(scheme)}>
            <div className="disc-scheme-card-header">
                <div className="disc-scheme-card-icon">
                    <PercentSvgIcon />
                </div>
                <div className="disc-scheme-card-info">
                    <span className="disc-scheme-card-name">{scheme.name}</span>
                    <span className="disc-scheme-card-desc">{scheme.description || '--'}</span>
                </div>
                <StatusBadge status={scheme.status} />
            </div>

            <div className="disc-scheme-card-meta">
                <div className="disc-scheme-card-meta-item">
                    <span className="disc-meta-label">Priority</span>
                    <span className="disc-meta-value">{scheme.priority ?? '--'}</span>
                </div>
                <div className="disc-scheme-card-meta-item">
                    <span className="disc-meta-label">Mode</span>
                    <span className="disc-meta-value">{scheme.combinationMode || '--'}</span>
                </div>
                <div className="disc-scheme-card-meta-item">
                    <span className="disc-meta-label">Scope</span>
                    <span className="disc-meta-value">{scheme.scope || '--'}</span>
                </div>
                <div className="disc-scheme-card-meta-item">
                    <span className="disc-meta-label">Rules</span>
                    <span className="disc-meta-value">{ruleCount}</span>
                </div>
            </div>

            <div className="disc-scheme-card-dates">
                <span className="disc-date-range">{formatDate(scheme.validFrom)} - {formatDate(scheme.validTo)}</span>
            </div>

            <div className="disc-scheme-card-footer">
                <span className="disc-ent-count">{entCount} entitlement{entCount !== 1 ? 's' : ''}</span>
                <button className="disc-card-details-btn" onClick={e => { e.stopPropagation(); onSelect(scheme) }}>
                    <EditIcon /> <span>Details</span>
                </button>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Scheme Detail Panel
   ═══════════════════════════════════════════════════ */
function SchemeDetailPanel({ scheme, onClose, onRefresh, onEdit }) {
    const [acting, setActing] = useState(false)
    const [msg, setMsg] = useState('')

    const doAction = async (fn, label) => {
        setActing(true)
        setMsg('')
        try {
            await fn(scheme.id)
            setMsg(`${label} successful`)
            onRefresh()
        } catch (err) {
            setMsg('Error: ' + err.message)
        } finally {
            setActing(false)
        }
    }

    if (!scheme) return null

    return (
        <div className="org-settings-panel">
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row">
                    <PercentSvgIcon />
                    <h3 className="org-settings-panel-title">{scheme.name}</h3>
                </div>
                <div className="org-settings-header-actions">
                    <button className="org-settings-edit-btn" onClick={() => onEdit(scheme)} title="Edit"><EditIcon /></button>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>

            {msg && <div className={`org-save-msg ${msg.startsWith('Error') ? 'error' : 'success'}`}>{msg}</div>}

            {/* Status & Lifecycle actions */}
            <div className="disc-detail-status-row">
                <StatusBadge status={scheme.status} />
                <div className="disc-lifecycle-actions">
                    {(scheme.status === 'DRAFT' || scheme.status === 'PAUSED') && (
                        <button className="toolbar-btn small success" onClick={() => doAction(activateScheme, 'Activation')} disabled={acting}>
                            <PlayIcon /> Activate
                        </button>
                    )}
                    {scheme.status === 'ACTIVE' && (
                        <button className="toolbar-btn small warning" onClick={() => doAction(pauseScheme, 'Pause')} disabled={acting}>
                            <PauseIcon /> Pause
                        </button>
                    )}
                    {(scheme.status === 'ACTIVE' || scheme.status === 'PAUSED') && (
                        <button className="toolbar-btn small danger" onClick={() => doAction(expireScheme, 'Expire')} disabled={acting}>
                            <StopIcon /> Expire
                        </button>
                    )}
                </div>
            </div>

            {/* Info Grid */}
            <div className="org-settings-info-grid">
                <div className="org-settings-info-item">
                    <span className="org-settings-info-label">ID</span>
                    <span className="org-settings-info-value mono">{scheme.id}</span>
                </div>
                <div className="org-settings-info-item">
                    <span className="org-settings-info-label">Priority</span>
                    <span className="org-settings-info-value">{scheme.priority ?? '--'}</span>
                </div>
                <div className="org-settings-info-item">
                    <span className="org-settings-info-label">Combination</span>
                    <span className="org-settings-info-value">{scheme.combinationMode}</span>
                </div>
                <div className="org-settings-info-item">
                    <span className="org-settings-info-label">Scope</span>
                    <span className="org-settings-info-value">{scheme.scope}</span>
                </div>
            </div>

            <div className="org-settings-divider" />

            {/* Dates */}
            <h4 className="org-settings-section-title">Validity Period</h4>
            <div className="org-settings-list">
                <div className="org-setting-row">
                    <span className="org-setting-label">Valid From</span>
                    <span className="org-setting-value">{formatDateTime(scheme.validFrom)}</span>
                </div>
                <div className="org-setting-row">
                    <span className="org-setting-label">Valid To</span>
                    <span className="org-setting-value">{formatDateTime(scheme.validTo)}</span>
                </div>
                <div className="org-setting-row">
                    <span className="org-setting-label">Approved By</span>
                    <span className="org-setting-value">{scheme.approvedBy || '--'}</span>
                </div>
            </div>

            {/* Scope IDs */}
            {scheme.scopeIds && scheme.scopeIds.length > 0 && (
                <>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Scope IDs</h4>
                    <div className="disc-tag-list">
                        {scheme.scopeIds.map((id, i) => (
                            <span key={i} className="disc-tag">{id}</span>
                        ))}
                    </div>
                </>
            )}

            {/* Description */}
            {scheme.description && (
                <>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Description</h4>
                    <p className="disc-description-text">{scheme.description}</p>
                </>
            )}

            {/* Rules */}
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Rules ({scheme.rules?.length || 0})</h4>
            {scheme.rules && scheme.rules.length > 0 ? (
                <div className="disc-rules-list">
                    {scheme.rules.map((rule, idx) => (
                        <RuleDetailCard key={rule.id || idx} rule={rule} index={idx} />
                    ))}
                </div>
            ) : (
                <p className="disc-empty-text">No rules configured</p>
            )}

            {/* Entitlements */}
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Entitlements ({scheme.entitlements?.length || 0})</h4>
            {scheme.entitlements && scheme.entitlements.length > 0 ? (
                <div className="disc-entitlements-list">
                    {scheme.entitlements.map((ent, idx) => (
                        <div key={ent.id || idx} className="disc-entitlement-item">
                            <span className="disc-ent-type-badge">{ent.entitlementType}</span>
                            {ent.referenceId && <span className="disc-ent-ref">Ref: {ent.referenceId}</span>}
                            {ent.usageLimitPerCustomer && <span className="disc-ent-limit">Limit: {ent.usageLimitPerCustomer}/customer</span>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="disc-empty-text">No entitlements configured</p>
            )}

            {/* Audit */}
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Audit</h4>
            <div className="org-settings-list">
                <div className="org-setting-row">
                    <span className="org-setting-label">Created</span>
                    <span className="org-setting-value">{formatDateTime(scheme.createdAt)}</span>
                </div>
                <div className="org-setting-row">
                    <span className="org-setting-label">Updated</span>
                    <span className="org-setting-value">{formatDateTime(scheme.updatedAt)}</span>
                </div>
            </div>
        </div>
    )
}

/* ─── Rule Detail Card (inside panel) ─── */
function RuleDetailCard({ rule, index }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="disc-rule-card">
            <div className="disc-rule-card-header" onClick={() => setExpanded(!expanded)}>
                <div className="disc-rule-card-left">
                    <span className="disc-rule-seq">#{rule.sequence ?? index + 1}</span>
                    <span className="disc-rule-name">{rule.name || `Rule ${index + 1}`}</span>
                </div>
                <div className="disc-rule-card-right">
                    <span className="disc-type-badge">{rule.discountType}</span>
                    {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
            </div>
            {expanded && (
                <div className="disc-rule-card-body">
                    <div className="disc-rule-detail-grid">
                        <div><span className="disc-dl-label">Value:</span> <span>{rule.discountValue}</span></div>
                        <div><span className="disc-dl-label">Apply To:</span> <span>{rule.applyTo}</span></div>
                        <div><span className="disc-dl-label">Max Discount:</span> <span>{rule.maxDiscountAmount ?? '--'}</span></div>
                        <div><span className="disc-dl-label">Min Order:</span> <span>{rule.minOrderAmount ?? '--'}</span></div>
                        <div><span className="disc-dl-label">Min Qty:</span> <span>{rule.minQuantity ?? '--'}</span></div>
                        <div><span className="disc-dl-label">Rounding:</span> <span>{rule.roundingRule ?? '--'}</span></div>
                    </div>

                    {/* Conditions */}
                    {rule.conditions && rule.conditions.length > 0 && (
                        <div className="disc-rule-sub-section">
                            <h5>Conditions ({rule.conditions.length})</h5>
                            {rule.conditions.map((c, ci) => (
                                <div key={c.id || ci} className="disc-condition-row">
                                    <span className="disc-cond-type">{c.conditionType}</span>
                                    <span className="disc-cond-op">{c.operator}</span>
                                    <span className="disc-cond-val">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tiers */}
                    {rule.tiers && rule.tiers.length > 0 && (
                        <div className="disc-rule-sub-section">
                            <h5>Tiers ({rule.tiers.length})</h5>
                            <table className="disc-tier-table">
                                <thead>
                                    <tr><th>Min</th><th>Max</th><th>Type</th><th>Value</th></tr>
                                </thead>
                                <tbody>
                                    {rule.tiers.map((t, ti) => (
                                        <tr key={t.id || ti}>
                                            <td>{t.minValue}</td>
                                            <td>{t.maxValue ?? '---'}</td>
                                            <td>{t.discountType}</td>
                                            <td>{t.discountValue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* BuyXGetY */}
                    {rule.buyXGetYRule && (
                        <div className="disc-rule-sub-section">
                            <h5>Buy X Get Y</h5>
                            <div className="disc-rule-detail-grid">
                                <div><span className="disc-dl-label">Buy Qty:</span> <span>{rule.buyXGetYRule.buyQuantity}</span></div>
                                <div><span className="disc-dl-label">Buy Scope:</span> <span>{rule.buyXGetYRule.buyScope}</span></div>
                                <div><span className="disc-dl-label">Get Qty:</span> <span>{rule.buyXGetYRule.getQuantity}</span></div>
                                <div><span className="disc-dl-label">Get Scope:</span> <span>{rule.buyXGetYRule.getScope}</span></div>
                                <div><span className="disc-dl-label">Get Discount:</span> <span>{rule.buyXGetYRule.getDiscountPercentage}%</span></div>
                            </div>
                            {rule.buyXGetYRule.buyProductIds?.length > 0 && (
                                <div className="disc-product-ids">
                                    <span className="disc-dl-label">Buy Products:</span>
                                    <div className="disc-tag-list inline">{rule.buyXGetYRule.buyProductIds.map((p, i) => <span key={i} className="disc-tag small">{p}</span>)}</div>
                                </div>
                            )}
                            {rule.buyXGetYRule.getProductIds?.length > 0 && (
                                <div className="disc-product-ids">
                                    <span className="disc-dl-label">Get Products:</span>
                                    <div className="disc-tag-list inline">{rule.buyXGetYRule.getProductIds.map((p, i) => <span key={i} className="disc-tag small">{p}</span>)}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Scheme Create / Edit Modal
   ═══════════════════════════════════════════════════ */
function SchemeModal({ scheme, onSubmit, onClose }) {
    const isEdit = !!scheme
    const [activeTab, setActiveTab] = useState('general')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const [form, setForm] = useState({
        name: scheme?.name || '',
        description: scheme?.description || '',
        status: scheme?.status || 'DRAFT',
        priority: scheme?.priority ?? 1,
        combinationMode: scheme?.combinationMode || 'EXCLUSIVE',
        validFrom: toLocalInput(scheme?.validFrom) || '',
        validTo: toLocalInput(scheme?.validTo) || '',
        approvedBy: scheme?.approvedBy || '',
        scope: scheme?.scope || 'GLOBAL',
        scopeIds: scheme?.scopeIds?.join(', ') || '',
        rules: scheme?.rules || [],
        entitlements: scheme?.entitlements || [],
    })

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    /* ── Rule management ── */
    const addRule = () => {
        updateField('rules', [...form.rules, {
            name: '', sequence: form.rules.length + 1, discountType: 'PERCENTAGE',
            discountValue: 0, applyTo: 'TRANSACTION', maxDiscountAmount: null, minOrderAmount: null,
            minQuantity: null, roundingRule: 'NEAREST_CENT', conditions: [], tiers: [], buyXGetYRule: null
        }])
    }
    const updateRule = (idx, field, value) => {
        const updated = [...form.rules]
        updated[idx] = { ...updated[idx], [field]: value }
        updateField('rules', updated)
    }
    const removeRule = (idx) => {
        updateField('rules', form.rules.filter((_, i) => i !== idx))
    }

    /* ── Condition management ── */
    const addCondition = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            conditions: [...(updated[ruleIdx].conditions || []), { conditionType: 'PRODUCT', operator: 'EQUALS', value: '' }]
        }
        updateField('rules', updated)
    }
    const updateCondition = (ruleIdx, condIdx, field, value) => {
        const updated = [...form.rules]
        const conds = [...updated[ruleIdx].conditions]
        conds[condIdx] = { ...conds[condIdx], [field]: value }
        updated[ruleIdx] = { ...updated[ruleIdx], conditions: conds }
        updateField('rules', updated)
    }
    const removeCondition = (ruleIdx, condIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            conditions: updated[ruleIdx].conditions.filter((_, i) => i !== condIdx)
        }
        updateField('rules', updated)
    }

    /* ── Tier management ── */
    const addTier = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            tiers: [...(updated[ruleIdx].tiers || []), { minValue: 0, maxValue: null, discountType: 'PERCENTAGE', discountValue: 0 }]
        }
        updateField('rules', updated)
    }
    const updateTier = (ruleIdx, tierIdx, field, value) => {
        const updated = [...form.rules]
        const tiers = [...updated[ruleIdx].tiers]
        tiers[tierIdx] = { ...tiers[tierIdx], [field]: value }
        updated[ruleIdx] = { ...updated[ruleIdx], tiers: tiers }
        updateField('rules', updated)
    }
    const removeTier = (ruleIdx, tierIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            tiers: updated[ruleIdx].tiers.filter((_, i) => i !== tierIdx)
        }
        updateField('rules', updated)
    }

    /* ── BuyXGetY management ── */
    const toggleBuyXGetY = (ruleIdx) => {
        const updated = [...form.rules]
        if (updated[ruleIdx].buyXGetYRule) {
            updated[ruleIdx] = { ...updated[ruleIdx], buyXGetYRule: null }
        } else {
            updated[ruleIdx] = {
                ...updated[ruleIdx],
                buyXGetYRule: {
                    buyQuantity: 2, buyScope: 'ANY_PRODUCT', buyProductIds: [],
                    getQuantity: 1, getScope: 'ANY_PRODUCT', getProductIds: [],
                    getDiscountPercentage: 100
                }
            }
        }
        updateField('rules', updated)
    }
    const updateBuyXGetY = (ruleIdx, field, value) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            buyXGetYRule: { ...updated[ruleIdx].buyXGetYRule, [field]: value }
        }
        updateField('rules', updated)
    }

    /* ── Entitlement management ── */
    const addEntitlement = () => {
        updateField('entitlements', [...form.entitlements, { entitlementType: 'PUBLIC', referenceId: '', usageLimitPerCustomer: null }])
    }
    const updateEntitlement = (idx, field, value) => {
        const updated = [...form.entitlements]
        updated[idx] = { ...updated[idx], [field]: value }
        updateField('entitlements', updated)
    }
    const removeEntitlement = (idx) => {
        updateField('entitlements', form.entitlements.filter((_, i) => i !== idx))
    }

    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name) { setError('Name is required'); return }
        if (!form.validFrom || !form.validTo) { setError('Valid from and to dates are required'); return }

        setSubmitting(true)
        setError('')
        setSuccessMsg('')
        try {
            const payload = {
                name: form.name,
                description: form.description || null,
                status: form.status,
                priority: Number(form.priority),
                combinationMode: form.combinationMode,
                validFrom: form.validFrom,
                validTo: form.validTo,
                approvedBy: form.approvedBy || null,
                scope: form.scope,
                scopeIds: form.scopeIds ? form.scopeIds.split(',').map(s => s.trim()).filter(Boolean) : [],
                rules: form.rules.map((r, i) => ({
                    ...r,
                    sequence: r.sequence ?? i + 1,
                    discountValue: Number(r.discountValue) || 0,
                    maxDiscountAmount: r.maxDiscountAmount ? Number(r.maxDiscountAmount) : null,
                    minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : null,
                    minQuantity: r.minQuantity ? Number(r.minQuantity) : null,
                    conditions: (r.conditions || []).map(c => ({ ...c })),
                    tiers: (r.tiers || []).map(t => ({
                        ...t,
                        minValue: Number(t.minValue) || 0,
                        maxValue: t.maxValue ? Number(t.maxValue) : null,
                        discountValue: Number(t.discountValue) || 0,
                    })),
                    buyXGetYRule: r.buyXGetYRule ? {
                        ...r.buyXGetYRule,
                        buyQuantity: Number(r.buyXGetYRule.buyQuantity) || 1,
                        getQuantity: Number(r.buyXGetYRule.getQuantity) || 1,
                        getDiscountPercentage: Number(r.buyXGetYRule.getDiscountPercentage) || 100,
                        buyProductIds: typeof r.buyXGetYRule.buyProductIds === 'string'
                            ? r.buyXGetYRule.buyProductIds.split(',').map(s => s.trim()).filter(Boolean)
                            : (r.buyXGetYRule.buyProductIds || []),
                        getProductIds: typeof r.buyXGetYRule.getProductIds === 'string'
                            ? r.buyXGetYRule.getProductIds.split(',').map(s => s.trim()).filter(Boolean)
                            : (r.buyXGetYRule.getProductIds || []),
                    } : null,
                })),
                entitlements: form.entitlements.map(ent => ({
                    ...ent,
                    usageLimitPerCustomer: ent.usageLimitPerCustomer ? Number(ent.usageLimitPerCustomer) : null,
                })),
            }
            await onSubmit(payload, isEdit)
            setSuccessMsg('Saved successfully!')
            // onClose() - disabled for testing
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const tabs = [
        { key: 'general', label: 'General' },
        { key: 'rules', label: `Rules (${form.rules.length})` },
        { key: 'entitlements', label: `Entitlements (${form.entitlements.length})` },
    ]

    return (
        <div className="org-modal-overlay">
            <div className="disc-modal-large" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <PercentSvgIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit Discount Scheme' : 'Create Discount Scheme'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* Modal Tabs */}
                <div className="disc-modal-tabs">
                    {tabs.map(t => (
                        <button key={t.key}
                            className={`disc-modal-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >{t.label}</button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="disc-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    {successMsg && <div className="org-save-msg success">{successMsg}</div>}

                    {/* ── General Tab ── */}
                    {activeTab === 'general' && (
                        <div className="disc-tab-content">
                            <div className="org-form-grid">
                                <FormField label="Name" required>
                                    <input type="text" className="org-form-input" value={form.name}
                                        onChange={e => updateField('name', e.target.value)} placeholder="e.g. Ramadan Promotion" />
                                </FormField>
                                <FormField label="Status">
                                    <select className="org-form-input" value={form.status} onChange={e => updateField('status', e.target.value)}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="Description">
                                <textarea className="org-form-input disc-textarea" value={form.description}
                                    onChange={e => updateField('description', e.target.value)} placeholder="Describe the discount scheme..." rows={2} />
                            </FormField>

                            <div className="org-form-grid three-col">
                                <FormField label="Priority">
                                    <input type="number" className="org-form-input" value={form.priority}
                                        onChange={e => updateField('priority', e.target.value)} min={1} />
                                </FormField>
                                <FormField label="Combination Mode">
                                    <select className="org-form-input" value={form.combinationMode} onChange={e => updateField('combinationMode', e.target.value)}>
                                        {COMBINATION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Approved By">
                                    <input type="text" className="org-form-input" value={form.approvedBy}
                                        onChange={e => updateField('approvedBy', e.target.value)} placeholder="Approver name" />
                                </FormField>
                            </div>

                            <div className="org-form-grid">
                                <FormField label="Valid From" required>
                                    <input type="datetime-local" className="org-form-input" value={form.validFrom}
                                        onChange={e => updateField('validFrom', e.target.value)} />
                                </FormField>
                                <FormField label="Valid To" required>
                                    <input type="datetime-local" className="org-form-input" value={form.validTo}
                                        onChange={e => updateField('validTo', e.target.value)} />
                                </FormField>
                            </div>

                            <div className="org-form-grid">
                                <FormField label="Scope">
                                    <select className="org-form-input" value={form.scope} onChange={e => updateField('scope', e.target.value)}>
                                        {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormField>
                                {form.scope !== 'ALL' && (
                                    <FormField label="Scope IDs" hint="Comma-separated list of terminal/group IDs">
                                        <input type="text" className="org-form-input" value={form.scopeIds}
                                            onChange={e => updateField('scopeIds', e.target.value)} placeholder="ID1, ID2, ID3" />
                                    </FormField>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Rules Tab ── */}
                    {activeTab === 'rules' && (
                        <div className="disc-tab-content">
                            <div className="disc-section-header">
                                <span>Discount Rules</span>
                                <button type="button" className="toolbar-btn small primary" onClick={addRule}>
                                    <PlusIcon /> Add Rule
                                </button>
                            </div>

                            {form.rules.length === 0 && <p className="disc-empty-text">No rules yet. Add one to define how discounts are calculated.</p>}

                            {form.rules.map((rule, ri) => (
                                <div key={ri} className="disc-rule-editor">
                                    <div className="disc-rule-editor-header">
                                        <span className="disc-rule-editor-title">Rule #{ri + 1}</span>
                                        <button type="button" className="toolbar-btn small danger" onClick={() => removeRule(ri)}>
                                            <TrashIcon />
                                        </button>
                                    </div>

                                    <div className="org-form-grid">
                                        <FormField label="Name">
                                            <input type="text" className="org-form-input" value={rule.name}
                                                onChange={e => updateRule(ri, 'name', e.target.value)} placeholder="Rule name" />
                                        </FormField>
                                        <FormField label="Sequence">
                                            <input type="number" className="org-form-input" value={rule.sequence}
                                                onChange={e => updateRule(ri, 'sequence', Number(e.target.value))} min={1} />
                                        </FormField>
                                    </div>

                                    <div className="org-form-grid three-col">
                                        <FormField label="Discount Type">
                                            <select className="org-form-input" value={rule.discountType} onChange={e => updateRule(ri, 'discountType', e.target.value)}>
                                                {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label="Discount Value">
                                            <input type="number" className="org-form-input" value={rule.discountValue}
                                                onChange={e => updateRule(ri, 'discountValue', e.target.value)} step="0.01" />
                                        </FormField>
                                        <FormField label="Apply To">
                                            <select className="org-form-input" value={rule.applyTo} onChange={e => updateRule(ri, 'applyTo', e.target.value)}>
                                                {APPLY_TO.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </FormField>
                                    </div>

                                    <div className="org-form-grid four-col">
                                        <FormField label="Max Discount">
                                            <input type="number" className="org-form-input" value={rule.maxDiscountAmount || ''}
                                                onChange={e => updateRule(ri, 'maxDiscountAmount', e.target.value)} step="0.01" placeholder="No limit" />
                                        </FormField>
                                        <FormField label="Min Order Amount">
                                            <input type="number" className="org-form-input" value={rule.minOrderAmount || ''}
                                                onChange={e => updateRule(ri, 'minOrderAmount', e.target.value)} step="0.01" placeholder="None" />
                                        </FormField>
                                        <FormField label="Min Quantity">
                                            <input type="number" className="org-form-input" value={rule.minQuantity || ''}
                                                onChange={e => updateRule(ri, 'minQuantity', e.target.value)} placeholder="None" />
                                        </FormField>
                                        <FormField label="Rounding">
                                            <select className="org-form-input" value={rule.roundingRule} onChange={e => updateRule(ri, 'roundingRule', e.target.value)}>
                                                {ROUNDING_RULES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </FormField>
                                    </div>

                                    {/* Conditions */}
                                    <div className="disc-sub-section">
                                        <div className="disc-section-header small">
                                            <span>Conditions ({rule.conditions?.length || 0})</span>
                                            <button type="button" className="toolbar-btn tiny" onClick={() => addCondition(ri)}>
                                                <PlusIcon /> Add
                                            </button>
                                        </div>
                                        {(rule.conditions || []).map((cond, ci) => (
                                            <div key={ci} className="disc-condition-editor">
                                                <select className="org-form-input small" value={cond.conditionType}
                                                    onChange={e => updateCondition(ri, ci, 'conditionType', e.target.value)}>
                                                    {CONDITION_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                                                </select>
                                                <select className="org-form-input small" value={cond.operator}
                                                    onChange={e => updateCondition(ri, ci, 'operator', e.target.value)}>
                                                    {CONDITION_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                                                </select>
                                                <input type="text" className="org-form-input small" value={cond.value}
                                                    onChange={e => updateCondition(ri, ci, 'value', e.target.value)} placeholder="Value" />
                                                <button type="button" className="toolbar-btn tiny danger" onClick={() => removeCondition(ri, ci)}>
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tiers (for TIERED type) */}
                                    {rule.discountType === 'TIERED' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Tiers ({rule.tiers?.length || 0})</span>
                                                <button type="button" className="toolbar-btn tiny" onClick={() => addTier(ri)}>
                                                    <PlusIcon /> Add
                                                </button>
                                            </div>
                                            {(rule.tiers || []).map((tier, ti) => (
                                                <div key={ti} className="disc-tier-editor">
                                                    <FormField label="Min">
                                                        <input type="number" className="org-form-input small" value={tier.minValue}
                                                            onChange={e => updateTier(ri, ti, 'minValue', e.target.value)} step="0.01" />
                                                    </FormField>
                                                    <FormField label="Max">
                                                        <input type="number" className="org-form-input small" value={tier.maxValue || ''}
                                                            onChange={e => updateTier(ri, ti, 'maxValue', e.target.value)} step="0.01" placeholder="No max" />
                                                    </FormField>
                                                    <FormField label="Type">
                                                        <select className="org-form-input small" value={tier.discountType}
                                                            onChange={e => updateTier(ri, ti, 'discountType', e.target.value)}>
                                                            {DISCOUNT_TYPES.filter(t => t !== 'TIERED' && t !== 'BUY_X_GET_Y').map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </FormField>
                                                    <FormField label="Value">
                                                        <input type="number" className="org-form-input small" value={tier.discountValue}
                                                            onChange={e => updateTier(ri, ti, 'discountValue', e.target.value)} step="0.01" />
                                                    </FormField>
                                                    <button type="button" className="toolbar-btn tiny danger disc-tier-remove" onClick={() => removeTier(ri, ti)}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* BuyXGetY (for BUY_X_GET_Y type) */}
                                    {rule.discountType === 'BUY_X_GET_Y' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Buy X Get Y Rule</span>
                                                {!rule.buyXGetYRule && (
                                                    <button type="button" className="toolbar-btn tiny" onClick={() => toggleBuyXGetY(ri)}>
                                                        <PlusIcon /> Configure
                                                    </button>
                                                )}
                                            </div>
                                            {rule.buyXGetYRule && (
                                                <div className="disc-bxgy-editor">
                                                    <div className="org-form-grid three-col">
                                                        <FormField label="Buy Quantity">
                                                            <input type="number" className="org-form-input" value={rule.buyXGetYRule.buyQuantity}
                                                                onChange={e => updateBuyXGetY(ri, 'buyQuantity', e.target.value)} min={1} />
                                                        </FormField>
                                                        <FormField label="Buy Scope">
                                                            <select className="org-form-input" value={rule.buyXGetYRule.buyScope}
                                                                onChange={e => updateBuyXGetY(ri, 'buyScope', e.target.value)}>
                                                                {BUY_X_GET_Y_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </FormField>
                                                        {rule.buyXGetYRule.buyScope === 'SPECIFIC_PRODUCTS' && (
                                                            <FormField label="Buy Product IDs" hint="Comma-separated">
                                                                <input type="text" className="org-form-input"
                                                                    value={Array.isArray(rule.buyXGetYRule.buyProductIds) ? rule.buyXGetYRule.buyProductIds.join(', ') : rule.buyXGetYRule.buyProductIds || ''}
                                                                    onChange={e => updateBuyXGetY(ri, 'buyProductIds', e.target.value)} />
                                                            </FormField>
                                                        )}
                                                    </div>
                                                    <div className="org-form-grid three-col">
                                                        <FormField label="Get Quantity">
                                                            <input type="number" className="org-form-input" value={rule.buyXGetYRule.getQuantity}
                                                                onChange={e => updateBuyXGetY(ri, 'getQuantity', e.target.value)} min={1} />
                                                        </FormField>
                                                        <FormField label="Get Scope">
                                                            <select className="org-form-input" value={rule.buyXGetYRule.getScope}
                                                                onChange={e => updateBuyXGetY(ri, 'getScope', e.target.value)}>
                                                                {BUY_X_GET_Y_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </FormField>
                                                        <FormField label="Get Discount %">
                                                            <input type="number" className="org-form-input" value={rule.buyXGetYRule.getDiscountPercentage}
                                                                onChange={e => updateBuyXGetY(ri, 'getDiscountPercentage', e.target.value)} step="0.01" max={100} />
                                                        </FormField>
                                                    </div>
                                                    {rule.buyXGetYRule.getScope === 'SPECIFIC_PRODUCTS' && (
                                                        <FormField label="Get Product IDs" hint="Comma-separated">
                                                            <input type="text" className="org-form-input"
                                                                value={Array.isArray(rule.buyXGetYRule.getProductIds) ? rule.buyXGetYRule.getProductIds.join(', ') : rule.buyXGetYRule.getProductIds || ''}
                                                                onChange={e => updateBuyXGetY(ri, 'getProductIds', e.target.value)} />
                                                        </FormField>
                                                    )}
                                                    <button type="button" className="toolbar-btn tiny danger" onClick={() => toggleBuyXGetY(ri)}>
                                                        <TrashIcon /> Remove Buy X Get Y
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Entitlements Tab ── */}
                    {activeTab === 'entitlements' && (
                        <div className="disc-tab-content">
                            <div className="disc-section-header">
                                <span>Entitlements</span>
                                <button type="button" className="toolbar-btn small primary" onClick={addEntitlement}>
                                    <PlusIcon /> Add Entitlement
                                </button>
                            </div>

                            {form.entitlements.length === 0 && <p className="disc-empty-text">No entitlements. Add one to control who can use this discount.</p>}

                            {form.entitlements.map((ent, ei) => (
                                <div key={ei} className="disc-entitlement-editor">
                                    <div className="org-form-grid three-col">
                                        <FormField label="Type">
                                            <select className="org-form-input" value={ent.entitlementType}
                                                onChange={e => updateEntitlement(ei, 'entitlementType', e.target.value)}>
                                                {ENTITLEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </FormField>
                                        {ent.entitlementType !== 'PUBLIC' && (
                                            <FormField label="Reference ID" hint={ent.entitlementType === 'COUPON' ? 'Coupon code' : 'Customer/Group ID'}>
                                                <input type="text" className="org-form-input" value={ent.referenceId || ''}
                                                    onChange={e => updateEntitlement(ei, 'referenceId', e.target.value)} />
                                            </FormField>
                                        )}
                                        <FormField label="Usage Limit / Customer">
                                            <input type="number" className="org-form-input" value={ent.usageLimitPerCustomer || ''}
                                                onChange={e => updateEntitlement(ei, 'usageLimitPerCustomer', e.target.value)} placeholder="Unlimited" min={1} />
                                        </FormField>
                                    </div>
                                    <button type="button" className="toolbar-btn tiny danger" onClick={() => removeEntitlement(ei)}>
                                        <TrashIcon /> Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Scheme')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Generate Coupons Modal
   ═══════════════════════════════════════════════════ */
function GenerateCouponsModal({ schemes, onSubmit, onClose }) {
    const [form, setForm] = useState({
        schemeId: schemes[0]?.id || '',
        type: 'SINGLE_USE',
        count: 5,
        prefix: '',
        maxUses: 1,
        validFrom: '',
        validTo: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.schemeId) { setError('Select a scheme'); return }
        if (!form.count || form.count < 1) { setError('Count must be at least 1'); return }

        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                schemeId: Number(form.schemeId),
                type: form.type,
                count: Number(form.count),
                prefix: form.prefix || null,
                maxUses: form.type === 'MULTI_USE' ? Number(form.maxUses) : 1,
                validFrom: form.validFrom || null,
                validTo: form.validTo || null,
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay">
            <div className="org-modal" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <TagSvgIcon />
                        <h3 className="org-modal-title">Generate Coupons</h3>
                    </div>
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
                            <input type="number" className="org-form-input" value={form.count}
                                onChange={e => updateField('count', e.target.value)} min={1} max={100} />
                        </FormField>
                        <FormField label="Prefix">
                            <input type="text" className="org-form-input" value={form.prefix}
                                onChange={e => updateField('prefix', e.target.value)} placeholder="e.g. RAMADAN" />
                        </FormField>
                    </div>

                    {form.type === 'MULTI_USE' && (
                        <FormField label="Max Uses per Coupon">
                            <input type="number" className="org-form-input" value={form.maxUses}
                                onChange={e => updateField('maxUses', e.target.value)} min={1} />
                        </FormField>
                    )}

                    <div className="org-form-grid">
                        <FormField label="Valid From">
                            <input type="datetime-local" className="org-form-input" value={form.validFrom}
                                onChange={e => updateField('validFrom', e.target.value)} />
                        </FormField>
                        <FormField label="Valid To">
                            <input type="datetime-local" className="org-form-input" value={form.validTo}
                                onChange={e => updateField('validTo', e.target.value)} />
                        </FormField>
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

/* ═══════════════════════════════════════════════════
   Coupon Card
   ═══════════════════════════════════════════════════ */
function CouponCard({ coupon, onToggle }) {
    const [copied, setCopied] = useState(false)

    const copyCode = (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(coupon.code).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const isExpired = coupon.validTo && new Date(coupon.validTo) < new Date()
    const usageRatio = coupon.maxUses ? (coupon.usedCount || 0) / coupon.maxUses : 0

    return (
        <div className={`disc-coupon-card ${!coupon.isActive ? 'inactive' : ''} ${isExpired ? 'expired' : ''}`}>
            <div className="disc-coupon-card-top">
                <div className="disc-coupon-code-row">
                    <span className="disc-coupon-code">{coupon.code}</span>
                    <button className="disc-coupon-copy-btn" onClick={copyCode} title="Copy code">
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
                <span className={`disc-coupon-status ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {isExpired ? 'EXPIRED' : (coupon.isActive ? 'ACTIVE' : 'INACTIVE')}
                </span>
            </div>

            <div className="disc-coupon-card-body">
                <div className="disc-coupon-meta-item">
                    <span className="disc-meta-label">Type</span>
                    <span className="disc-meta-value">{coupon.type}</span>
                </div>
                <div className="disc-coupon-meta-item">
                    <span className="disc-meta-label">Usage</span>
                    <span className="disc-meta-value">{coupon.usedCount || 0} / {coupon.maxUses || '--'}</span>
                </div>
                <div className="disc-coupon-meta-item">
                    <span className="disc-meta-label">Valid</span>
                    <span className="disc-meta-value">{formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}</span>
                </div>
                {coupon.schemeName && (
                    <div className="disc-coupon-meta-item">
                        <span className="disc-meta-label">Scheme</span>
                        <span className="disc-meta-value">{coupon.schemeName}</span>
                    </div>
                )}
            </div>

            {/* Usage bar */}
            {coupon.maxUses && (
                <div className="disc-coupon-usage-bar">
                    <div className="disc-coupon-usage-fill" style={{ width: `${Math.min(usageRatio * 100, 100)}%` }} />
                </div>
            )}

            <div className="disc-coupon-card-footer">
                <button className={`toolbar-btn tiny ${coupon.isActive ? 'warning' : 'success'}`}
                    onClick={() => onToggle(coupon)} disabled={isExpired}>
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Validate Coupon Section
   ═══════════════════════════════════════════════════ */
function CouponValidator() {
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleValidate = async () => {
        if (!code.trim()) return
        setLoading(true)
        setResult(null)
        try {
            const res = await validateCoupon(code.trim())
            setResult(res)
        } catch (err) {
            setResult({ valid: false, rejectionReason: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="disc-validator-section">
            <h4 className="disc-validator-title">Validate Coupon</h4>
            <div className="disc-validator-input-row">
                <input type="text" className="org-form-input" value={code}
                    onChange={e => setCode(e.target.value)} placeholder="Enter coupon code..."
                    onKeyDown={e => e.key === 'Enter' && handleValidate()} />
                <button className="toolbar-btn primary" onClick={handleValidate} disabled={loading || !code.trim()}>
                    {loading ? 'Checking...' : 'Validate'}
                </button>
            </div>
            {result && (
                <div className={`disc-validator-result ${result.valid ? 'valid' : 'invalid'}`}>
                    <span className="disc-validator-icon">{result.valid ? '✓' : '✗'}</span>
                    <span>{result.valid ? 'Coupon is valid' : (result.rejectionReason || 'Coupon is invalid')}</span>
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   Main Discount Page
   ═══════════════════════════════════════════════════ */
function DiscountPage({ onBack, initialTab = 'schemes' }) {
    const [activeTab, setActiveTab] = useState(initialTab)

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
            setSchemes(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadSchemes() }, [loadSchemes])

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
    const handleCreateScheme = async (data) => {
        await createDiscountScheme(data)
        await loadSchemes()
    }
    const handleUpdateScheme = async (data) => {
        await updateDiscountScheme(editingScheme.id, data)
        await loadSchemes()
    }
    const handleSubmitScheme = async (data, isEdit) => {
        if (isEdit) await handleUpdateScheme(data)
        else await handleCreateScheme(data)
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
            if (coupon.isActive) {
                await deactivateCoupon(coupon.id)
            } else {
                await activateCoupon(coupon.id)
            }
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

    const couponQuery = couponSearch.toLowerCase()
    const filteredCoupons = coupons.filter(c =>
        (c.code || '').toLowerCase().includes(couponQuery)
    )

    /* ── Stats ── */
    const activeCount = schemes.filter(s => s.status === 'ACTIVE').length
    const draftCount = schemes.filter(s => s.status === 'DRAFT').length
    const pausedCount = schemes.filter(s => s.status === 'PAUSED').length
    const expiredCount = schemes.filter(s => s.status === 'EXPIRED').length

    /* ── Page Tabs ── */
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

                            {/* Coupon Toolbar */}
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

                            {/* Active campaigns list */}
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

                            {/* Upcoming (Draft) */}
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

                {/* Detail Side Panel (schemes tab) */}
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

export default DiscountPage
