import { useState, useEffect, useCallback, useRef } from 'react'
import { API_BASE, fetchJSON, postJSON } from '../service/api'

/* ===== Icons ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const SaveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

const SpinnerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gs-spin">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const HashIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
)

const TerminalIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

const ChevronIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={`gs-chevron ${open ? 'open' : ''}`}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const ZapIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
)

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const RotateIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
)

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const InfoIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
)

const TrashIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

const StoreIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
)

const UserIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const LayersIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
)

const HistoryIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const SettingsIcon = () => (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

/* ===== Token definitions ===== */
const AVAILABLE_TOKENS = [
    { tag: '{terminalId}', label: 'Terminal ID', group: 'identity' },
    { tag: '{storeId}', label: 'Store ID', group: 'identity' },
    { tag: '{cashierId}', label: 'Cashier ID', group: 'identity' },
    { tag: '{shift}', label: 'Shift', group: 'identity' },
    { tag: '{YYYY}', label: 'Year (4)', group: 'time' },
    { tag: '{YY}', label: 'Year (2)', group: 'time' },
    { tag: '{MM}', label: 'Month (2)', group: 'time' },
    { tag: '{MMM}', label: 'Month (Name)', group: 'time' },
    { tag: '{DD}', label: 'Day (2)', group: 'time' },
    { tag: '{week}', label: 'Week #', group: 'time' },
    { tag: '{quarter}', label: 'Quarter', group: 'time' },
    { tag: '{DDD}', label: 'Julian Day', group: 'time' },
    { tag: '{Sequence}', label: 'Padded Seq', group: 'logic' },
]

