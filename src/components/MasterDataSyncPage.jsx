import { useState, useEffect, useCallback, useRef } from 'react'
import './MasterDataSyncPage.css'

/* ================================================================
   ICONS
   ================================================================ */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
)
const RefreshIcon = ({ spinning }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: spinning ? 'mds-spin 0.8s linear infinite' : 'none' }}>
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
)
const DatabaseIcon = ({ size = 52 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="14" rx="24" ry="8" fill="currentColor" opacity="0.28" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14v12c0 4.42 10.75 8 24 8s24-3.58 24-8V14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.12" />
        <path d="M8 26v12c0 4.42 10.75 8 24 8s24-3.58 24-8V26" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
        <path d="M8 38v10c0 4.42 10.75 8 24 8s24-3.58 24-8V38" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    </svg>
)
const TerminalIcon = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" /><polyline points="8 10 10 12 8 14" /><line x1="12" y1="14" x2="16" y2="14" />
    </svg>
)
const ChevronDown = ({ open }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)', flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const DragIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="5" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="19" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
)
const ExternalLinkIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
)

/* ── Cylinder SVG ── */
const CylinderDB = ({ accent = '#6366f1', size = 'lg' }) => {
    const w = size === 'lg' ? 88 : 66, h = size === 'lg' ? 114 : 88
    const cx = w / 2, ry = size === 'lg' ? 14 : 11, bodyH = h - ry * 2
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
            <ellipse cx={cx} cy={h - ry} rx={cx - 3} ry={ry} fill={accent} opacity="0.32" stroke={accent} strokeWidth="1.5" />
            <rect x="3" y={ry} width={w - 6} height={bodyH} fill={accent} fillOpacity="0.11" />
            <line x1="3" y1={ry} x2="3" y2={h - ry} stroke={accent} strokeWidth="1.5" />
            <line x1={w - 3} y1={ry} x2={w - 3} y2={h - ry} stroke={accent} strokeWidth="1.5" />
            <rect x="3" y={ry + bodyH * 0.28} width={w - 6} height={bodyH * 0.09} fill={accent} fillOpacity="0.2" />
            <rect x="3" y={ry + bodyH * 0.58} width={w - 6} height={bodyH * 0.09} fill={accent} fillOpacity="0.13" />
            <ellipse cx={cx} cy={ry} rx={cx - 3} ry={ry} fill={accent} fillOpacity="0.4" stroke={accent} strokeWidth="1.5" />
            <ellipse cx={cx - 7} cy={ry - 3} rx={8} ry={4} fill="white" fillOpacity="0.08" />
            <circle cx={cx + 14} cy={ry + bodyH * 0.44} r={4} fill={accent} fillOpacity="0.4" />
        </svg>
    )
}

/* ── POS Terminal Device SVG ── */
const PosDevice = ({ w = 72, h = 62 }) => (
    <svg width={w} height={h} viewBox="0 0 72 62" fill="none">
        <rect x="2" y="2" width="48" height="34" rx="4" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="6" y="6" width="40" height="24" rx="2" fill="#0f172a" />
        <rect x="8" y="8" width="36" height="20" rx="1.5" fill="#6366f1" fillOpacity="0.13" />
        <line x1="10" y1="13" x2="26" y2="13" stroke="#6366f1" strokeWidth="1.3" strokeOpacity="0.55" />
        <line x1="10" y1="18" x2="22" y2="18" stroke="#6366f1" strokeWidth="1.3" strokeOpacity="0.38" />
        <line x1="10" y1="23" x2="24" y2="23" stroke="#6366f1" strokeWidth="1.3" strokeOpacity="0.38" />
        <line x1="26" y1="36" x2="26" y2="46" stroke="#334155" strokeWidth="2" />
        <rect x="16" y="46" width="20" height="3" rx="1.5" fill="#334155" />
        <rect x="54" y="6" width="16" height="42" rx="3" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
        <line x1="57" y1="14" x2="67" y2="14" stroke="#10b981" strokeWidth="1" strokeOpacity="0.7" />
        <line x1="57" y1="18" x2="67" y2="18" stroke="#10b981" strokeWidth="1" strokeOpacity="0.7" />
        <line x1="57" y1="22" x2="67" y2="22" stroke="#10b981" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="57" y1="26" x2="67" y2="26" stroke="#10b981" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="62" cy="38" r="4.5" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="1.2" />
    </svg>
)

