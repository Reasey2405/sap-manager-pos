import { useState } from 'react'
import { formatDateTime } from './constants'
import { StatusBadge } from './FormField'
import { PercentSvgIcon, EditIcon, CloseIcon, PlayIcon, PauseIcon, StopIcon, ChevronDownIcon, ChevronUpIcon } from './Icons'
import { activateScheme, pauseScheme, expireScheme } from '../../service/api'

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
                        <div><span className="disc-dl-label">Min Line Total:</span> <span>{rule.minLineTotal ?? '--'}</span></div>
                        <div><span className="disc-dl-label">Min Unit Price:</span> <span>{rule.minLineUnitPrice ?? '--'}</span></div>
                        <div><span className="disc-dl-label">Rounding:</span> <span>{rule.roundingRule ?? '--'}</span></div>
                    </div>
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
                    {rule.tiers && rule.tiers.length > 0 && (
                        <div className="disc-rule-sub-section">
                            <h5>Tiers ({rule.tiers.length})</h5>
                            <table className="disc-tier-table">
                                <thead><tr><th>Min</th><th>Max</th><th>Type</th><th>Value</th></tr></thead>
                                <tbody>
                                    {rule.tiers.map((t, ti) => (
                                        <tr key={t.id || ti}><td>{t.minValue}</td><td>{t.maxValue ?? '---'}</td><td>{t.discountType}</td><td>{t.discountValue}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {rule.rtcTiers && rule.rtcTiers.length > 0 && (
                        <div className="disc-rule-sub-section">
                            <h5>RTC Time Windows ({rule.rtcTiers.length})</h5>
                            <table className="disc-tier-table">
                                <thead><tr><th>#</th><th>From</th><th>To</th><th>Type</th><th>Value</th></tr></thead>
                                <tbody>
                                    {rule.rtcTiers.map((t, ti) => (
                                        <tr key={t.id || ti}>
                                            <td>{t.sequence}</td>
                                            <td>{Array.isArray(t.fromTime) ? `${String(t.fromTime[0]).padStart(2,'0')}:${String(t.fromTime[1]).padStart(2,'0')}` : t.fromTime}</td>
                                            <td>{Array.isArray(t.toTime) ? `${String(t.toTime[0]).padStart(2,'0')}:${String(t.toTime[1]).padStart(2,'0')}` : t.toTime}</td>
                                            <td>{t.discountType}</td>
                                            <td>{t.discountValue}{t.discountType === 'PERCENTAGE' ? '%' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                    {rule.buyComboGetYRule && (
                        <div className="disc-rule-sub-section">
                            <h5>Buy Combo Get Y</h5>
                            <div className="disc-rule-detail-grid">
                                <div><span className="disc-dl-label">Get Qty:</span> <span>{rule.buyComboGetYRule.getQuantity}</span></div>
                                <div><span className="disc-dl-label">Get Scope:</span> <span>{rule.buyComboGetYRule.getScope}</span></div>
                                <div><span className="disc-dl-label">Get Discount:</span> <span>{rule.buyComboGetYRule.getDiscountPercentage}%</span></div>
                            </div>
                            {rule.buyComboGetYRule.comboItems?.length > 0 && (
                                <div className="disc-product-ids">
                                    <span className="disc-dl-label">Combo Items:</span>
                                    <div className="disc-tag-list inline">
                                        {rule.buyComboGetYRule.comboItems.map((item, i) => (
                                            <span key={i} className="disc-tag small">{item.requiredQty}x {item.itemCode}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {rule.buyComboGetYRule.getProductIds?.length > 0 && (
                                <div className="disc-product-ids">
                                    <span className="disc-dl-label">Get Products:</span>
                                    <div className="disc-tag-list inline">{rule.buyComboGetYRule.getProductIds.map((p, i) => <span key={i} className="disc-tag small">{p}</span>)}</div>
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
   Scheme Detail Panel
   ═══════════════════════════════════════════════════ */
export default function SchemeDetailPanel({ scheme, onClose, onRefresh, onEdit }) {
    const [acting, setActing] = useState(false)
    const [msg, setMsg] = useState('')

    const doAction = async (fn, label) => {
        setActing(true); setMsg('')
        try { await fn(scheme.id); setMsg(`${label} successful`); onRefresh() }
        catch (err) { setMsg('Error: ' + err.message) }
        finally { setActing(false) }
    }

    if (!scheme) return null

    return (
        <div className="org-settings-panel">
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row"><PercentSvgIcon /><h3 className="org-settings-panel-title">{scheme.name}</h3></div>
                <div className="org-settings-header-actions">
                    <button className="org-settings-edit-btn" onClick={() => onEdit(scheme)} title="Edit"><EditIcon /></button>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>
            {msg && <div className={`org-save-msg ${msg.startsWith('Error') ? 'error' : 'success'}`}>{msg}</div>}
            <div className="disc-detail-status-row">
                <StatusBadge status={scheme.status} />
                <div className="disc-lifecycle-actions">
                    {(scheme.status === 'DRAFT' || scheme.status === 'PAUSED') && (
                        <button className="toolbar-btn small success" onClick={() => doAction(activateScheme, 'Activation')} disabled={acting}><PlayIcon /> Activate</button>
                    )}
                    {scheme.status === 'ACTIVE' && (
                        <button className="toolbar-btn small warning" onClick={() => doAction(pauseScheme, 'Pause')} disabled={acting}><PauseIcon /> Pause</button>
                    )}
                    {(scheme.status === 'ACTIVE' || scheme.status === 'PAUSED') && (
                        <button className="toolbar-btn small danger" onClick={() => doAction(expireScheme, 'Expire')} disabled={acting}><StopIcon /> Expire</button>
                    )}
                </div>
            </div>
            <div className="org-settings-info-grid">
                <div className="org-settings-info-item"><span className="org-settings-info-label">ID</span><span className="org-settings-info-value mono">{scheme.id}</span></div>
                <div className="org-settings-info-item"><span className="org-settings-info-label">Priority</span><span className="org-settings-info-value">{scheme.priority ?? '--'}</span></div>
                <div className="org-settings-info-item"><span className="org-settings-info-label">Combination</span><span className="org-settings-info-value">{scheme.combinationMode}</span></div>
                <div className="org-settings-info-item"><span className="org-settings-info-label">Scope</span><span className="org-settings-info-value">{scheme.scope}</span></div>
            </div>
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Validity Period</h4>
            <div className="org-settings-list">
                <div className="org-setting-row"><span className="org-setting-label">Valid From</span><span className="org-setting-value">{formatDateTime(scheme.validFrom)}</span></div>
                <div className="org-setting-row"><span className="org-setting-label">Valid To</span><span className="org-setting-value">{formatDateTime(scheme.validTo)}</span></div>
                <div className="org-setting-row"><span className="org-setting-label">Approved By</span><span className="org-setting-value">{scheme.approvedBy || '--'}</span></div>
            </div>
            {scheme.scopeIds && scheme.scopeIds.length > 0 && (<>
                <div className="org-settings-divider" />
                <h4 className="org-settings-section-title">Scope IDs</h4>
                <div className="disc-tag-list">{scheme.scopeIds.map((id, i) => <span key={i} className="disc-tag">{id}</span>)}</div>
            </>)}
            {scheme.description && (<>
                <div className="org-settings-divider" />
                <h4 className="org-settings-section-title">Description</h4>
                <p className="disc-description-text">{scheme.description}</p>
            </>)}
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Rules ({scheme.rules?.length || 0})</h4>
            {scheme.rules && scheme.rules.length > 0 ? (
                <div className="disc-rules-list">{scheme.rules.map((rule, idx) => <RuleDetailCard key={rule.id || idx} rule={rule} index={idx} />)}</div>
            ) : (<p className="disc-empty-text">No rules configured</p>)}
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
            ) : (<p className="disc-empty-text">No entitlements configured</p>)}
            <div className="org-settings-divider" />
            <h4 className="org-settings-section-title">Audit</h4>
            <div className="org-settings-list">
                <div className="org-setting-row"><span className="org-setting-label">Created</span><span className="org-setting-value">{formatDateTime(scheme.createdAt)}</span></div>
                <div className="org-setting-row"><span className="org-setting-label">Updated</span><span className="org-setting-value">{formatDateTime(scheme.updatedAt)}</span></div>
            </div>
        </div>
    )
}
