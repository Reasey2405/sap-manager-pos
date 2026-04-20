import React, { useState, useEffect, useCallback } from 'react'
import { fetchReceipts } from '../../service/api'
import {
  LoadingSpinner,
  EmptyState,
  StatusBadge,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TerminalIcon,
  ClockIcon,
  fmtCurrency,
  fmtDate,
  fmtTime
} from './SharedUI'

export default function ReceiptsReport({ filters }) {
  const [receipts, setReceipts] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [sortField] = useState('receiptDate')
  const [sortDir] = useState('desc')

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [filters])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = {}
      if (filters.posTerminal) p.posTerminal = filters.posTerminal
      if (filters.from) p.from = filters.from + 'T00:00:00'
      if (filters.to) p.to = filters.to + 'T23:59:59'
      if (filters.shift) p.shift = filters.shift
      if (filters.status) p.status = filters.status

      const data = await fetchReceipts({ ...p, page, size: pageSize, sort: `${sortField},${sortDir}` })
      setReceipts(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch receipts')
    } finally {
      setLoading(false)
    }
  }, [filters, page, pageSize, sortField, sortDir])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportReceiptsCSV = () => {
    if (!receipts?.content?.length) return
    const headers = ['Receipt No', 'Terminal', 'Date', 'Customer', 'Shift', 'Status', 'Before Discount', 'Discount', 'After Discount', 'Tax', 'After Tax', 'Payment']
    const rows = receipts.content.map(r => [
      r.receiptNumber, r.posTerminal, r.receiptDate, r.cardName, r.shift, r.documentStatus,
      r.totalBeforeDiscount, r.totalDiscount, r.totalAfterDiscount, r.taxAmount, r.totalAfterTax, r.totalPayment
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipts_${filters.from}_${filters.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading && !receipts) return <LoadingSpinner />
  if (error) return <div className="reports-error">{error}</div>
  if (!receipts?.content?.length) return <EmptyState />

  return (
    <div className="reports-section-animate">
      <div className="reports-section-header">
        <h2 className="reports-section-title">Receipts Report</h2>
        <button className="reports-export-btn" onClick={exportReceiptsCSV} id="btn-export-csv">
          <DownloadIcon /> Export CSV
        </button>
      </div>

      <div className="reports-table-wrapper">
        <table className="reports-table" id="receipts-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Date / Time</th>
              <th>Customer</th>
              <th>Terminal / Shift</th>
              <th>Status</th>
              <th className="text-right">Before Disc.</th>
              <th className="text-right">Discount</th>
              <th className="text-right">Tax</th>
              <th className="text-right">Total</th>
              <th className="text-right">Payment</th>
            </tr>
          </thead>
          <tbody>
            {receipts.content.map((r) => (
              <tr key={r.receiptNumber} id={`receipt-${r.receiptNumber}`}>
                <td className="reports-cell-primary">{r.receiptNumber}</td>
                <td>
                  <span className="reports-cell-date">{fmtDate(r.receiptDate)}</span>
                  <span className="reports-cell-time">{fmtTime(r.receiptDate)}</span>
                </td>
                <td>{r.cardName || '-'}</td>
                <td>
                  <span className="reports-cell-terminal"><TerminalIcon /> {r.posTerminal}</span>
                  <span className="reports-cell-shift"><ClockIcon /> {r.shift}</span>
                </td>
                <td><StatusBadge status={r.documentStatus} /></td>
                <td className="text-right">{fmtCurrency(r.totalBeforeDiscount)}</td>
                <td className="text-right reports-cell-discount">{r.totalDiscount > 0 ? `-${fmtCurrency(r.totalDiscount)}` : fmtCurrency(r.totalDiscount)}</td>
                <td className="text-right">{fmtCurrency(r.taxAmount)}</td>
                <td className="text-right font-bold">{fmtCurrency(r.totalAfterTax)}</td>
                <td className="text-right">{fmtCurrency(r.totalPayment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <div className="reports-loading-mini">Updating...</div>}

      <div className="reports-pagination" id="receipts-pagination">
        <p className="reports-pagination-info">
          Showing {receipts.content.length} of {receipts.totalElements} entries
          {receipts.totalPages > 1 && ` — Page ${receipts.number + 1} of ${receipts.totalPages}`}
        </p>
        <div className="reports-pagination-btns">
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(0)} title="First">{'|<'}</button>
          <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} title="Previous">
            <ChevronLeftIcon />
          </button>
          {Array.from({ length: Math.min(5, receipts.totalPages || 1) }, (_, i) => {
            const start = Math.max(0, Math.min(page - 2, (receipts.totalPages || 1) - 5))
            const pageNum = start + i
            if (pageNum >= (receipts.totalPages || 1)) return null
            return (
              <button
                key={pageNum}
                className={`page-btn ${pageNum === page ? 'active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum + 1}
              </button>
            )
          })}
          <button className="page-btn" disabled={page >= (receipts.totalPages || 1) - 1} onClick={() => setPage(p => p + 1)} title="Next">
            <ChevronRightIcon />
          </button>
          <button className="page-btn" disabled={page >= (receipts.totalPages || 1) - 1} onClick={() => setPage((receipts.totalPages || 1) - 1)} title="Last">{'>|'}</button>
        </div>
      </div>
    </div>
  )
}
