import { useState, useEffect } from 'react'
import {
    fetchSapSyncQueue, retrySapSyncQueue,
    fetchSapReturnReceiptSyncQueue, retrySapReturnReceiptSyncQueue,
    fetchSapFinancialReceiptSyncQueue, retrySapFinancialReceiptSyncQueue,
} from '../service/api'

/* ===== Helpers ===== */
const fmt = (val) => val != null ? Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'
const fmtDate = (val) => val ? new Date(val).toLocaleString() : '-'

/* ===== Tab Configurations ===== */
const TAB_CONFIGS = {
    Invoice: {
        label: 'Invoice',
        title: 'SAP Invoice Sync Queue',
        fetchFn: fetchSapSyncQueue,
        retryFn: retrySapSyncQueue,
        idKey: 'receiptNumber',
        buildRetryPayload: (row) => ({ posTerminal: row.posTerminal, receiptNumber: row.receiptNumber, status: 'PENDING', Message: '' }),
        columns: [
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'receiptNumber', label: 'Receipt No.' },
            { key: 'posTerminal', label: 'Terminal' },
            { key: 'receiptDate', label: 'Receipt Date', render: fmtDate },
            { key: 'documentStatus', label: 'Doc Status' },
            { key: 'totalPayment', label: 'Total Payment', render: fmt, className: 'amount-cell' },
            { key: 'retryCount', label: 'Retries', className: 'center-cell' },
            { key: 'errorMessage', label: 'Error', isError: true },
        ],
    },
    'Return Invoice': {
        label: 'Return Invoice',
        title: 'SAP Return Receipt Sync Queue',
        fetchFn: fetchSapReturnReceiptSyncQueue,
        retryFn: retrySapReturnReceiptSyncQueue,
        idKey: 'returnReceiptNumber',
        buildRetryPayload: (row) => ({ posTerminal: row.posTerminal, returnReceiptNumber: row.returnReceiptNumber, status: 'PENDING', Message: '' }),
        columns: [
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'returnReceiptNumber', label: 'Return Receipt No.' },
            { key: 'posTerminal', label: 'Terminal' },
            { key: 'returnDate', label: 'Return Date', render: fmtDate },
            { key: 'documentStatus', label: 'Doc Status' },
            { key: 'totalBeforeDiscount', label: 'Before Discount', render: fmt, className: 'amount-cell' },
            { key: 'totalAfterTax', label: 'After Tax', render: fmt, className: 'amount-cell' },
            { key: 'totalPayment', label: 'Total Payment', render: fmt, className: 'amount-cell' },
            { key: 'retryCount', label: 'Retries', className: 'center-cell' },
            { key: 'errorMessage', label: 'Error', isError: true },
        ],
    },
    Financial: {
        label: 'Financial',
        title: 'SAP Financial Receipt Sync Queue',
        fetchFn: fetchSapFinancialReceiptSyncQueue,
        retryFn: retrySapFinancialReceiptSyncQueue,
        idKey: 'financialReceiptId',
        buildRetryPayload: (row) => ({ posTerminal: row.posTerminal, financialReceiptId: row.financialReceiptId, status: 'PENDING', Message: '' }),
        columns: [
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'financialReceiptId', label: 'Receipt ID', className: 'center-cell' },
            { key: 'posTerminal', label: 'Terminal' },
            { key: 'financialType', label: 'Type' },
            { key: 'account', label: 'Account', render: (v) => v || '-' },
            { key: 'amountInMainCurr', label: 'Amount (Main)', render: fmt, className: 'amount-cell' },
            { key: 'amountInFcCurr', label: 'Amount (FC)', render: fmt, className: 'amount-cell' },
            { key: 'sapDocEntry', label: 'SAP Doc Entry', render: (v) => v ?? '-', className: 'center-cell' },
            { key: 'financialReceiptCreateAt', label: 'Created At', render: fmtDate },
            { key: 'retryCount', label: 'Retries', className: 'center-cell' },
            { key: 'errorMessage', label: 'Error', isError: true },
        ],
    },
}

const TAB_KEYS = Object.keys(TAB_CONFIGS)

/* ===== Status Badge ===== */
function StatusBadge({ status }) {
    const displayStatus = status || 'UNKNOWN'
    return <span className={`status-badge status-${displayStatus.toLowerCase()}`}>{displayStatus}</span>
}

/* ===== Back Icon ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

/* ===== Error Cell ===== */
function ErrorCell({ value, onShow }) {
    if (!value) return '-'
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={value}>
                {value}
            </span>
            <button
                className="link-cell"
                style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => onShow(value)}
            >
                Show
            </button>
        </div>
    )
}

