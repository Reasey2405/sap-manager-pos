import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function MultiSelectPopup({ options, value, onChange, placeholder = 'Select...', formatTriggerLabel }) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState([])

    const handleOpen = () => {
        setDraft(value)
        setOpen(true)
    }

    const allSelected = options.length > 0 && draft.length === options.length
    const someSelected = draft.length > 0 && draft.length < options.length

    const toggleAll = () => setDraft(allSelected ? [] : options.map(o => o.value))
    const toggle = (v) => setDraft(d => d.includes(v) ? d.filter(x => x !== v) : [...d, v])

    const handleOk = () => {
        onChange(draft)
        setOpen(false)
    }
    const handleCancel = () => setOpen(false)

    const triggerLabel = formatTriggerLabel
        ? formatTriggerLabel(value, options)
        : value.length === 0
        ? placeholder
        : value.length === options.length
            ? 'All selected'
            : `${value.length} of ${options.length} selected`

    return (
        <>
            <button
                type="button"
                className={`disc-ms-trigger ${value.length > 0 ? 'has-value' : ''}`}
                onClick={handleOpen}
            >
                <span className="disc-ms-trigger-label">{triggerLabel}</span>
                <span className="disc-ms-trigger-arrow">›</span>
            </button>

            {open && createPortal(
                <div className="disc-ms-overlay" onClick={handleCancel}>
                    <div className="disc-ms-popup" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="disc-ms-popup-header">
                            <span className="disc-ms-popup-title">{placeholder}</span>
                            <span className="disc-ms-popup-count">{draft.length} selected</span>
                        </div>

                        {/* Select All */}
                        <div className="disc-ms-popup-selectall">
                            <label className={`disc-ms-row ${allSelected ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={el => { if (el) el.indeterminate = someSelected }}
                                    onChange={toggleAll}
                                />
                                <span className="disc-ms-row-label">Select All</span>
                                <span className="disc-ms-row-sub">{options.length} items</span>
                            </label>
                        </div>

                        <div className="disc-ms-popup-divider" />

                        {/* List */}
                        <div className="disc-ms-popup-list">
                            {options.length === 0 && (
                                <p className="disc-ms-popup-empty">No options available</p>
                            )}
                            {options.map(opt => (
                                <label
                                    key={opt.value}
                                    className={`disc-ms-row ${draft.includes(opt.value) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={draft.includes(opt.value)}
                                        onChange={() => toggle(opt.value)}
                                    />
                                    <span className="disc-ms-row-label">{opt.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="disc-ms-popup-divider" />

                        {/* Footer */}
                        <div className="disc-ms-popup-footer">
                            <button type="button" className="toolbar-btn" onClick={handleCancel}>Cancel</button>
                            <button type="button" className="toolbar-btn primary" onClick={handleOk}>
                                OK {draft.length > 0 && `(${draft.length})`}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