/* ================================================================
   HELPERS
   ================================================================ */
const API_URL = 'http://localhost:9988/api/monitoring'

function fmt(ts) {
    if (!ts) return '—'
    try {
        const d = new Date(ts)
        if (isNaN(d.getTime())) return String(ts)
        return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    } catch { return String(ts) }
}
function fmtShort(ts) {
    if (!ts) return '—'
    try {
        const d = new Date(ts)
        return d.toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
    } catch { return '—' }
}
/* syncStatus: returns { ok, label }
   ok=true  → posLastSync >= serverSync  → data is up to date
   ok=false → posLastSync <  serverSync  → POS is behind by 'label'
*/
function syncStatus(serverTs, posTs) {
    if (!serverTs || !posTs) return { ok: null, label: '—' }
    const diffMs = new Date(serverTs) - new Date(posTs) // positive = POS is behind
    if (diffMs <= 0) return { ok: true, label: 'Up to date' }
    const secs = diffMs / 1000
    let label
    if (secs < 60) label = `${Math.round(secs)}s behind`
    else if (secs < 3600) label = `${Math.round(secs / 60)}m behind`
    else label = `${Math.round(secs / 3600)}h behind`
    return { ok: false, label }
}
function badgeCls(status) {
    const s = (status || '').toUpperCase()
    if (s === 'SUCCESS' || s === 'COMPLETED') return 'mds-badge-success'
    if (s === 'FAILED' || s === 'ERROR') return 'mds-badge-error'
    if (s === 'IN_PROGRESS' || s === 'RUNNING') return 'mds-badge-running'
    if (s === 'PENDING') return 'mds-badge-pending'
    return 'mds-badge-unknown'
}

/* ================================================================
   SHARED
   ================================================================ */
const TypeBadge = ({ t }) => <span className="mds-type-badge">{t || '—'}</span>
const StatusBadge = ({ s }) => <span className={`mds-status-badge ${badgeCls(s)}`}>{s || 'UNKNOWN'}</span>

/* Sync status cell — green "Up to date" or purple "Xh behind" or dash */
const SyncStatusCell = ({ serverTs, posTs }) => {
    const { ok, label } = syncStatus(serverTs, posTs)
    if (ok === null) return <span className="mds-none">—</span>
    if (ok) return <span className="mds-sync-ok">✓ {label}</span>
    return <span className="mds-lag-badge">{label}</span>
}

/* Smooth collapsible using CSS grid trick */
const Collapsible = ({ open, children }) => (
    <div className={`mds-collapsible ${open ? 'mds-collapsible-open' : ''}`}>
        <div className="mds-collapsible-inner">{children}</div>
    </div>
)

/* ================================================================
   DRAGGABLE POPUP
   ================================================================ */