/* ===== Monitoring Page ===== */
function MonitoringPage({ onBack }) {
    const [activeTab, setActiveTab] = useState('Invoice')
    const [filterType, setFilterType] = useState('ALL')
    const [selectedRows, setSelectedRows] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [retryResults, setRetryResults] = useState(null)
    const [viewErrorModal, setViewErrorModal] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [data, setData] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const rowsPerPage = 10

    const config = TAB_CONFIGS[activeTab]

    useEffect(() => {
        fetchData()
    }, [currentPage, filterType, activeTab])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const pageIndex = Math.max(0, currentPage - 1)
            const result = await config.fetchFn(pageIndex, rowsPerPage, filterType)
            setData(result.content || [])
            setTotalPages(result.totalPages || 1)
            setSelectedRows([])
            setSelectAll(false)
        } catch (err) {
            setError(err.message)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setCurrentPage(1)
        setFilterType('ALL')
        setSelectedRows([])
        setSelectAll(false)
        setRetryResults(null)
        setError(null)
    }

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([])
        } else {
            setSelectedRows(data.map((_, i) => i))
        }
        setSelectAll(!selectAll)
    }

    const handleSelectRow = (index) => {
        setSelectedRows(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const handleRetry = async () => {
        if (selectedRows.length === 0) return
        setLoading(true)
        setError(null)
        try {
            const payload = selectedRows.map(idx => config.buildRetryPayload(data[idx]))
            const results = await config.retryFn(payload)
            setRetryResults(results)
            setSelectedRows([])
            setSelectAll(false)
            await fetchData()
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="monitoring-page">
            {/* Retry Results Modal */}
            {retryResults && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Retry Results ({retryResults.length})</h3>
                        <div className="retry-results-list">
                            {retryResults.map((res, i) => (
                                <div key={i} className={`retry-result-item ${res.status === 'FAILED' ? 'error' : 'success'}`}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong>{res[config.idKey] ?? i}:</strong> <StatusBadge status={res.status} />
                                    </div>
                                    {res.Message && <div className="retry-result-msg">{res.Message}</div>}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button className="toolbar-btn primary" onClick={() => setRetryResults(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Details Modal */}
            {viewErrorModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Error Details</h3>
                        <div className="retry-result-msg" style={{ margin: '16px 0', borderTop: 'none', padding: 0 }}>
                            {viewErrorModal}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button className="toolbar-btn primary" onClick={() => setViewErrorModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="monitoring-header">
                <button className="back-button" onClick={onBack} id="monitoring-back-btn">
                    <BackIcon />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="monitoring-tabs">
                {TAB_KEYS.map(tab => (
                    <button
                        key={tab}
                        className={`monitoring-tab ${activeTab === tab ? 'active' : ''}`}
                        id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {TAB_CONFIGS[tab].label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="monitoring-content">
                <h2 className="monitoring-title">{config.title}</h2>

                {/* Toolbar */}
                <div className="monitoring-toolbar">
                    <div className="toolbar-left">
                        <button
                            className="toolbar-btn"
                            id="release-btn"
                            onClick={handleRetry}
                            disabled={selectedRows.length === 0 || loading}
                        >
                            Retry Selected
                        </button>
                        <button className="toolbar-btn primary" id="refresh-btn" onClick={fetchData}>Refresh</button>
                        <select
                            className="toolbar-select"
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1) }}
                            id="filter-type-select"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
                            <option value="VOID">Void</option>
                        </select>
                    </div>
                    <div className="toolbar-right">
                        <button className="toolbar-btn icon-btn" id="settings-btn" title="Settings">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-wrapper">
                    <table className="data-table" id="receipts-table">
                        <thead>
                            <tr>
                                <th className="checkbox-col">
                                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} id="select-all-checkbox" />
                                </th>
                                {config.columns.map(col => <th key={col.key}>{col.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>Loading data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '30px', color: 'var(--status-cancelled)' }}>Error: {error}</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>No sync records found.</td></tr>
                            ) : data.map((row, idx) => (
                                <tr key={idx} className={selectedRows.includes(idx) ? 'selected' : ''} id={`receipt-row-${idx}`}>
                                    <td className="checkbox-col">
                                        <input type="checkbox" checked={selectedRows.includes(idx)} onChange={() => handleSelectRow(idx)} />
                                    </td>
                                    {config.columns.map(col => (
                                        <td key={col.key} className={col.className || ''} style={col.key === 'errorMessage' ? { maxWidth: '250px' } : undefined}>
                                            {col.isError
                                                ? <ErrorCell value={row[col.key]} onShow={setViewErrorModal} />
                                                : col.render
                                                    ? col.render(row[col.key])
                                                    : (row[col.key] ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="table-pagination" id="table-pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>{'|<'}</button>
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>{'<'}</button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>{'>'}</button>
                    <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(totalPages)}>{'>|'}</button>
                </div>
            </div>
        </div>
    )
}

export default MonitoringPage
