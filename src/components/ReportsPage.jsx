import React, { useState, useEffect } from 'react'
import './ReportsPage.css'
import {
  BackIcon,
  ReceiptIcon,
  BarChartIcon,
  PackageIcon,
  CreditCardIcon,
  FilterIcon,
  SearchIcon,
  LayersIcon,
  nowISO,
  monthAgoISO
} from './reports/SharedUI'

import ReceiptsReport from './reports/ReceiptsReport'
import SalesSummaryReport from './reports/SalesSummaryReport'
import ItemSalesReport from './reports/ItemSalesReport'
import PaymentSummaryReport from './reports/PaymentSummaryReport'

export default function ReportsPage({ onBack }) {
  // Tabs: receipts, summary, items, payments
  const [activeTab, setActiveTab] = useState('summary')

  // Global filters
  const [filters, setFilters] = useState({
    posTerminal: '',
    from: monthAgoISO(),
    to: nowISO(),
    shift: '',
    status: ''
  })

  // We keep a temporary "draft" state for the inputs so it doesn't refetch on every keystroke
  const [draftFilters, setDraftFilters] = useState(filters)

  // Toggle for group by POS group (only applies to Sales Summary)
  const [groupByPosGroup, setGroupByPosGroup] = useState(false)

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setDraftFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    setFilters(draftFilters)
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <header className="reports-header bg-card border-b border-border p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          id="btn-back"
        >
          <BackIcon />
          <span>Back to Dashboard</span>
        </button>
        {/* Can put a right-side control here if needed */}
      </header>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`reports-tab ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
          id="tab-receipts"
        >
          <ReceiptIcon /> Receipts
        </button>
        <button
          className={`reports-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          id="tab-summary"
        >
          <BarChartIcon /> Sales Summary
        </button>
        <button
          className={`reports-tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
          id="tab-items"
        >
          <PackageIcon /> Item Sales
        </button>
        <button
          className={`reports-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
          id="tab-payments"
        >
          <CreditCardIcon /> Payment Summary
        </button>
      </div>

      <div className="reports-content">
        <div className="reports-content-header">
          <div>
            <h1 className="reports-title">Reports Engine</h1>
            <p className="reports-subtitle">Visualize your retail performance and financial data.</p>
          </div>
        </div>

        {/* Global Filters */}
        <div className="reports-filters bg-card border border-border/50 shadow-sm rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div className="reports-filter-group">
            <label className="reports-filter-label">
              <FilterIcon /> Terminal
            </label>
            <select
              name="posTerminal"
              value={draftFilters.posTerminal}
              onChange={handleFilterChange}
              className="reports-select"
              id="filter-terminal"
            >
              <option value="">All Terminals</option>
              <option value="POS-001">POS-001</option>
              <option value="POS-002">POS-002</option>
              <option value="POS1">POS1</option>
            </select>
          </div>

          <div className="reports-filter-group">
            <label className="reports-filter-label">
              <FilterIcon /> Date Range
            </label>
            <div className="reports-date-range">
              <input
                type="date"
                name="from"
                value={draftFilters.from}
                onChange={handleFilterChange}
                className="reports-input"
                id="filter-date-from"
              />
              <span className="reports-date-separator">to</span>
              <input
                type="date"
                name="to"
                value={draftFilters.to}
                onChange={handleFilterChange}
                className="reports-input"
                id="filter-date-to"
              />
            </div>
          </div>

          {(activeTab === 'receipts' || activeTab === 'summary') && (
            <div className="reports-filter-group">
              <label className="reports-filter-label">
                <FilterIcon /> Shift
              </label>
              <select
                name="shift"
                value={draftFilters.shift}
                onChange={handleFilterChange}
                className="reports-select"
                id="filter-shift"
              >
                <option value="">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="reports-filter-group">
              <label className="reports-filter-label">
                <LayersIcon /> Group By
              </label>
              <button
                className={`reports-toggle-btn ${groupByPosGroup ? 'active' : ''}`}
                onClick={() => setGroupByPosGroup(prev => !prev)}
                id="toggle-group-pos"
              >
                <span className="reports-toggle-track">
                  <span className="reports-toggle-knob"></span>
                </span>
                <span>POS Group</span>
              </button>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className="reports-filter-group">
              <label className="reports-filter-label">
                <FilterIcon /> Status
              </label>
              <select
                name="status"
                value={draftFilters.status}
                onChange={handleFilterChange}
                className="reports-select"
                id="filter-status"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Close">Close</option>
                <option value="Park">Park</option>
                <option value="Void">Void</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>
          )}

          <div className="reports-filter-actions">
            <button className="reports-search-btn" onClick={handleSearch} id="btn-search">
              <SearchIcon />
            </button>
            <button className="reports-refresh-btn flex items-center justify-center p-2 rounded-lg border border-border text-muted-foreground hover:bg-accent/10 hover:text-accent hover:border-accent transition-colors" onClick={() => setFilters({ ...draftFilters })} id="btn-refresh" title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'receipts' && <ReceiptsReport filters={filters} />}
        {activeTab === 'summary' && <SalesSummaryReport filters={filters} groupByPosGroup={groupByPosGroup} />}
        {activeTab === 'items' && <ItemSalesReport filters={filters} />}
        {activeTab === 'payments' && <PaymentSummaryReport filters={filters} />}

      </div>
    </div>
  )
}