function DraggablePopup({ title, subtitle, accentColor = '#6366f1', onClose, children }) {
    const [pos, setPos] = useState({ x: Math.max(40, window.innerWidth / 2 - 320), y: 120 })
    const dragging = useRef(false)
    const offset = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const move = (e) => {
            if (!dragging.current) return
            const clientX = e.touches ? e.touches[0].clientX : e.clientX
            const clientY = e.touches ? e.touches[0].clientY : e.clientY
            setPos({
                x: Math.max(0, Math.min(window.innerWidth - 100, clientX - offset.current.x)),
                y: Math.max(0, Math.min(window.innerHeight - 60, clientY - offset.current.y))
            })
        }
        const up = () => { dragging.current = false }
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up)
        window.addEventListener('touchmove', move, { passive: false })
        window.addEventListener('touchend', up)
        return () => {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('mouseup', up)
            window.removeEventListener('touchmove', move)
            window.removeEventListener('touchend', up)
        }
    }, [])

    const startDrag = (e) => {
        dragging.current = true
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        offset.current = { x: clientX - pos.x, y: clientY - pos.y }
        e.preventDefault()
    }

    return (
        <div className="mds-popup" style={{ left: pos.x, top: pos.y, '--popup-accent': accentColor }}>
            {/* Title bar — drag handle */}
            <div className="mds-popup-titlebar" onMouseDown={startDrag} onTouchStart={startDrag}>
                <div className="mds-popup-drag-handle">
                    <DragIcon />
                </div>
                <div className="mds-popup-title-area">
                    <div className="mds-popup-title">{title}</div>
                    {subtitle && <div className="mds-popup-subtitle">{subtitle}</div>}
                </div>
                <button className="mds-popup-close" onClick={onClose} title="Close"><CloseIcon /></button>
            </div>
            {/* Body */}
            <div className="mds-popup-body">{children}</div>
        </div>
    )
}

/* ================================================================
   POPUP CONTENT COMPONENTS
   ================================================================ */
