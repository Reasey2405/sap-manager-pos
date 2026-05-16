import { formatDate } from './constants'
import { StatusBadge } from './FormField'
import { PercentSvgIcon, EditIcon } from './Icons'

export default function SchemeCard({ scheme, isSelected, onSelect }) {
    const ruleCount = scheme.rules?.length || 0
    const entCount = scheme.entitlements?.length || 0

    return (
        <div className={`disc-scheme-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(scheme)}>
            <div className="disc-scheme-card-header">
                <div className="disc-scheme-card-icon"><PercentSvgIcon /></div>
                <div className="disc-scheme-card-info">
                    <span className="disc-scheme-card-name">{scheme.name}</span>
                    <span className="disc-scheme-card-desc">{scheme.description || '--'}</span>
                </div>
                <StatusBadge status={scheme.status} />
            </div>
            <div className="disc-scheme-card-meta">
                <div className="disc-scheme-card-meta-item"><span className="disc-meta-label">Priority</span><span className="disc-meta-value">{scheme.priority ?? '--'}</span></div>
                <div className="disc-scheme-card-meta-item"><span className="disc-meta-label">Mode</span><span className="disc-meta-value">{scheme.combinationMode || '--'}</span></div>
                <div className="disc-scheme-card-meta-item"><span className="disc-meta-label">Calc</span><span className="disc-meta-value">{scheme.calculationMode || '--'}</span></div>
                <div className="disc-scheme-card-meta-item"><span className="disc-meta-label">Scope</span><span className="disc-meta-value">{scheme.scope || '--'}</span></div>
                <div className="disc-scheme-card-meta-item"><span className="disc-meta-label">Rules</span><span className="disc-meta-value">{ruleCount}</span></div>
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
