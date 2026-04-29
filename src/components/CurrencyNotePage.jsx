import { useState, useEffect, useCallback, useMemo } from 'react'
import { API_BASE, fetchJSON, postJSON, deleteJSON } from '../service/api'

/* ===== Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
)
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
const ChevronRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)
const BanknoteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
)
const CoinsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><line x1="16.71" y1="13.88" x2="13.38" y2="17.2" />
    </svg>
)
const SaveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
)
const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
)
const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)
const InfoIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)
const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

/* ===== Loading Spinner ===== */
function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

/* ===== Currency Config Card ===== */
function CurrencyConfigCard({ config, currName, isSelected, onClick }) {
    return (
        <div className={`cn-config-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            <div className="cn-card-left">
                <div className="cn-badge">
                    <span className="cn-badge-text">{config.currCode}</span>
                </div>
                <div className="cn-card-info">
                    <span className="cn-card-name">{currName}</span>
                    <span className="cn-card-label">ACTIVE PROFILE</span>
                </div>
            </div>
            <div className="cn-card-right">
                <div className="cn-card-counts">
                    <span className="cn-card-count">
                        <BanknoteIcon />
                        {config.cashNote?.length ?? 0} Denominations
                    </span>
                    <span className="cn-card-count">
                        <CoinsIcon />
                        {config.coinNote?.length ?? 0} Coins
                    </span>
                </div>
                <span className="cn-card-chevron"><ChevronRightIcon /></span>
            </div>
        </div>
    )
}

/* ===== Denomination Tag ===== */
function DenomTag({ value, variant, onRemove }) {
    return (
        <span className={`cn-tag cn-tag-${variant}`}>
            <span className="cn-tag-value">{value}</span>
            <button className="cn-tag-remove" onClick={() => onRemove(value)} type="button">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </span>
    )
}

/* ===== Info Panel (shown when nothing is selected) ===== */
function InfoPanel({ onConfigureNew }) {
    return (
        <div className="cn-info-panel">
            <div className="cn-info-icon-wrap">
                <InfoIcon />
            </div>
            <h3 className="cn-info-title">Safe Config Mode</h3>
            <p className="cn-info-body">
                The API uses a <strong>replacement model</strong>. When you update a currency,
                all existing denominations are replaced with the new list you provide.
            </p>
            <div className="cn-info-hint">
                <AlertIcon />
                <span>Existing denominations are auto-loaded when you select a configured currency.</span>
            </div>
            <button className="cn-info-new-btn" onClick={onConfigureNew}>
                <PlusIcon /> Configure New Currency
            </button>
        </div>
    )
}

/* ===== Config Editor Panel ===== */
function EditorPanel({
    isNew, currencies, configs,
    formData, setFormData,
    saving, saveMsg,
    onSave, onDelete, onClose,
}) {
    const isOverwriting = isNew && configs.some(c => c.currCode === formData.currCode)

    const addDenom = (type) => {
        const field  = type === 'cash' ? 'newCash' : 'newCoin'
        const list   = type === 'cash' ? 'cashNote' : 'coinNote'
        const val    = parseFloat(formData[field])
        if (isNaN(val)) return
        if (!formData[list].includes(val)) {
            setFormData(prev => ({
                ...prev,
                [list]: [...prev[list], val].sort((a, b) => a - b),
                [field]: ''
            }))
        } else {
            setFormData(prev => ({ ...prev, [field]: '' }))
        }
    }

    const removeDenom = (type, val) => {
        const list = type === 'cash' ? 'cashNote' : 'coinNote'
        setFormData(prev => ({ ...prev, [list]: prev[list].filter(v => v !== val) }))
    }

    const onKeyDown = (type) => (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addDenom(type) }
    }

    return (
        <div className="cn-panel">
            <div className="cn-panel-header">
                <h3 className="cn-panel-title">{isNew ? 'New Config' : 'Edit Config'}</h3>
                <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
            </div>

            <div className="cn-panel-body">

                {/* Overwrite warning */}
                {isOverwriting && (
                    <div className="cn-overwrite-warn">
                        <AlertIcon />
                        <p><strong>Note:</strong> {formData.currCode} already has a config. Saving will override all existing denominations.</p>
                    </div>
                )}

                {/* Currency */}
                <div className="cn-panel-field">
                    <label className="cn-panel-field-label">CURRENCY</label>
                    <select
                        className="cn-panel-select"
                        value={formData.currCode}
                        onChange={e => setFormData(prev => ({ ...prev, currCode: e.target.value }))}
                        disabled={!isNew}
                    >
                        {currencies.map(c => (
                            <option key={c.currCode} value={c.currCode}>
                                {c.currCode} - {c.currName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Paper Bills */}
                <div className="cn-panel-field">
                    <label className="cn-panel-field-label">PAPER BILLS</label>
                    <div className="cn-input-row">
                        <input
                            type="number"
                            className="cn-denom-input"
                            placeholder="e.g. 100"
                            value={formData.newCash}
                            onChange={e => setFormData(prev => ({ ...prev, newCash: e.target.value }))}
                            onKeyDown={onKeyDown('cash')}
                        />
                        <button className="cn-add-btn cn-add-btn-bill" onClick={() => addDenom('cash')} type="button">
                            <PlusIcon />
                        </button>
                    </div>
                    {formData.cashNote.length > 0 && (
                        <div className="cn-tag-list">
                            {formData.cashNote.map(v => (
                                <DenomTag key={v} value={v} variant="bill" onRemove={val => removeDenom('cash', val)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Coins / Decimals */}
                <div className="cn-panel-field">
                    <label className="cn-panel-field-label">COINS / DECIMALS</label>
                    <div className="cn-input-row">
                        <input
                            type="number"
                            className="cn-denom-input"
                            placeholder="e.g. 0.50"
                            step="0.01"
                            value={formData.newCoin}
                            onChange={e => setFormData(prev => ({ ...prev, newCoin: e.target.value }))}
                            onKeyDown={onKeyDown('coin')}
                        />
                        <button className="cn-add-btn cn-add-btn-coin" onClick={() => addDenom('coin')} type="button">
                            <PlusIcon />
                        </button>
                    </div>
                    {formData.coinNote.length > 0 && (
                        <div className="cn-tag-list">
                            {formData.coinNote.map(v => (
                                <DenomTag key={v} value={v} variant="coin" onRemove={val => removeDenom('coin', val)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Save message */}
                {saveMsg && (
                    <div className={`cn-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>
                        {saveMsg}
                    </div>
                )}

                {/* Actions */}
                <div className="cn-panel-actions">
                    <button className="cn-override-btn" onClick={onSave} disabled={saving} type="button">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        {saving ? 'Processing...' : 'Override Configuration'}
                    </button>
                    {!isNew && (
                        <button className="cn-delete-btn" onClick={onDelete} disabled={saving} type="button">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                            Delete Configuration
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ===== Currency Note Page ===== */
function CurrencyNotePage({ onBack }) {
    const [currencies, setCurrencies] = useState([])
    const [configs, setConfigs]       = useState([])
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy]           = useState('code')

    const [isEditing, setIsEditing]         = useState(false)
    const [selectedConfig, setSelectedConfig] = useState(null)
    const [saving, setSaving]               = useState(false)
    const [saveMsg, setSaveMsg]             = useState('')

    const [formData, setFormData] = useState({
        currCode: '',
        cashNote: [],
        coinNote: [],
        newCash: '',
        newCoin: '',
    })

    /* Auto-load existing config when currency changes in "new" mode */
    useEffect(() => {
        if (!isEditing || selectedConfig) return
        const existing = configs.find(c => c.currCode === formData.currCode)
        if (existing) {
            setFormData(prev => ({
                ...prev,
                cashNote: [...existing.cashNote],
                coinNote: [...existing.coinNote],
            }))
        } else {
            setFormData(prev => ({ ...prev, cashNote: [], coinNote: [] }))
        }
    }, [formData.currCode, isEditing, selectedConfig, configs])

    const loadData = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [currData, configData] = await Promise.all([
                fetchJSON(`${API_BASE}/api/master_data/currency`),
                fetchJSON(`${API_BASE}/api/pos_terminal/currency-note`),
            ])
            setCurrencies(Array.isArray(currData) ? currData : [])
            setConfigs(Array.isArray(configData) ? configData : [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const openEdit = (config) => {
        setSelectedConfig(config)
        setIsEditing(true)
        setSaveMsg('')
        setFormData({
            currCode: config.currCode,
            cashNote: [...(config.cashNote || [])],
            coinNote: [...(config.coinNote || [])],
            newCash: '',
            newCoin: '',
        })
    }

    const openNew = () => {
        const configuredCodes = configs.map(c => c.currCode)
        const first = currencies.find(c => !configuredCodes.includes(c.currCode)) || currencies[0]
        setSelectedConfig(null)
        setIsEditing(true)
        setSaveMsg('')
        setFormData({
            currCode: first?.currCode || '',
            cashNote: [],
            coinNote: [],
            newCash: '',
            newCoin: '',
        })
    }

    const closePanel = () => {
        setIsEditing(false)
        setSelectedConfig(null)
        setSaveMsg('')
    }

    const handleSave = async () => {
        if (!formData.currCode) { setSaveMsg('Please select a currency'); return }
        setSaving(true)
        setSaveMsg('')
        try {
            await postJSON(`${API_BASE}/api/pos_terminal/currency-note`, [{
                currCode: formData.currCode,
                cashNote: formData.cashNote,
                coinNote: formData.coinNote,
            }])
            setSaveMsg('Saved successfully')
            await loadData()
            setSelectedConfig({ currCode: formData.currCode, cashNote: formData.cashNote, coinNote: formData.coinNote })
            setIsEditing(true)
        } catch (err) {
            setSaveMsg('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!formData.currCode) return
        if (!window.confirm(`Remove configuration for ${formData.currCode}?`)) return
        setSaving(true)
        setSaveMsg('')
        try {
            await deleteJSON(`${API_BASE}/api/pos_terminal/currency-note/${formData.currCode}`)
            await loadData()
            closePanel()
        } catch (err) {
            setSaveMsg('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const filteredConfigs = useMemo(() => {
        const q = searchQuery.toLowerCase()
        return configs
            .filter(c => {
                const curr = currencies.find(cu => cu.currCode === c.currCode)
                return c.currCode.toLowerCase().includes(q) ||
                    (curr?.currName || '').toLowerCase().includes(q)
            })
            .sort((a, b) => {
                if (sortBy === 'code') return a.currCode.localeCompare(b.currCode)
                const na = currencies.find(c => c.currCode === a.currCode)?.currName || ''
                const nb = currencies.find(c => c.currCode === b.currCode)?.currName || ''
                return na.localeCompare(nb)
            })
    }, [configs, currencies, searchQuery, sortBy])

    return (
        <div className="org-page">
            <div className="cn-page-wrap">

                {/* ── Back + Page Title ── */}
                <div className="org-title-section">
                    <button className="back-button" onClick={onBack}>
                        <BackIcon /><span>Back to Dashboard</span>
                    </button>
                    <div className="cn-page-header">
                        <div>
                            <h2 className="org-page-title">POS Terminal Config</h2>
                            <p className="org-page-subtitle">Global Currency Note &amp; Coin Denominations</p>
                        </div>
                        <button className="toolbar-btn primary cn-configure-btn" onClick={openNew}>
                            <PlusIcon /> Configure New
                        </button>
                    </div>
                </div>

                {/* ── Search / Sort Bar ── */}
                <div className="cn-search-bar">
                    <div className="org-search-wrapper cn-search-expand">
                        <SearchIcon />
                        <input
                            type="text"
                            className="org-search-input"
                            placeholder="Search active currencies..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="cn-sort-wrap">
                        <button className="toolbar-btn" onClick={loadData} title="Refresh data">
                            <RefreshIcon /> Refresh
                        </button>
                        <select
                            className="cn-sort-select"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="code">Sort by Code</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="org-error-banner">
                        <span>⚠ {error}</span>
                        <button className="org-error-retry" onClick={loadData}>Retry</button>
                    </div>
                )}

                {/* ── Two-column body ── */}
                <div className="cn-body">

                    {/* Left — list */}
                    <div className="cn-list-col">
                        {loading ? (
                            <LoadingSpinner text="Loading currency configurations..." />
                        ) : filteredConfigs.length === 0 ? (
                            <div className="org-empty-state">
                                <p>{searchQuery ? `No results matching "${searchQuery}"` : 'No currency configurations yet.'}</p>
                                {!searchQuery && (
                                    <button className="toolbar-btn primary" onClick={openNew}>
                                        <PlusIcon /> Configure New
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="cn-list">
                                {filteredConfigs.map(config => {
                                    const curr = currencies.find(c => c.currCode === config.currCode)
                                    const isSelected = isEditing && selectedConfig?.currCode === config.currCode
                                    return (
                                        <CurrencyConfigCard
                                            key={config.currCode}
                                            config={config}
                                            currName={curr?.currName || config.currCode}
                                            isSelected={isSelected}
                                            onClick={() => openEdit(config)}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right — panel */}
                    <div className="cn-panel-col">
                        {isEditing ? (
                            <EditorPanel
                                isNew={!selectedConfig}
                                currencies={currencies}
                                configs={configs}
                                formData={formData}
                                setFormData={setFormData}
                                saving={saving}
                                saveMsg={saveMsg}
                                onSave={handleSave}
                                onDelete={handleDelete}
                                onClose={closePanel}
                            />
                        ) : (
                            <InfoPanel onConfigureNew={openNew} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CurrencyNotePage