function MainDbPopupContent({ syncs }) {
    const total = syncs.length
    const success = syncs.filter(s => ['SUCCESS', 'COMPLETED'].includes((s.status || '').toUpperCase())).length
    const totalRecords = syncs.reduce((a, s) => a + (s.recordsSynced || 0), 0)
    return (
        <div>
            <div className="mds-popup-stats">
                <div className="mds-popup-stat"><span className="mds-popup-stat-val">{total}</span><span className="mds-popup-stat-lbl">Sync Types</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val mds-ok">{success}</span><span className="mds-popup-stat-lbl">Successful</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val mds-err">{total - success}</span><span className="mds-popup-stat-lbl">Failed</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val">{totalRecords.toLocaleString()}</span><span className="mds-popup-stat-lbl">Total Records</span></div>
            </div>
            <div className="mds-popup-table-wrap">
                <table className="mds-table mds-table-sm">
                    <thead><tr><th>Sync Type</th><th>Status</th><th>Start Time</th><th>End Time</th><th>Records</th><th>Error</th></tr></thead>
                    <tbody>
                        {syncs.map((s, i) => (
                            <tr key={i}>
                                <td><TypeBadge t={s.syncType} /></td>
                                <td><StatusBadge s={s.status} /></td>
                                <td className="mds-mono">{fmt(s.syncStartTime)}</td>
                                <td className="mds-mono">{fmt(s.syncEndTime)}</td>
                                <td className="mds-records">{(s.recordsSynced ?? 0).toLocaleString()}</td>
                                <td className="mds-error-msg">{s.errorMessage || <span className="mds-none">—</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SecondDbPopupContent({ data }) {
    const syncs = data?.sapMasterDataSync || []
    const terminals = data?.posTerminalDataSyncs || []
    return (
        <div>
            <div className="mds-popup-stats">
                <div className="mds-popup-stat"><span className="mds-popup-stat-val">{syncs.length}</span><span className="mds-popup-stat-lbl">Sync Types</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val">{terminals.length}</span><span className="mds-popup-stat-lbl">Terminals</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val mds-ok">{syncs.filter(s => ['SUCCESS', 'COMPLETED'].includes((s.status || '').toUpperCase())).length}</span><span className="mds-popup-stat-lbl">Successful</span></div>
                <div className="mds-popup-stat"><span className="mds-popup-stat-val mds-err">{syncs.filter(s => ['FAILED', 'ERROR'].includes((s.status || '').toUpperCase())).length}</span><span className="mds-popup-stat-lbl">Failed</span></div>
            </div>
            <div className="mds-popup-section-label">Sync Type Summary</div>
            <div className="mds-popup-table-wrap">
                <table className="mds-table mds-table-sm">
                    <thead><tr><th>Type</th><th>Status</th><th>Records</th></tr></thead>
                    <tbody>
                        {syncs.map((s, i) => (
                            <tr key={i}>
                                <td><TypeBadge t={s.syncType} /></td>
                                <td><StatusBadge s={s.status} /></td>
                                <td className="mds-records">{(s.recordsSynced ?? 0).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function TerminalPopupContent({ terminal }) {
    const details = terminal?.syncTypeDetails || []
    return (
        <div>
            <div className="mds-popup-stats">
                <div className="mds-popup-stat"><span className="mds-popup-stat-val">{details.length}</span><span className="mds-popup-stat-lbl">Sync Types</span></div>
                <div className="mds-popup-stat">
                    <span className="mds-popup-stat-val" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{terminal?.posTerminalId}</span>
                    <span className="mds-popup-stat-lbl">Terminal ID</span>
                </div>
            </div>
            <div className="mds-popup-table-wrap">
                <table className="mds-table mds-table-sm">
                    <thead><tr><th>Sync Type</th><th>POS Last Sync</th><th>Server Sync</th><th>Sync Status</th></tr></thead>
                    <tbody>
                        {details.map((d, i) => (
                            <tr key={i}>
                                <td><TypeBadge t={d.syncType} /></td>
                                <td className="mds-mono">{fmt(d.posLastSyncTimestamp)}</td>
                                <td className="mds-mono">{fmt(d.serverSyncTimestamp)}</td>
                                <td><SyncStatusCell serverTs={d.serverSyncTimestamp} posTs={d.posLastSyncTimestamp} /></td>
                            </tr>
                        )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/* ================================================================
   STATUS TAB
   ================================================================ */
function NodeCard({ accentClass, icon, label, sublabel, defaultOpen = true, id, sectionTitle, dotClass, count, children, loading, skeletonCount = 3 }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className={`mds-node ${accentClass} ${open ? '' : 'mds-node-collapsed'}`}>
            <button className="mds-node-toggle" onClick={() => setOpen(o => !o)} id={id}>
                <div className="mds-node-toggle-left">
                    {icon}
                    <div>
                        <div className="mds-node-label">{label}</div>
                        <div className="mds-node-sublabel">{sublabel}</div>
                    </div>
                </div>
                <div className="mds-node-toggle-right">
                    <span className={`mds-node-state-pill ${open ? 'open' : ''}`}>{open ? 'Expanded' : 'Collapsed'}</span>
                    <ChevronDown open={open} />
                </div>
            </button>
            <Collapsible open={open}>
                <div className="mds-node-content-pad">
                    <div className="mds-node-section-title">
                        <span className={`mds-dot ${dotClass}`} />{sectionTitle}
                        {count != null && <span className="mds-section-count">{count}</span>}
                    </div>
                    {loading
                        ? <div className="mds-skeleton-wrap">{Array.from({ length: skeletonCount }, (_, k) => <div key={k} className="mds-skeleton-row" />)}</div>
                        : children
                    }
                </div>
            </Collapsible>
        </div>
    )
}

function StatusTab({ data, loading }) {
    const sapSyncs = data?.sapMasterDataSync || []
    const terminals = data?.posTerminalDataSyncs || []
    const success = sapSyncs.filter(s => ['SUCCESS', 'COMPLETED'].includes((s.status || '').toUpperCase())).length
    const fail = sapSyncs.filter(s => ['FAILED', 'ERROR'].includes((s.status || '').toUpperCase())).length

    return (
        <div className="mds-status-tab">
            {/* Summary bar */}
            {!loading && data && (
                <div className="mds-summary-bar">
                    <div className="mds-summary-item"><span className="mds-summary-val">{sapSyncs.length}</span><span className="mds-summary-lbl">Sync Types</span></div>
                    <div className="mds-summary-divider" />
                    <div className="mds-summary-item"><span className="mds-summary-val mds-ok">{success}</span><span className="mds-summary-lbl">Successful</span></div>
                    <div className="mds-summary-divider" />
                    <div className="mds-summary-item"><span className="mds-summary-val mds-err">{fail}</span><span className="mds-summary-lbl">Failed</span></div>
                    <div className="mds-summary-divider" />
                    <div className="mds-summary-item"><span className="mds-summary-val">{terminals.length}</span><span className="mds-summary-lbl">POS Terminals</span></div>
                    <div className="mds-summary-divider" />
                    <div className="mds-summary-item">
                        <span className="mds-summary-val" style={{ fontSize: '0.8rem' }}>
                            {sapSyncs.reduce((a, s) => a + (s.recordsSynced || 0), 0).toLocaleString()}
                        </span>
                        <span className="mds-summary-lbl">Total Records</span>
                    </div>
                </div>
            )}

            <div className="mds-map-container">
                {/* Node 1: Main DB */}
                <NodeCard
                    accentClass="mds-node-main"
                    icon={<span className="mds-db-icon mds-db-main"><DatabaseIcon size={44} /></span>}
                    label="Main DB" sublabel="Master Data (SAP)"
                    id="node-main" sectionTitle="SAP Master Data Sync" dotClass="mds-dot-blue"
                    count={`${sapSyncs.length} types`} loading={loading && !data}
                >
                    <div className="mds-master-table-wrap">
                        <table className="mds-table">
                            <thead><tr><th>Sync Type</th><th>Status</th><th>Start Time</th><th>End Time</th><th>Records</th><th>Error</th></tr></thead>
                            <tbody>
                                {sapSyncs.map((s, i) => (
                                    <tr key={i}>
                                        <td><TypeBadge t={s.syncType} /></td>
                                        <td><StatusBadge s={s.status} /></td>
                                        <td className="mds-mono">{fmt(s.syncStartTime)}</td>
                                        <td className="mds-mono">{fmt(s.syncEndTime)}</td>
                                        <td className="mds-records">{(s.recordsSynced ?? 0).toLocaleString()}</td>
                                        <td className="mds-error-msg">{s.errorMessage || <span className="mds-none">—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </NodeCard>

                {/* Arrow 1 */}
                <div className="mds-arrow-col"><div className="mds-arrow-line">
                    <div className="mds-arrow-label">Data Sync</div>
                    <div className="mds-arrow-track">
                        <div className="mds-arrow-pulse" />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div></div>

                {/* Node 2: Second DB */}
                <NodeCard
                    accentClass="mds-node-second"
                    icon={<span className="mds-db-icon mds-db-second"><DatabaseIcon size={44} /></span>}
                    label="Second DB" sublabel="POS Local Store"
                    id="node-second" sectionTitle="Sync Monitoring" dotClass="mds-dot-purple"
                    loading={loading && !data}
                >
                    <div className="mds-second-db-stats">
                        {[['Sync Types', sapSyncs.length, ''], ['Terminals', terminals.length, ''], ['Successful', success, 'mds-stat-ok'], ['Failed', fail, 'mds-stat-err']].map(([lbl, val, cls]) => (
                            <div key={lbl} className="mds-stat-item">
                                <span className="mds-stat-label">{lbl}</span>
                                <span className={`mds-stat-value ${cls}`}>{val}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mds-sync-type-list">
                        {sapSyncs.map((s, i) => (
                            <div key={i} className="mds-sync-type-row">
                                <TypeBadge t={s.syncType} /><StatusBadge s={s.status} />
                                {s.recordsSynced != null && <span className="mds-records-pill">{s.recordsSynced.toLocaleString()} rec</span>}
                            </div>
                        ))}
                    </div>
                </NodeCard>

                {/* Arrow 2 */}
                <div className="mds-arrow-col"><div className="mds-arrow-line">
                    <div className="mds-arrow-label">POS Sync</div>
                    <div className="mds-arrow-track">
                        <div className="mds-arrow-pulse mds-arrow-pulse-2" />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div></div>

                {/* Node 3: POS Terminals */}
                <NodeCard
                    accentClass="mds-node-terminals"
                    icon={<span className="mds-db-icon mds-db-terminal"><TerminalIcon /></span>}
                    label="POS Terminals" sublabel={`${terminals.length} terminal${terminals.length !== 1 ? 's' : ''} connected`}
                    id="node-terminals" sectionTitle="Terminal Sync Status" dotClass="mds-dot-green"
                    count={`${terminals.length} connected`} loading={loading && !data} skeletonCount={2}
                >
                    {terminals.length === 0
                        ? <p className="mds-empty-text">No terminal sync data.</p>
                        : <div className="mds-terminal-list">
                            {terminals.map((t, i) => {
                                const [open, setOpen] = useState(true)
                                const details = t.syncTypeDetails || []
                                return (
                                    <div key={t.posTerminalId || i} className="mds-terminal-card">
                                        <button className="mds-terminal-header" onClick={() => setOpen(o => !o)}>
                                            <span className="mds-terminal-icon"><TerminalIcon size={22} /></span>
                                            <span className="mds-terminal-id">{t.posTerminalId}</span>
                                            <span className="mds-terminal-badge">{details.length} types</span>
                                            <ChevronDown open={open} />
                                        </button>
                                        <Collapsible open={open}>
                                            <div className="mds-terminal-body-inner">
                                                <table className="mds-table mds-table-sm">
                                                    <thead><tr><th>Sync Type</th><th>POS Last Sync</th><th>Server Sync</th><th>Sync Status</th></tr></thead>
                                                    <tbody>
                                                        {details.map((d, j) => (
                                                            <tr key={j}>
                                                                <td><TypeBadge t={d.syncType} /></td>
                                                                <td className="mds-mono">{fmt(d.posLastSyncTimestamp)}</td>
                                                                <td className="mds-mono">{fmt(d.serverSyncTimestamp)}</td>
                                                                <td><SyncStatusCell serverTs={d.serverSyncTimestamp} posTs={d.posLastSyncTimestamp} /></td>
                                                            </tr>
                                                        )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Collapsible>
                                    </div>
                                )
                            })}
                        </div>
                    }
                </NodeCard>
            </div>
        </div>
    )
}

/* ================================================================
   RELATIONSHIP TAB  — clean diagram + draggable popups
   ================================================================ */
function RelNode({ accent, glowColor, icon, title, subtitle, badge, onClick, nodeRef }) {
    return (
        <button className="mds-rel-node" style={{ '--node-accent': accent, '--node-glow': glowColor }} onClick={onClick} ref={nodeRef}>
            <div className="mds-rel-node-glow-ring" />
            <div className="mds-rel-node-icon-wrap">{icon}</div>
            <div className="mds-rel-node-name">{title}</div>
            {subtitle && <div className="mds-rel-node-sub">{subtitle}</div>}
            {badge && <div className="mds-rel-node-badge">{badge}</div>}
            <div className="mds-rel-node-click-hint">
                <ExternalLinkIcon /> View Details
            </div>
        </button>
    )
}

function RelationshipTab({ data, loading }) {
    const containerRef = useRef(null)
    const mainDbRef = useRef(null)
    const secondDbRef = useRef(null)
    const termRefs = useRef([])
    const [lines, setLines] = useState([])
    const [popup, setPopup] = useState(null) // { type: 'main'|'second'|'terminal', id?: string }

    const sapSyncs = data?.sapMasterDataSync || []
    const terminals = data?.posTerminalDataSyncs || []

    const lastSyncTime = sapSyncs.reduce((latest, s) => {
        if (!s.syncEndTime) return latest
        const t = new Date(s.syncEndTime)
        return !isNaN(t.getTime()) && t > latest ? t : latest
    }, new Date(0))

    // Measure connector lines
    useEffect(() => {
        const measure = () => {
            if (!containerRef.current || !secondDbRef.current) return
            const cRect = containerRef.current.getBoundingClientRect()
            const s2Rect = secondDbRef.current.getBoundingClientRect()
            const sx = s2Rect.right - cRect.left
            const sy = s2Rect.top + s2Rect.height / 2 - cRect.top
            const newLines = []
            termRefs.current.forEach((el, i) => {
                if (!el) return
                const r = el.getBoundingClientRect()
                newLines.push({ x1: sx, y1: sy, x2: r.left - cRect.left, y2: r.top + r.height / 2 - cRect.top, i })
            })
            setLines(newLines)
        }
        measure()
        const ro = new ResizeObserver(measure)
        if (containerRef.current) ro.observe(containerRef.current)
        return () => ro.disconnect()
    }, [data, loading, terminals.length])

    if (loading && !data) {
        return <div className="mds-rel-container"><div className="mds-skeleton-wrap" style={{ maxWidth: 600, margin: '48px auto' }}>
            {[1, 2, 3].map(k => <div key={k} className="mds-skeleton-row mds-skeleton-tall" />)}
        </div></div>
    }

    const success = sapSyncs.filter(s => ['SUCCESS', 'COMPLETED'].includes((s.status || '').toUpperCase())).length
    const activeTerminal = terminals.find(t => t.posTerminalId === popup?.id)

    return (
        <div className="mds-rel-container">
            {/* ── Diagram canvas ── */}
            <div className="mds-rel-diagram" ref={containerRef}>

                {/* SVG connector lines (Second DB → Terminals) */}
                {lines.length > 0 && (
                    <svg className="mds-rel-svg-overlay">
                        <defs>
                            <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                                <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill="#6366f166" />
                            </marker>
                            <marker id="arr-green" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                                <path d="M0,0.5 L6,3.5 L0,6.5 Z" fill="#10b98166" />
                            </marker>
                        </defs>
                        {lines.map(l => (
                            <line key={l.i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                                stroke="#10b981" strokeWidth="1.8" strokeDasharray="7 5"
                                strokeOpacity="0.5" markerEnd="url(#arr-green)" />
                        ))}
                        {lines.length > 0 && <circle cx={lines[0].x1} cy={lines[0].y1} r="5" fill="#10b981" fillOpacity="0.45" />}
                    </svg>
                )}

                {/* ── MAIN DB node ── */}
                <RelNode
                    accent="#6366f1" glowColor="rgba(99,102,241,0.35)"
                    icon={<CylinderDB accent="#6366f1" size="lg" />}
                    title="Main DB" subtitle="Master Data (SAP)"
                    badge={`${sapSyncs.length} sync types · ${success} success`}
                    onClick={() => setPopup({ type: 'main' })}
                    nodeRef={mainDbRef}
                />

                {/* Arrow Main → Second */}
                <div className="mds-rel-arrow-col">
                    <div className="mds-rel-arr-label">Data Synchronization</div>
                    <div className="mds-rel-arr-line">
                        <div className="mds-rel-arr-dot" />
                        <svg viewBox="0 0 80 18" className="mds-rel-arr-svg">
                            <line x1="2" y1="9" x2="66" y2="9" stroke="#6366f1" strokeWidth="2" />
                            <polyline points="56,3 74,9 56,15" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="mds-rel-arr-sublabel">Last: {fmtShort(lastSyncTime)}</div>
                </div>

                {/* ── SECOND DB node ── */}
                <RelNode
                    accent="#a855f7" glowColor="rgba(168,85,247,0.35)"
                    icon={<CylinderDB accent="#a855f7" size="md" />}
                    title="Second DB" subtitle="POS Local Store"
                    badge={`${terminals.length} terminal${terminals.length !== 1 ? 's' : ''} connected`}
                    onClick={() => setPopup({ type: 'second' })}
                    nodeRef={secondDbRef}
                />

                {/* ── POS TERMINALS column ── */}
                <div className="mds-rel-terminals-col">
                    <div className="mds-rel-term-group-label">
                        <TerminalIcon size={14} /> POS Terminals
                    </div>
                    {terminals.length === 0
                        ? <div className="mds-rel-term-node mds-rel-term-empty" ref={el => termRefs.current[0] = el}>
                            <PosDevice /><div className="mds-rel-term-node-name">No Terminals</div>
                        </div>
                        : terminals.map((t, i) => (
                            <button key={t.posTerminalId || i}
                                className={`mds-rel-term-node ${popup?.id === t.posTerminalId ? 'active' : ''}`}
                                ref={el => { termRefs.current[i] = el }}
                                onClick={() => setPopup({ type: 'terminal', id: t.posTerminalId })}
                            >
                                <div className="mds-rel-term-top-badges">
                                    {(t.syncTypeDetails || []).slice(0, 3).map((d, j) => (
                                        <span key={j} className="mds-rel-term-mini-badge">{(d.syncType || '').slice(0, 6)}</span>
                                    ))}
                                    {(t.syncTypeDetails || []).length > 3 && (
                                        <span className="mds-rel-term-mini-badge mds-rel-more">+{(t.syncTypeDetails || []).length - 3}</span>
                                    )}
                                </div>
                                <PosDevice w={62} h={54} />
                                <div className="mds-rel-term-node-name">{t.posTerminalId}</div>
                                <div className="mds-rel-term-node-sub">{(t.syncTypeDetails || []).length} sync types</div>
                                <div className="mds-rel-term-node-hint"><ExternalLinkIcon /> View</div>
                            </button>
                        ))
                    }
                </div>
            </div>

            {/* ── DRAGGABLE POPUP ── */}
            {popup?.type === 'main' && (
                <DraggablePopup title="Main DB" subtitle={`SAP Master Data · ${sapSyncs.length} sync types`} accentColor="#6366f1" onClose={() => setPopup(null)}>
                    <MainDbPopupContent syncs={sapSyncs} />
                </DraggablePopup>
            )}
            {popup?.type === 'second' && (
                <DraggablePopup title="Second DB" subtitle="POS Local Store sync summary" accentColor="#a855f7" onClose={() => setPopup(null)}>
                    <SecondDbPopupContent data={data} />
                </DraggablePopup>
            )}
            {popup?.type === 'terminal' && activeTerminal && (
                <DraggablePopup title={activeTerminal.posTerminalId} subtitle={`POS Terminal · ${(activeTerminal.syncTypeDetails || []).length} sync types`} accentColor="#10b981" onClose={() => setPopup(null)}>
                    <TerminalPopupContent terminal={activeTerminal} />
                </DraggablePopup>
            )}
        </div>
    )
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
function MasterDataSyncPage({ onBack }) {
    const [activeTab, setActiveTab] = useState('status')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [lastFetched, setLastFetched] = useState(null)

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null)
        try {
            const res = await fetch(API_URL)
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            setData(await res.json())
            setLastFetched(new Date())
        } catch (err) {
            setError(err.message || 'Failed to fetch sync data.')
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    return (
        <div className="mds-page">
            <div className="mds-header">
                <button className="back-button" onClick={onBack} id="mds-back-btn">
                    <BackIcon /><span>Back to Dashboard</span>
                </button>
                <div className="mds-header-right">
                    {lastFetched && <span className="mds-last-fetched">Updated: {lastFetched.toLocaleTimeString()}</span>}
                    <button className="mds-refresh-btn" onClick={fetchData} disabled={loading} id="mds-refresh-btn">
                        <RefreshIcon spinning={loading} />{loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            <div className="mds-title-bar">
                <div>
                    <h1 className="mds-page-title">Master Data Sync</h1>
                    <p className="mds-page-subtitle">Monitor sync status between SAP, Second DB, and POS Terminals</p>
                </div>
            </div>

            {error && (
                <div className="mds-error-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                    <button className="mds-retry-btn" onClick={fetchData}>Retry</button>
                </div>
            )}

            <div className="monitoring-tabs mds-page-tabs">
                <button className={`monitoring-tab ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')} id="mds-tab-status">STATUS</button>
                <button className={`monitoring-tab ${activeTab === 'relationship' ? 'active' : ''}`} onClick={() => setActiveTab('relationship')} id="mds-tab-relationship">RELATIONSHIP</button>
            </div>

            {activeTab === 'status' && <StatusTab data={data} loading={loading} />}
            {activeTab === 'relationship' && <RelationshipTab data={data} loading={loading} />}
        </div>
    )
}

export default MasterDataSyncPage
