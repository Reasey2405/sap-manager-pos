import { useState } from 'react'
import { ChevronDownIcon, GroupIcon, TerminalSvgIcon, EditIcon, PlusIcon } from './icons'
import TerminalCard from './TerminalCard'

/* ===== POS Group ===== */
function PosGroup({ group, terminals, selectedTerminal, onSelectTerminal, onAddTerminal, onEditGroup }) {
    const [expanded, setExpanded] = useState(true)

    return (
        <div className={`org-group ${expanded ? 'expanded' : ''}`} id={`group-${group.groupCode}`}>
            <div className="org-group-header" onClick={() => setExpanded(!expanded)}>
                <div className="org-group-header-left">
                    <ChevronDownIcon open={expanded} />
                    <div className="org-group-icon-wrapper">
                        <GroupIcon />
                    </div>
                    <div className="org-group-info">
                        <span className="org-group-name">{group.groupName}</span>
                        <span className="org-group-desc">
                            Code: {group.groupCode} · Branch ID: {group.branchId}
                            {group.paymentGroup && ` · Payment: ${group.paymentGroup.description}`}
                        </span>
                    </div>
                </div>
                <div className="org-group-header-right">
                    <div className="org-group-stats">
                        <span className="org-group-stat">
                            <TerminalSvgIcon />
                            <strong>{terminals.length}</strong> terminals
                        </span>
                    </div>
                    <button
                        className="org-add-terminal-btn btn-icon-only"
                        onClick={(e) => { e.stopPropagation(); onEditGroup(group) }}
                        title="Edit group"
                        style={{ marginLeft: '8px' }}
                    >
                        <EditIcon />
                    </button>
                    <button
                        className="org-add-terminal-btn btn-icon-only"
                        onClick={(e) => { e.stopPropagation(); onAddTerminal(group) }}
                        id={`add-terminal-${group.groupCode}`}
                        title="Add terminal"
                        style={{ marginLeft: '8px' }}
                    >
                        <PlusIcon />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="org-group-body">
                    {terminals.length > 0 ? (
                        <div className="org-terminals-grid">
                            {terminals.map(terminal => (
                                <TerminalCard
                                    key={terminal.posTerminalID}
                                    terminal={terminal}
                                    isSelected={selectedTerminal?.posTerminalID === terminal.posTerminalID}
                                    onSelect={onSelectTerminal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="org-empty-terminals">
                            <TerminalSvgIcon />
                            <span>No terminals in this group</span>
                            <button
                                className="org-add-inline-btn"
                                onClick={() => onAddTerminal(group)}
                            >
                                <PlusIcon /> Add Terminal
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PosGroup
