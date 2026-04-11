import { useState, useEffect } from 'react'

const tabs = ['SAP SYNC QUEUE']

const columns = [
    { key: 'status', label: 'Status' },
    { key: 'receiptNumber', label: 'Receipt No.' },
    { key: 'posTerminal', label: 'Terminal' },
    { key: 'receiptDate', label: 'Receipt Date' },
    { key: 'documentStatus', label: 'Doc Status' },
    { key: 'totalPayment', label: 'Total Payment' },
    { key: 'retryCount', label: 'Retries' },
    { key: 'errorMessage', label: 'Error' },
]

/* ===== Status Badge Component ===== */
function StatusBadge({ status }) {
    const displayStatus = status || 'UNKNOWN'
    const className = `status-badge status-${displayStatus.toLowerCase()}`
    return <span className={className}>{displayStatus}</span>
}

/* ===== Back Arrow Icon ===== */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

/* ===== Monitoring Page Component ===== */
function MonitoringPage({ onBack }) {
    const [activeTab, setActiveTab] = useState('SAP SYNC QUEUE')
    const [filterType, setFilterType] = useState('ALL')
    const [selectedRows, setSelectedRows] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [retryResults, setRetryResults] = useState(null)
    const [viewErrorModal, setViewErrorModal] = useState(null)

    // API State
    const [currentPage, setCurrentPage] = useState(1)
    const [data, setData] = useState([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const rowsPerPage = 10

    useEffect(() => {
        fetchData();
    }, [currentPage, filterType])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const pageIndex = Math.max(0, currentPage - 1)
            let url = `http://localhost:9988/api/monitoring/sap-invoice-sync-que?page=${pageIndex}&size=${rowsPerPage}`
            if (filterType !== 'ALL') {
                url += `&status=${filterType}`
            }
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch data')
            }
            const result = await response.json()
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
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const handleRetry = async () => {
        if (selectedRows.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const payload = selectedRows.map(idx => ({
                posTerminal: data[idx].posTerminal,
                receiptNumber: data[idx].receiptNumber
            }));

            const response = await fetch('http://localhost:9988/api/monitoring/retry-sap-invoice-sync-que', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to retry selected receipts');
            }

            const results = await response.json();
            setRetryResults(results);

            setSelectedRows([]);
            setSelectAll(false);
            await fetchData();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

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
                                        <strong>{res.receiptNumber}:</strong> <StatusBadge status={res.status} />
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
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`monitoring-tab ${activeTab === tab ? 'active' : ''}`}
                        id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="monitoring-content">
                <h2 className="monitoring-title">SAP Invoice Sync Queue</h2>

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
                            onChange={(e) => {
                                setFilterType(e.target.value)
                                setCurrentPage(1)
                            }}
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
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        id="select-all-checkbox"
                                    />
                                </th>
                                {columns.map(col => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>Loading data...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '30px', color: 'var(--status-cancelled)' }}>Error: {error}</td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '30px' }}>No sync records found.</td>
                                </tr>
                            ) : data.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={selectedRows.includes(idx) ? 'selected' : ''}
                                    id={`receipt-row-${idx}`}
                                >
                                    <td className="checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(idx)}
                                            onChange={() => handleSelectRow(idx)}
                                        />
                                    </td>
                                    <td><StatusBadge status={row.status} /></td>
                                    <td className="link-cell">{row.receiptNumber}</td>
                                    <td>{row.posTerminal}</td>
                                    <td>{row.receiptDate && new Date(row.receiptDate).toLocaleString()}</td>
                                    <td>{row.documentStatus}</td>
                                    <td className="amount-cell">{row.totalPayment != null ? row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{row.retryCount}</td>
                                    <td style={{ maxWidth: '250px' }}>
                                        {row.errorMessage ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={row.errorMessage}>
                                                    {row.errorMessage}
                                                </span>
                                                <button
                                                    className="link-cell"
                                                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', flexShrink: 0, cursor: 'pointer' }}
                                                    onClick={() => setViewErrorModal(row.errorMessage)}
                                                >
                                                    Show
                                                </button>
                                            </div>
                                        ) : '-'}
                                    </td>
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
