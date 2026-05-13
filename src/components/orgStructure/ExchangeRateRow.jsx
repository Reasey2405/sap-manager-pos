import { TrashIcon } from './icons'

/* ===== Exchange Rate Row ===== */
function ExchangeRateRow({ rate, index, currencies, onChange, onRemove }) {
    return (
        <div className="org-exchange-rate-row">
            <select
                className="org-form-select"
                value={rate.currency}
                onChange={(e) => onChange(index, 'currency', e.target.value)}
            >
                <option value="">Select currency</option>
                {currencies.map(c => (
                    <option key={c.currCode} value={c.currCode}>{c.currCode} - {c.currName}</option>
                ))}
            </select>
            <input
                type="number"
                className="org-form-input"
                placeholder="Rate"
                step="any"
                value={rate.fallBackExchangeRate}
                onChange={(e) => onChange(index, 'fallBackExchangeRate', parseFloat(e.target.value) || 0)}
            />
            <button className="org-exchange-remove-btn" onClick={() => onRemove(index)} title="Remove">
                <TrashIcon />
            </button>
        </div>
    )
}

export default ExchangeRateRow
