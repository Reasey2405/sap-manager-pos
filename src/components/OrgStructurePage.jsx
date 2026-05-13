import { useState, useEffect, useCallback } from 'react'
import { API_BASE, fetchJSON, postJSON, putJSON } from '../service/api'

import { BackIcon, SearchIcon, RefreshIcon, PlusIcon, GroupIcon, TerminalSvgIcon } from './orgStructure/icons'
import PosGroup from './orgStructure/PosGroup'
import PosGroupModal from './orgStructure/PosGroupModal'
import AddTerminalModal from './orgStructure/AddTerminalModal'
import TerminalSettingsPanel from './orgStructure/TerminalSettingsPanel'
import TerminalCard from './orgStructure/TerminalCard'
import LoadingSpinner from './orgStructure/LoadingSpinner'

/* ===== Org Structure Page ===== */
function OrgStructurePage({ onBack }) {
    const [groups, setGroups] = useState([])
    const [paymentGroups, setPaymentGroups] = useState([])
    const [terminals, setTerminals] = useState([])
    const [branches, setBranches] = useState([])
    const [seriesList, setSeriesList] = useState([])
    const [currencies, setCurrencies] = useState([])
    const [priceLists, setPriceLists] = useState([])
    const [sapSettings, setSapSettings] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedTerminal, setSelectedTerminal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [showAddGroup, setShowAddGroup] = useState(false)
    const [editingGroup, setEditingGroup] = useState(null)
    const [addTerminalForGroup, setAddTerminalForGroup] = useState(null)

    /* Fetch all data */
    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [groupsRes, terminalsRes, branchesRes, seriesRes, currRes, priceRes, payGroupsRes, sapSettingsRes] = await Promise.all([
                fetchJSON(`${API_BASE}/api/pos_terminal/posGroup`),
                fetchJSON(`${API_BASE}/api/pos_terminal/all`),
                fetchJSON(`${API_BASE}/api/master_data/branch`),
                fetchJSON(`${API_BASE}/api/master_data/series`),
                fetchJSON(`${API_BASE}/api/master_data/currency`),
                fetchJSON(`${API_BASE}/api/master_data/priceList`),
                fetchJSON(`${API_BASE}/api/pos_terminal/paymentGroup`),
                fetchJSON(`${API_BASE}/api/master_data/sapSytemsetting`),
            ])
            setGroups(Array.isArray(groupsRes) ? groupsRes : [])
            setTerminals(Array.isArray(terminalsRes) ? terminalsRes : [])
            setBranches(Array.isArray(branchesRes) ? branchesRes : [])
            setSeriesList(Array.isArray(seriesRes) ? seriesRes : [])
            setCurrencies(Array.isArray(currRes) ? currRes : [])
            setPriceLists(Array.isArray(priceRes) ? priceRes : [])
            setPaymentGroups(Array.isArray(payGroupsRes) ? payGroupsRes : [])
            setSapSettings(sapSettingsRes || null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    /* Create / Update POS Group */
    const handleSaveGroup = async (data, isEdit) => {
        if (isEdit) {
            await putJSON(`${API_BASE}/api/pos_terminal/posGroup/${data.groupCode}`, data)
        } else {
            await postJSON(`${API_BASE}/api/pos_terminal/posGroup`, data)
        }
        await loadData()
    }

    /* Create Terminal */
    const handleCreateTerminal = async (data) => {
        await postJSON(`${API_BASE}/api/pos_terminal`, data)
        await loadData()
    }

    /* Filter logic */
    const query = searchQuery.toLowerCase()
    const filteredGroups = groups.filter(g =>
        g.groupName?.toLowerCase().includes(query) ||
        g.groupCode?.toLowerCase().includes(query)
    )

    const getTerminalsForGroup = (group) => {
        return terminals.filter(t => {
            const matchGroup = t.groupCode === group.groupCode
            if (!query) return matchGroup
            return matchGroup && (
                (t.posName || '').toLowerCase().includes(query) ||
                (t.posTerminalID || '').toLowerCase().includes(query) ||
                (t.mainCurrency || '').toLowerCase().includes(query)
            )
        })
    }

    /* Unassigned terminals (groupCode is null) */
    const unassignedTerminals = terminals.filter(t => {
        if (t.groupCode !== null && t.groupCode !== undefined) return false
        if (!query) return true
        return (
            (t.posName || '').toLowerCase().includes(query) ||
            (t.posTerminalID || '').toLowerCase().includes(query) ||
            (t.mainCurrency || '').toLowerCase().includes(query)
        )
    })

    const showUnassigned = unassignedTerminals.length > 0 &&
        (!query || 'unassigned'.includes(query) || unassignedTerminals.length > 0)

    const totalTerminals = terminals.length

    return (
        <div className={`org-page ${selectedTerminal ? 'panel-open' : ''}`}>
            {/* Content */}
            <div className="org-content">
                <div className={`org-main ${selectedTerminal ? 'with-panel' : ''}`}>
                    {/* Page Title with Back button */}
                    <div className="org-title-section">
                        <button className="back-button" onClick={onBack} id="org-back-btn">
                            <BackIcon />
                            <span>Back to Dashboard</span>
                        </button>
                        <h2 className="org-page-title">Organizational Structure</h2>
                        <p className="org-page-subtitle">Manage POS groups and terminal configurations</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="org-summary-stats">
                        <div className="org-stat-card" id="stat-total-groups">
                            <span className="org-stat-number">{groups.length}</span>
                            <span className="org-stat-label">POS Groups</span>
                        </div>
                        <div className="org-stat-card" id="stat-total-terminals">
                            <span className="org-stat-number">{totalTerminals}</span>
                            <span className="org-stat-label">Total Terminals</span>
                        </div>
                        <div className="org-stat-card" id="stat-branches">
                            <span className="org-stat-number">{branches.length}</span>
                            <span className="org-stat-label">Branches</span>
                        </div>
                        <div className="org-stat-card" id="stat-currencies">
                            <span className="org-stat-number">{currencies.length}</span>
                            <span className="org-stat-label">Currencies</span>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="org-toolbar">
                        <div className="org-search-wrapper">
                            <SearchIcon />
                            <input type="text" className="org-search-input" placeholder="Search groups, terminals..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="org-search-input" />
                        </div>
                        <div className="org-toolbar-actions">
                            <button className="toolbar-btn" onClick={loadData} id="btn-refresh-data" title="Refresh data">
                                <RefreshIcon /> Refresh
                            </button>
                            <button className="toolbar-btn primary" onClick={() => setShowAddGroup(true)} id="btn-add-group">
                                <PlusIcon /> Add Group
                            </button>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="org-error-banner" id="org-error-banner">
                            <span>⚠ {error}</span>
                            <button className="org-error-retry" onClick={loadData}>Retry</button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && <LoadingSpinner text="Loading POS data..." />}

                    {/* Groups List */}
                    {!loading && (
                        <div className="org-groups-list">
                            {filteredGroups.map(group => (
                                <PosGroup key={group.groupCode} group={group}
                                    terminals={getTerminalsForGroup(group)} selectedTerminal={selectedTerminal}
                                    onSelectTerminal={setSelectedTerminal} onAddTerminal={setAddTerminalForGroup}
                                    onEditGroup={(g) => { setEditingGroup(g); setShowAddGroup(true); }} />
                            ))}

                            {/* Unassigned Group */}
                            {showUnassigned && (
                                <div className="org-group org-group-unassigned expanded" id="group-unassigned">
                                    <div className="org-group-header" onClick={() => { }}>
                                        <div className="org-group-header-left">
                                            <div className="org-group-icon-wrapper org-group-icon-unassigned"><GroupIcon /></div>
                                            <div className="org-group-info">
                                                <span className="org-group-name">Unassigned</span>
                                                <span className="org-group-desc">Terminals not assigned to any group</span>
                                            </div>
                                        </div>
                                        <div className="org-group-header-right">
                                            <div className="org-group-stats">
                                                <span className="org-group-stat"><TerminalSvgIcon /><strong>{unassignedTerminals.length}</strong> terminals</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="org-group-body">
                                        <div className="org-terminals-grid">
                                            {unassignedTerminals.map(terminal => (
                                                <TerminalCard key={terminal.posTerminalID} terminal={terminal}
                                                    isSelected={selectedTerminal?.posTerminalID === terminal.posTerminalID}
                                                    onSelect={setSelectedTerminal} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filteredGroups.length === 0 && !showUnassigned && !error && (
                                <div className="org-empty-state">
                                    <SearchIcon />
                                    <p>{searchQuery ? `No results matching "${searchQuery}"` : 'No POS groups found. Create one to get started.'}</p>
                                    {!searchQuery && (
                                        <button className="toolbar-btn primary" onClick={() => setShowAddGroup(true)}>
                                            <PlusIcon /> Add Group
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Settings Side Panel - same level as main, scrolls independently */}
                {selectedTerminal && (
                    <TerminalSettingsPanel
                        terminal={selectedTerminal} seriesList={seriesList} currencies={currencies}
                        priceLists={priceLists} branches={branches} groups={groups}
                        sapSettings={sapSettings}
                        onClose={() => setSelectedTerminal(null)} onUpdate={loadData}
                    />
                )}
            </div>

            {/* Add/Edit Group Modal */}
            {showAddGroup && (
                <PosGroupModal branches={branches} paymentGroups={paymentGroups} initialData={editingGroup} onSubmit={handleSaveGroup} onClose={() => { setShowAddGroup(false); setEditingGroup(null); }} />
            )}

            {/* Add Terminal Modal */}
            {addTerminalForGroup && (
                <AddTerminalModal group={addTerminalForGroup} branches={branches} seriesList={seriesList}
                    currencies={currencies} priceLists={priceLists} sapSettings={sapSettings}
                    onSubmit={handleCreateTerminal} onClose={() => setAddTerminalForGroup(null)} />
            )}
        </div>
    )
}

export default OrgStructurePage
