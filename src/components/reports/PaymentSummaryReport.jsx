import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchPaymentSummary } from '../../service/api'
import { LoadingSpinner, EmptyState, fmtCurrency } from './SharedUI'

export default function PaymentSummaryReport({ filters }) {
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = {}
      if (filters.posTerminal) p.posTerminal = filters.posTerminal
      if (filters.from) p.from = filters.from + 'T00:00:00'
      if (filters.to) p.to = filters.to + 'T23:59:59'
      // Original code removed status and shift for payments:
      // const { status, shift, ...payParams } = params
      
      const data = await fetchPaymentSummary(p)
      setPaymentSummary(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch payment summary')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const paymentTotals = useMemo(() => {
    if (!paymentSummary?.length) return null
    return {
      totalLocal: paymentSummary.reduce((a, c) => a + c.totalAmountInLocalCurrency, 0),
      totalTx: paymentSummary.reduce((a, c) => a + c.transactionCount, 0),
      maxLocal: Math.max(...paymentSummary.map(p => p.totalAmountInLocalCurrency)),
    }
  }, [paymentSummary])

  if (loading && !paymentSummary) return <LoadingSpinner />
  if (error) return <div className="reports-error">{error}</div>
  if (!paymentSummary?.length) return <EmptyState />

  return (
    <div className="reports-section-animate">
      <div className="reports-payment-grid">
        <div className="reports-table-card">
          <div className="reports-table-card-header">
            <h3>Payment Methods Breakdown</h3>
          </div>
          <div className="reports-table-wrapper">
            <table className="reports-table" id="payment-summary-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Currency</th>
                  <th className="text-center">Transactions</th>
                  <th className="text-right">Amount (Original)</th>
                  <th className="text-right">Amount (Local)</th>
                </tr>
              </thead>
              <tbody>
                {paymentSummary.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="reports-payment-method">
                        <span className="reports-payment-type">{p.paymentType}</span>
                        {p.account && <span className="reports-payment-account">{p.account}</span>}
                      </div>
                    </td>
                    <td className="reports-cell-mono">{p.currencyCode}</td>
                    <td className="text-center">{p.transactionCount}</td>
                    <td className="text-right">
                      {p.totalAmount.toLocaleString()} {p.currencyCode}
                    </td>
                    <td className="text-right font-bold">{fmtCurrency(p.totalAmountInLocalCurrency)}</td>
                  </tr>
                ))}
              </tbody>
              {paymentSummary.length > 1 && (
                <tfoot>
                  <tr className="reports-table-footer-row">
                    <td colSpan={2} className="font-bold">Totals</td>
                    <td className="text-center font-bold">{paymentTotals?.totalTx}</td>
                    <td></td>
                    <td className="text-right font-bold">{fmtCurrency(paymentTotals?.totalLocal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="reports-payment-visual-card">
          <h3>Collection by Method</h3>
          <p className="reports-payment-visual-sub">Converted to Local Currency (USD)</p>
          <div className="reports-payment-bars">
            {paymentSummary
              .sort((a, b) => b.totalAmountInLocalCurrency - a.totalAmountInLocalCurrency)
              .map((p, i) => {
                const isCash = p.paymentType.toLowerCase().includes('cash')
                const isCard = p.paymentType.toLowerCase().includes('card')
                const barColor = isCash ? 'bar-emerald' : isCard ? 'bar-indigo' : 'bar-blue'
                const pct = paymentTotals.maxLocal > 0 ? (p.totalAmountInLocalCurrency / paymentTotals.maxLocal) * 100 : 0
                return (
                  <div key={i} className="reports-payment-bar-row">
                    <div className={`reports-payment-bar-icon ${barColor}`}>
                      {isCash ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                      ) : isCard ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                      )}
                    </div>
                    <div className="reports-payment-bar-body">
                      <div className="reports-payment-bar-top">
                        <span className="reports-payment-bar-label">
                          {p.paymentType} {p.account ? `(${p.account})` : ''}
                        </span>
                        <div>
                          <span className="reports-payment-bar-amount">{fmtCurrency(p.totalAmountInLocalCurrency)}</span>
                        </div>
                      </div>
                      <div className="reports-payment-bar-track">
                        <div className={`reports-payment-bar-fill ${barColor}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
          <div className="reports-payment-total">
            <span>Total Collected</span>
            <span>{fmtCurrency(paymentTotals?.totalLocal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
