import { TerminalSvgIcon, SettingsGearIcon } from './icons'

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

export default TerminalCard
