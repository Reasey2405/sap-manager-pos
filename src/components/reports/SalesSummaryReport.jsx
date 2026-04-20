import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchSalesSummary } from '../../service/api'
import {
  LoadingSpinner,
  EmptyState,
  StatCard,
  BarChartIcon,
  ReceiptIcon,
  TrendUpIcon,
  FilterIcon,
  fmtCurrency
} from './SharedUI'

export default function SalesSummaryReport({ filters, groupByPosGroup }) {
  const [salesSummary, setSalesSummary] = useState(null)
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
      if (filters.shift) p.shift = filters.shift

      const data = await fetchSalesSummary(p)
      setSalesSummary(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch sales summary')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const displaySummary = useMemo(() => {
    if (!salesSummary?.length || !groupByPosGroup) return salesSummary
    const groups = {}
    for (const row of salesSummary) {
      const key = row.posGroupCode || row.posGroupName || 'Ungrouped'
      if (!groups[key]) {
        groups[key] = {
          posGroupCode: row.posGroupCode,
          posGroupName: row.posGroupName || key,
          posTerminal: null,
          shift: null,
          receiptCount: 0,
          totalBeforeDiscount: 0,
          totalDiscount: 0,
          totalAfterDiscount: 0,
          taxAmount: 0,
          totalAfterTax: 0,
          totalPayment: 0,
        }
      }
      const g = groups[key]
      g.receiptCount += row.receiptCount
      g.totalBeforeDiscount += row.totalBeforeDiscount
      g.totalDiscount += row.totalDiscount
      g.totalAfterDiscount += row.totalAfterDiscount
      g.taxAmount += row.taxAmount
      g.totalAfterTax += row.totalAfterTax
      g.totalPayment += row.totalPayment
    }
    return Object.values(groups)
  }, [salesSummary, groupByPosGroup])

  const summaryTotals = useMemo(() => {
    if (!displaySummary?.length) return null
    return {
      receipts: displaySummary.reduce((a, c) => a + c.receiptCount, 0),
      gross: displaySummary.reduce((a, c) => a + c.totalBeforeDiscount, 0),
      discount: displaySummary.reduce((a, c) => a + c.totalDiscount, 0),
      net: displaySummary.reduce((a, c) => a + c.totalAfterDiscount, 0),
      tax: displaySummary.reduce((a, c) => a + c.taxAmount, 0),
      total: displaySummary.reduce((a, c) => a + c.totalAfterTax, 0),
      payment: displaySummary.reduce((a, c) => a + c.totalPayment, 0),
    }
  }, [displaySummary])


  if (loading && !salesSummary) return <LoadingSpinner />
  if (error) return <div className="reports-error">{error}</div>
  if (!displaySummary?.length) return <EmptyState />

  const isGrouped = groupByPosGroup
  const footerColSpan = isGrouped ? 1 : 2

  return (
    <div className="reports-section-animate">
      <div className="reports-stat-grid">
        <StatCard
          title="Gross Sales"
          value={fmtCurrency(summaryTotals?.gross)}
          subtitle="Before discounts"
          icon={<BarChartIcon />}
          colorClass="stat-indigo"
        />
        <StatCard
          title="Total Receipts"
          value={summaryTotals?.receipts}
          subtitle="Across all terminals"
          icon={<ReceiptIcon />}
          colorClass="stat-blue"
        />
        <StatCard
          title="Tax Collected"
          value={fmtCurrency(summaryTotals?.tax)}
          subtitle="Total tax amount"
          icon={<TrendUpIcon />}
          colorClass="stat-emerald"
        />
        <StatCard
          title="Total Discounts"
          value={fmtCurrency(summaryTotals?.discount)}
          subtitle="Promotional usage"
          icon={<FilterIcon />}
          colorClass="stat-rose"
        />
      </div>

      <div className="reports-table-card">
        <div className="reports-table-card-header">
          <h3>{isGrouped ? 'POS Group Breakdown' : 'Terminal & Shift Breakdown'}</h3>
        </div>
        <div className="reports-table-wrapper">
          <table className="reports-table" id="sales-summary-table">
            <thead>
              <tr>
                {isGrouped
                  ? <th>POS Group</th>
                  : <>
                      <th>Terminal</th>
                      <th>Shift</th>
                    </>
                }
                <th className="text-center">Receipts</th>
                <th className="text-right">Gross Sales</th>
                <th className="text-right">Discounts</th>
                <th className="text-right">Net Sales</th>
                <th className="text-right">Tax</th>
                <th className="text-right">Total</th>
                <th className="text-right">Payment</th>
              </tr>
            </thead>
            <tbody>
              {displaySummary.map((row, i) => (
                <tr key={i}>
                  {isGrouped
                    ? <td><span className="reports-cell-group">{row.posGroupName || '-'}</span></td>
                    : <>
                        <td className="reports-cell-primary">{row.posTerminal}</td>
                        <td>{row.shift || '-'}</td>
                      </>
                  }
                  <td className="text-center">{row.receiptCount}</td>
                  <td className="text-right">{fmtCurrency(row.totalBeforeDiscount)}</td>
                  <td className="text-right reports-cell-discount">{row.totalDiscount > 0 ? `-${fmtCurrency(row.totalDiscount)}` : fmtCurrency(row.totalDiscount)}</td>
                  <td className="text-right">{fmtCurrency(row.totalAfterDiscount)}</td>
                  <td className="text-right">{fmtCurrency(row.taxAmount)}</td>
                  <td className="text-right font-bold">{fmtCurrency(row.totalAfterTax)}</td>
                  <td className="text-right">{fmtCurrency(row.totalPayment)}</td>
                </tr>
              ))}
            </tbody>
            {displaySummary.length > 1 && (
              <tfoot>
                <tr className="reports-table-footer-row">
                  <td colSpan={footerColSpan} className="font-bold">Totals</td>
                  <td className="text-center font-bold">{summaryTotals?.receipts}</td>
                  <td className="text-right font-bold">{fmtCurrency(summaryTotals?.gross)}</td>
                  <td className="text-right font-bold reports-cell-discount">{summaryTotals?.discount > 0 ? `-${fmtCurrency(summaryTotals?.discount)}` : fmtCurrency(summaryTotals?.discount)}</td>
                  <td className="text-right font-bold">{fmtCurrency(summaryTotals?.net)}</td>
                  <td className="text-right font-bold">{fmtCurrency(summaryTotals?.tax)}</td>
                  <td className="text-right font-bold">{fmtCurrency(summaryTotals?.total)}</td>
                  <td className="text-right font-bold">{fmtCurrency(summaryTotals?.payment)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
