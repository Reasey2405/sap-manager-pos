import React, { useState, useEffect, useCallback } from 'react'
import { fetchItemSales } from '../../service/api'
import { LoadingSpinner, EmptyState, fmtCurrency } from './SharedUI'

export default function ItemSalesReport({ filters }) {
  const [itemSales, setItemSales] = useState(null)
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
      // Note: backend for item-sales might not accept shift or status, 
      // but if it does, we can pass them. The original code removed them:
      // const { status, shift, ...itemParams } = params
      
      const data = await fetchItemSales(p)
      setItemSales(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch item sales')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !itemSales) return <LoadingSpinner />
  if (error) return <div className="reports-error">{error}</div>
  if (!itemSales?.length) return <EmptyState />

  const maxRevenue = itemSales[0]?.totalRevenue || 1

  return (
    <div className="reports-section-animate">
      <div className="reports-items-card">
        <div className="reports-items-header">
          <h3>Top Performing Items</h3>
          <span className="reports-items-sort-label">Sorted by Revenue (DESC)</span>
        </div>
        <div className="reports-items-list">
          {itemSales.map((item, index) => (
            <div key={`${item.itemCode}-${index}`} className="reports-item-row" id={`item-${item.itemCode}-${index}`}>
              <div className="reports-item-top">
                <div className="reports-item-left">
                  <span className="reports-item-rank">{index + 1}</span>
                  <div>
                    <span className="reports-item-name">{item.itemDescription}</span>
                    <span className="reports-item-code">{item.itemCode}</span>
                  </div>
                </div>
                <span className="reports-item-revenue">{fmtCurrency(item.totalRevenue)}</span>
              </div>
              <div className="reports-item-bar-track">
                <div
                  className="reports-item-bar-fill"
                  style={{ width: `${(item.totalRevenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
              <div className="reports-item-meta">
                <span>Qty: {item.totalQuantity} units</span>
                <span>Sold in {item.receiptCount} receipts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports-table-card" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="reports-table-card-header">
          <h3>Detailed Item Sales</h3>
        </div>
        <div className="reports-table-wrapper">
          <table className="reports-table" id="item-sales-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Code</th>
                <th>Description</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Revenue</th>
                <th className="text-center">Receipts</th>
              </tr>
            </thead>
            <tbody>
              {itemSales.map((item, i) => (
                <tr key={`${item.itemCode}-${i}`}>
                  <td className="text-center">{i + 1}</td>
                  <td className="reports-cell-mono">{item.itemCode}</td>
                  <td className="reports-cell-primary">{item.itemDescription}</td>
                  <td className="text-right">{item.totalQuantity.toLocaleString()}</td>
                  <td className="text-right font-bold">{fmtCurrency(item.totalRevenue)}</td>
                  <td className="text-center">{item.receiptCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