/* ===== Terminal Selector with Search ===== */
function TerminalSelector({ terminals, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selected = terminals.find(t => t.posTerminalID === value)
    const filtered = terminals.filter(t =>
        (t.posTerminalID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.posName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="gs-term-sel" ref={ref} id="terminal-selector">
            <button
                className={`gs-term-trigger ${isOpen ? 'focused' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="gs-term-trigger-info">
                    <span className="gs-term-code">{selected?.posTerminalID || '—'}</span>
                    <span className="gs-term-dot" />
                    <span className="gs-term-name">{selected?.posName || 'Select terminal'}</span>
                </div>
                <ChevronIcon open={isOpen} />
            </button>

            {isOpen && (
                <div className="gs-term-dropdown">
                    <div className="gs-term-search-wrap">
                        <SearchIcon />
                        <input
                            autoFocus
                            placeholder="Search code or name..."
                            className="gs-term-search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="gs-term-list">
                        {filtered.map(t => (
                            <button
                                key={t.posTerminalID}
                                className={`gs-term-option ${value === t.posTerminalID ? 'selected' : ''}`}
                                onClick={() => { onChange(t.posTerminalID); setIsOpen(false); setSearchTerm('') }}
                                type="button"
                            >
                                <div className="gs-term-option-info">
                                    <span className={`gs-term-option-code ${value === t.posTerminalID ? 'active' : ''}`}>{t.posTerminalID}</span>
                                    <span className="gs-term-option-name">{t.posName || '—'}</span>
                                </div>
                                {value === t.posTerminalID && <span className="gs-term-check"><CheckIcon /></span>}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="gs-term-empty">No matching terminals found.</div>
                        )}
                    </div>
                </div>
            )}
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

/* ===== Receipt Numbering Page ===== */
function ReceiptNumberingPage({ onBack }) {
    const [terminals, setTerminals] = useState([])
    const [selectedTerminalId, setSelectedTerminalId] = useState('')
    const [loadingTerminals, setLoadingTerminals] = useState(true)

    // Pattern state (ReceiptNumberingPattern schema)
    const [pattern, setPattern] = useState(null)
    const [loadingPattern, setLoadingPattern] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [settings, setSettings] = useState({
        format: '{terminalId}-{YYYY}{MM}{DD}{Sequence}',
        returnFormat: '{terminalId}-RT-{YYYY}{MM}{DD}{Sequence}',
        sequenceLength: 6,
        sequenceStart: 1,
        currentSequence: 1,
        nextSequence: 2,
        resetSequence: 'DAILY',
    })

    // Preview context (query params for preview endpoint)
    const [context, setContext] = useState({
        storeId: 'S01',
        cashierId: 'C01',
        shift: 1,
    })

    // Local live preview
    const [previews, setPreviews] = useState({ receipt: '', returnReceipt: '' })

    // History
    const [history, setHistory] = useState([])
    const [showAllHistory, setShowAllHistory] = useState(false)

    /* Load terminals */
    const loadTerminals = useCallback(async () => {
        setLoadingTerminals(true)
        try {
            const data = await fetchJSON(`${API_BASE}/api/pos_terminal/all`)
            const list = Array.isArray(data) ? data : []
            setTerminals(list)
            if (list.length > 0) setSelectedTerminalId(list[0].posTerminalID)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoadingTerminals(false)
        }
    }, [])

    useEffect(() => { loadTerminals() }, [loadTerminals])

    /* Load pattern for selected terminal */
    const loadPattern = useCallback(async () => {
        if (!selectedTerminalId) return
        setLoadingPattern(true)
        setError('')
        try {
            const data = await fetchJSON(`${API_BASE}/pos_api/receipt-numbering-pattern?terminalId=${selectedTerminalId}`)
            setPattern(data)
            setSettings({
                format: data.format || '{terminalId}-{YYYY}{MM}{DD}{Sequence}',
                returnFormat: data.returnFormat || '',
                sequenceLength: data.sequenceLength ?? 6,
                sequenceStart: data.sequenceStart ?? 1,
                currentSequence: data.currentSequence ?? 1,
                nextSequence: data.nextSequence ?? 2,
                resetSequence: data.resetSequence || 'DAILY',
            })
        } catch {
            setPattern(null)
            setSettings({
                format: '{terminalId}-{YYYY}{MM}{DD}{Sequence}',
                returnFormat: '{terminalId}-RT-{YYYY}{MM}{DD}{Sequence}',
                sequenceLength: 6,
                sequenceStart: 1,
                currentSequence: 1,
                nextSequence: 2,
                resetSequence: 'DAILY',
            })
        } finally {
            setLoadingPattern(false)
        }
    }, [selectedTerminalId])

    useEffect(() => { loadPattern() }, [loadPattern])

    /* Load history */
    const loadHistory = useCallback(async () => {
        if (!selectedTerminalId) return
        try {
            const data = await fetchJSON(`${API_BASE}/pos_api/receipt-numbering-pattern/history?terminalId=${selectedTerminalId}`)
            setHistory(Array.isArray(data) ? data : [])
        } catch {
            setHistory([])
        }
    }, [selectedTerminalId])

    useEffect(() => { loadHistory() }, [loadHistory])

    /* Live preview generation */
    useEffect(() => {
        const now = new Date()
        const parse = (fmt) => {
            if (!fmt) return ''
            const seq = String(settings.currentSequence).padStart(settings.sequenceLength, '0')
            return fmt
                .replace(/{terminalId}/g, selectedTerminalId || 'POS')
                .replace(/{storeId}/g, context.storeId)
                .replace(/{cashierId}/g, context.cashierId)
                .replace(/{shift}/g, String(context.shift))
                .replace(/{YYYY}/g, String(now.getFullYear()))
                .replace(/{YY}/g, String(now.getFullYear()).slice(-2))
                .replace(/{MM}/g, String(now.getMonth() + 1).padStart(2, '0'))
                .replace(/{MMM}/g, now.toLocaleString('en', { month: 'short' }))
                .replace(/{DD}/g, String(now.getDate()).padStart(2, '0'))
                .replace(/{week}/g, String(Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)))
                .replace(/{quarter}/g, 'Q' + Math.ceil((now.getMonth() + 1) / 3))
                .replace(/{DDD}/g, String(Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 86400000)))
                .replace(/{Sequence}/g, seq)
        }
        setPreviews({
            receipt: parse(settings.format),
            returnReceipt: parse(settings.returnFormat || settings.format),
        })
    }, [settings, selectedTerminalId, context])

    /* Sequence start change logic */
    const handleStartChange = (val) => {
        const start = parseInt(val) || 0
        setSettings(prev => ({
            ...prev,
            sequenceStart: start,
            currentSequence: start,
            nextSequence: start + 1,
        }))
    }

    /* Save */
    const handleSave = async () => {
        if (!selectedTerminalId) return
        if (!settings.format) { setError('Receipt format is required'); return }
        setSaving(true)
        setError('')
        try {
            await postJSON(`${API_BASE}/pos_api/receipt-numbering-pattern?terminalId=${selectedTerminalId}`, {
                format: settings.format,
                returnFormat: settings.returnFormat || null,
                sequenceLength: parseInt(settings.sequenceLength) || 6,
                sequenceStart: parseInt(settings.sequenceStart) || 1,
                currentSequence: parseInt(settings.currentSequence) || 1,
                nextSequence: parseInt(settings.nextSequence) || 2,
                resetSequence: settings.resetSequence,
            })
            await loadPattern()
            await loadHistory()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    /* Insert token into format */
    const insertToken = (tag) => {
        setSettings(prev => ({ ...prev, format: prev.format + tag }))
    }

    if (loadingTerminals) {
        return (
            <div className="gs-page">
                <div className="gs-wrap">
                    <LoadingSpinner text="Loading terminals..." />
                </div>
            </div>
        )
    }

    const now = new Date()

    return (
        <div className="gs-page">
            <div className="gs-wrap">

                {/* ===== Header ===== */}
                <div className="gs-header">
                    <div className="gs-header-left">
                        <button className="gs-back-btn" onClick={onBack} id="gs-back-btn">
                            <BackIcon />
                        </button>
                        <div>
                            <h1 className="gs-title">Receipt Numbering</h1>
                            <nav className="gs-breadcrumb">
                                <span>Dashboard</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                <span className="gs-breadcrumb-active">Document Numbering</span>
                            </nav>
                        </div>
                    </div>
                    <button
                        className="gs-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                        id="btn-save-pattern"
                    >
                        {saving ? <SpinnerIcon /> : <SaveIcon />}
                        {saving ? 'Creating...' : (pattern ? 'Update Pattern' : 'Create Pattern')}
                    </button>
                </div>

                {/* ===== Error ===== */}
                {error && (
                    <div className="gs-error-banner">
                        <span>⚠ {error}</span>
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}

                {/* ===== Terminal Bar ===== */}
                <div className="gs-terminal-bar">
                    <div className="gs-terminal-bar-label">
                        <div className="gs-terminal-bar-icon"><TerminalIcon /></div>
                        <span>POS Terminal</span>
                    </div>
                    <TerminalSelector
                        terminals={terminals}
                        value={selectedTerminalId}
                        onChange={setSelectedTerminalId}
                    />
                </div>

                {loadingPattern ? (
                    <LoadingSpinner text="Loading pattern..." />
                ) : (
                    <div className="gs-grid">

                        {/* ===== LEFT COLUMN: Main Config ===== */}
                        <div className="gs-col-main">

                            {/* Pattern Architect */}
                            <div className="gs-card gs-architect">
                                <div className="gs-card-header">
                                    <div className="gs-card-header-left">
                                        <div className="gs-card-icon blue"><HashIcon /></div>
                                        <h2 className="gs-card-title">Pattern Architect</h2>
                                    </div>
                                    <div className="gs-card-badge">
                                        <InfoIcon />
                                        <span>JSON BODY SCHEMA</span>
                                    </div>
                                </div>

                                <div className="gs-card-body">

                                    {/* Token Library */}
                                    <div className="gs-section">
                                        <div className="gs-section-label">
                                            <ZapIcon />
                                            <span>Format Tokens Library</span>
                                        </div>
                                        <div className="gs-token-grid">
                                            {AVAILABLE_TOKENS.map(token => (
                                                <button
                                                    key={token.tag}
                                                    className="gs-token-chip"
                                                    onClick={() => insertToken(token.tag)}
                                                    type="button"
                                                    title={`Insert ${token.tag}`}
                                                >
                                                    <span className="gs-token-tag">{token.tag}</span>
                                                    <span className="gs-token-dot" />
                                                    <span className="gs-token-label">{token.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Normal Receipt Format */}
                                    <div className="gs-section">
                                        <div className="gs-format-header">
                                            <label className="gs-section-label">
                                                <span className="gs-dot blue" />
                                                Normal Receipt Format
                                            </label>
                                        </div>
                                        <textarea
                                            rows="2"
                                            className="gs-format-textarea blue"
                                            value={settings.format}
                                            onChange={e => setSettings(prev => ({ ...prev, format: e.target.value }))}
                                            id="input-receipt-format"
                                        />
                                        <div className="gs-preview-box blue">
                                            <div className="gs-preview-icon blue"><EyeIcon /></div>
                                            <div className="gs-preview-text">
                                                <span className="gs-preview-label">Live Result</span>
                                                <span className="gs-preview-value blue">{previews.receipt || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Return Receipt Format */}
                                    <div className="gs-section">
                                        <div className="gs-format-header">
                                            <label className="gs-section-label">
                                                <span className="gs-dot purple" />
                                                Return Receipt Format
                                            </label>
                                            <button
                                                className="gs-clear-btn"
                                                onClick={() => setSettings(prev => ({ ...prev, returnFormat: '' }))}
                                                type="button"
                                            >
                                                <TrashIcon />
                                                <span>Clear (Falls back to format)</span>
                                            </button>
                                        </div>
                                        <textarea
                                            rows="2"
                                            className="gs-format-textarea purple"
                                            placeholder={settings.format}
                                            value={settings.returnFormat}
                                            onChange={e => setSettings(prev => ({ ...prev, returnFormat: e.target.value }))}
                                            id="input-return-format"
                                        />
                                        <div className="gs-preview-box purple">
                                            <div className="gs-preview-icon purple"><RotateIcon /></div>
                                            <div className="gs-preview-text">
                                                <span className="gs-preview-label">Return Preview</span>
                                                <span className="gs-preview-value purple">{previews.returnReceipt || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sequence Controller */}
                            <div className="gs-card gs-sequence">
                                <div className="gs-card-header-inline">
                                    <ClockIcon />
                                    <h2 className="gs-card-title">Sequence Controller</h2>
                                </div>

                                <div className="gs-seq-grid">
                                    <div className="gs-seq-field">
                                        <label>Length (Padding)</label>
                                        <input
                                            type="number" min="1" max="12"
                                            value={settings.sequenceLength}
                                            onChange={e => setSettings(prev => ({ ...prev, sequenceLength: parseInt(e.target.value) || 6 }))}
                                            id="input-seq-length"
                                        />
                                    </div>
                                    <div className="gs-seq-field">
                                        <label>Start At</label>
                                        <input
                                            type="number"
                                            value={settings.sequenceStart}
                                            onChange={e => handleStartChange(e.target.value)}
                                            id="input-seq-start"
                                        />
                                    </div>
                                    <div className="gs-seq-field">
                                        <label>Current Val</label>
                                        <input
                                            type="number"
                                            value={settings.currentSequence}
                                            readOnly
                                            className="gs-readonly"
                                        />
                                    </div>
                                    <div className="gs-seq-field">
                                        <label>Reset At</label>
                                        <select
                                            value={settings.resetSequence}
                                            onChange={e => setSettings(prev => ({ ...prev, resetSequence: e.target.value }))}
                                            id="input-reset-sequence"
                                        >
                                            <option value="DAILY">DAILY</option>
                                            <option value="MONTHLY">MONTHLY</option>
                                            <option value="YEARLY">YEARLY</option>
                                            <option value="NEVER">NEVER</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="gs-next-preview">
                                    <div className="gs-next-preview-left">
                                        <div className="gs-next-icon"><ZapIcon /></div>
                                        <div>
                                            <span className="gs-next-label">Next Sequence Preview</span>
                                            <span className="gs-next-value">
                                                {String(settings.nextSequence).padStart(settings.sequenceLength, '0')}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="gs-refresh-btn" onClick={loadPattern} type="button">
                                        Refresh Registry
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ===== RIGHT COLUMN: Context & Audit ===== */}
                        <div className="gs-col-side">

                            {/* Preview Context */}
                            <div className="gs-card gs-context">
                                <div className="gs-context-bg"><SettingsIcon /></div>

                                <h3 className="gs-context-title">
                                    <CalendarIcon />
                                    <span>Preview Context</span>
                                </h3>

                                <div className="gs-context-fields">
                                    <div className="gs-ctx-field">
                                        <label>Store ID</label>
                                        <div className="gs-ctx-input-wrap">
                                            <StoreIcon />
                                            <input
                                                value={context.storeId}
                                                onChange={e => setContext(prev => ({ ...prev, storeId: e.target.value }))}
                                                id="input-store-id"
                                            />
                                        </div>
                                    </div>
                                    <div className="gs-ctx-field">
                                        <label>Cashier ID</label>
                                        <div className="gs-ctx-input-wrap">
                                            <UserIcon />
                                            <input
                                                value={context.cashierId}
                                                onChange={e => setContext(prev => ({ ...prev, cashierId: e.target.value }))}
                                                id="input-cashier-id"
                                            />
                                        </div>
                                    </div>
                                    <div className="gs-ctx-field">
                                        <label>Shift Number</label>
                                        <div className="gs-ctx-input-wrap">
                                            <LayersIcon />
                                            <input
                                                type="number"
                                                value={context.shift}
                                                onChange={e => setContext(prev => ({ ...prev, shift: parseInt(e.target.value) || 0 }))}
                                                id="input-shift"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="gs-token-ref">
                                    <div className="gs-token-ref-header">
                                        <InfoIcon />
                                        <span>Token Reference</span>
                                    </div>
                                    <div className="gs-token-ref-grid">
                                        <span>YYYY: {now.getFullYear()}</span>
                                        <span>MMM: {now.toLocaleString('en', { month: 'short' })}</span>
                                        <span>week: {Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)}</span>
                                        <span>quarter: Q{Math.ceil((now.getMonth() + 1) / 3)}</span>
                                        <span>DDD: {Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 86400000)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Audit / History */}
                            <div className="gs-card gs-audit">
                                <div className="gs-audit-header">
                                    <div className="gs-audit-header-left">
                                        <HistoryIcon />
                                        <span>Latest Audit</span>
                                    </div>
                                    {history.length > 1 && (
                                        <button
                                            className="gs-audit-view-all"
                                            onClick={() => setShowAllHistory(!showAllHistory)}
                                            type="button"
                                        >
                                            {showAllHistory ? 'Collapse' : 'View All'}
                                        </button>
                                    )}
                                </div>
                                <div className="gs-audit-body">
                                    {history.length === 0 ? (
                                        <div className="gs-audit-empty">
                                            <p>No pattern history yet</p>
                                        </div>
                                    ) : (
                                        (showAllHistory ? history : history.slice(0, 3)).map((h, i) => (
                                            <div key={h.id || i} className="gs-audit-item">
                                                <div className="gs-audit-line" />
                                                <div className={`gs-audit-dot ${i === 0 ? 'current' : ''}`} />
                                                <div className="gs-audit-info">
                                                    <span className="gs-audit-action">{i === 0 ? 'Active Pattern' : 'Previous Pattern'}</span>
                                                    <span className="gs-audit-meta">
                                                        Terminal {selectedTerminalId} • {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Unknown'}
                                                    </span>
                                                    <code className="gs-audit-format">{h.format || '—'}</code>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReceiptNumberingPage
