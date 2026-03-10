import { useState } from 'react'

/* ===== Sample Data ===== */
const receiptData = [
    { status: 'Released', duplicate: false, internalId: 136, posSystem: '21.6', dayEndClosing: '2169000I1013', receiptId: '21652702260001095', documentDate: '3/2/2026, 2:06:01 PM', customerId: 'C99999', totalGrossAmount: '476.92 USD', b1DocId: '1203236' },
    { status: 'Released', duplicate: false, internalId: 135, posSystem: '21.6', dayEndClosing: '2169000I1012', receiptId: '21652702260001094', documentDate: '2/27/2026, 4:27:49 PM', customerId: 'C99999', totalGrossAmount: '346.48 USD', b1DocId: '1203235' },
    { status: 'Cancelled', duplicate: false, internalId: 132, posSystem: '21.6', dayEndClosing: '2169000I1012', receiptId: '21652702260001094', documentDate: '2/27/2026, 4:27:49 PM', customerId: '', totalGrossAmount: '346.48 USD', b1DocId: '' },
    { status: 'Released', duplicate: false, internalId: 129, posSystem: '21.6', dayEndClosing: '2169000I1010', receiptId: '21652102260001092', documentDate: '2/25/2026, 11:29:00 AM', customerId: 'C99999', totalGrossAmount: '74.14 USD', b1DocId: '1203224' },
    { status: 'Released', duplicate: false, internalId: 126, posSystem: '21.6', dayEndClosing: '2169000I1009', receiptId: '21651302260001090', documentDate: '2/13/2026, 10:30:49 AM', customerId: 'C99999', totalGrossAmount: '20.00 USD', b1DocId: '1203522' },
    { status: 'Released', duplicate: false, internalId: 123, posSystem: '21.6', dayEndClosing: '2169000I1008', receiptId: '21651302260001089', documentDate: '2/13/2026, 10:18:26 AM', customerId: 'C99999', totalGrossAmount: '41.00 USD', b1DocId: '1203521' },
    { status: 'Released', duplicate: false, internalId: 122, posSystem: '21.6', dayEndClosing: '2169000I1008', receiptId: '21651302260001088', documentDate: '2/13/2026, 10:15:39 AM', customerId: 'C99999', totalGrossAmount: '15.00 USD', b1DocId: '1203520' },
    { status: 'Cancelled', duplicate: false, internalId: 119, posSystem: '21.6', dayEndClosing: '2169000I1007', receiptId: '21651102260001084', documentDate: '2/11/2026, 10:28:43 AM', customerId: 'C99999', totalGrossAmount: '74.14 USD', b1DocId: '' },
    { status: 'Cancelled', duplicate: false, internalId: 118, posSystem: '21.6', dayEndClosing: '2169000I1007', receiptId: '21651102260001083', documentDate: '2/11/2026, 10:27:47 AM', customerId: 'C99999', totalGrossAmount: '346.48 USD', b1DocId: '' },
    { status: 'Released', duplicate: false, internalId: 117, posSystem: '21.6', dayEndClosing: '2169000I1007', receiptId: '21651102260001082', documentDate: '2/11/2026, 10:18:46 AM', customerId: '', totalGrossAmount: '74.14 USD', b1DocId: '1201531' },
]

const tabs = ['RECEIPTS', 'CASH TRANSACTIONS', 'SALES SUMMARIES']

const columns = [
    { key: 'status', label: 'Status' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'internalId', label: 'Internal ID' },
    { key: 'posSystem', label: 'POS system' },
    { key: 'dayEndClosing', label: 'Day-end closing' },
    { key: 'receiptId', label: 'Receipt ID' },
    { key: 'documentDate', label: 'Document date' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'totalGrossAmount', label: 'Total gross amount' },
    { key: 'b1DocId', label: 'B1 doc ID' },
]

/* ===== Status Badge Component ===== */
function StatusBadge({ status }) {
    const className = `status-badge status-${status.toLowerCase()}`
    return <span className={className}>{status}</span>
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
    const [activeTab, setActiveTab] = useState('RECEIPTS')
    const [filterType, setFilterType] = useState('All receipts')
    const [selectedRows, setSelectedRows] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10
    const totalPages = 5

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([])
        } else {
            setSelectedRows(receiptData.map((_, i) => i))
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

    return (
        <div className="monitoring-page">
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
                <h2 className="monitoring-title">Point of sales receipts</h2>

                {/* Toolbar */}
                <div className="monitoring-toolbar">
                    <div className="toolbar-left">
                        <button className="toolbar-btn" id="release-btn">Release</button>
                        <button className="toolbar-btn" id="cancel-btn">Cancel</button>
                        <button className="toolbar-btn primary" id="refresh-btn">Refresh</button>
                        <select
                            className="toolbar-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            id="filter-type-select"
                        >
                            <option>All receipts</option>
                            <option>Released</option>
                            <option>Cancelled</option>
                            <option>Pending</option>
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
                            {receiptData.map((row, idx) => (
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
                                    <td>{row.duplicate ? '☑' : ''}</td>
                                    <td className="link-cell">{row.internalId}</td>
                                    <td>{row.posSystem}</td>
                                    <td className="mono">{row.dayEndClosing}</td>
                                    <td className="mono">{row.receiptId}</td>
                                    <td>{row.documentDate}</td>
                                    <td>{row.customerId}</td>
                                    <td className="amount-cell">{row.totalGrossAmount}</td>
                                    <td>{row.b1DocId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="table-pagination" id="table-pagination">
                    <button className="page-btn" disabled>{'|<'}</button>
                    <button className="page-btn" disabled>{'<'}</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>{'>'}</button>
                    <button className="page-btn" onClick={() => setCurrentPage(totalPages)}>{'>|'}</button>
                </div>
            </div>
        </div>
    )
}

export default MonitoringPage
