import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

/* ═══════════════════════════════════════════════════
   Lookup Picker
   ═══════════════════════════════════════════════════
   Opens a modal listing rows fetched from an API,
   with a free-text filter and multi-select rows.
     • Click row toggles a single code.
     • Shift+Click extends from the last clicked row.
     • Header checkbox selects every UNCHECKED filtered
       row; once everything filtered is selected, the
       same control deselects them.
   On Apply, joins the selected codes with commas and
   writes them back via onChange. The free-text input
   next to this trigger stays editable so users can
   still type / paste values manually.
*/
export default function LookupPicker({
    value,
    onChange,
    title = 'Pick',
    loader,
    columns,
    placeholder = 'Select',
    disabled = false,
    singleSelect = false,
}) {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [search, setSearch] = useState('')
    const [draft, setDraft] = useState([])
    const [lastIdx, setLastIdx] = useState(null)

    const codeKey = columns[0].key

    // When the condition type changes the parent swaps in a different loader/columns.
    // Clear cached rows so the next open re-fetches the right dataset.
    useEffect(() => {
        setRows([])
        setLoaded(false)
        setErr('')
    }, [loader, columns])

    const selectedCodes = useMemo(() => {
        const raw = String(value || '').trim()
        if (!raw) return []
        if (singleSelect) return [raw]
        return raw.split(',').map(s => s.trim()).filter(Boolean)
    }, [value, singleSelect])

    const openPicker = async () => {
        setDraft(selectedCodes)
        setSearch('')
        setLastIdx(null)
        setOpen(true)
        if (!loaded) {
            setLoading(true); setErr('')
            try {
                const data = await loader()
                setRows(Array.isArray(data) ? data : [])
                setLoaded(true)
            } catch (e) {
                setErr(e?.message || 'Failed to load')
            } finally {
                setLoading(false)
            }
        }
    }

    // Reset shift-anchor when filter changes — indexes would otherwise be stale.
    useEffect(() => { setLastIdx(null) }, [search])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return rows
        return rows.filter(r =>
            columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q))
        )
    }, [rows, search, columns])

    const filteredCodes = useMemo(
        () => filtered.map(r => String(r[codeKey] ?? '')),
        [filtered, codeKey]
    )

    const draftSet = useMemo(() => new Set(draft), [draft])
    const filteredUnchecked = filteredCodes.filter(c => !draftSet.has(c))
    const allFilteredChecked = filteredCodes.length > 0 && filteredUnchecked.length === 0
    const someFilteredChecked = !allFilteredChecked && filteredCodes.some(c => draftSet.has(c))

    const toggle = code => {
        const c = String(code)
        if (singleSelect) {
            setDraft(d => (d[0] === c ? [] : [c]))
            return
        }
        setDraft(d => d.includes(c) ? d.filter(x => x !== c) : [...d, c])
    }

    const addRange = (start, end) => {
        const s = Math.min(start, end)
        const e = Math.max(start, end)
        const slice = filteredCodes.slice(s, e + 1)
        setDraft(d => {
            const set = new Set(d)
            slice.forEach(c => set.add(c))
            return Array.from(set)
        })
    }

    const handleRowClick = (e, code, idx) => {
        if (!singleSelect && e.shiftKey && lastIdx !== null) {
            addRange(lastIdx, idx)
        } else {
            toggle(code)
        }
        setLastIdx(idx)
    }

    const toggleFilteredAll = () => {
        if (allFilteredChecked) {
            // Deselect everything filtered
            const removeSet = new Set(filteredCodes)
            setDraft(d => d.filter(c => !removeSet.has(c)))
        } else {
            // Add only the unchecked filtered codes
            setDraft(d => {
                const set = new Set(d)
                filteredUnchecked.forEach(c => set.add(c))
                return Array.from(set)
            })
        }
    }

    const apply = () => {
        onChange(draft.join(','))
        setOpen(false)
    }

    return (
        <>
            <button
                type="button"
                className="toolbar-btn tiny"
                onClick={openPicker}
                disabled={disabled}
                title={title}
            >
                ⋯
            </button>

            {open && createPortal(
                <div className="disc-ms-overlay">
                    <div className="disc-lookup-popup" onClick={e => e.stopPropagation()}>
                        <div className="disc-ms-popup-header">
                            <span className="disc-ms-popup-title">{placeholder}</span>
                            <span className="disc-ms-popup-count">{draft.length} selected</span>
                        </div>

                        <div className="disc-lookup-search">
                            <input
                                type="text"
                                className="org-form-input small"
                                placeholder="Filter by code or name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="disc-ms-popup-divider" />

                        <div className="disc-lookup-list">
                            {loading && <p className="disc-ms-popup-empty">Loading...</p>}
                            {err && <p className="disc-ms-popup-empty" style={{ color: '#f87171' }}>{err}</p>}
                            {!loading && !err && (
                                <table className="disc-lookup-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 28 }}>
                                                {!singleSelect && (
                                                    <input
                                                        type="checkbox"
                                                        checked={allFilteredChecked}
                                                        ref={el => { if (el) el.indeterminate = someFilteredChecked }}
                                                        onChange={toggleFilteredAll}
                                                        disabled={filteredCodes.length === 0}
                                                        title={allFilteredChecked ? 'Deselect all filtered' : 'Select all unchecked in filter'}
                                                    />
                                                )}
                                            </th>
                                            {columns.map(c => <th key={c.key}>{c.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="disc-lookup-empty">
                                                    No results
                                                </td>
                                            </tr>
                                        )}
                                        {filtered.map((row, idx) => {
                                            const code = String(row[codeKey] ?? '')
                                            const checked = draftSet.has(code)
                                            return (
                                                <tr
                                                    key={code}
                                                    className={checked ? 'selected' : ''}
                                                    onClick={e => handleRowClick(e, code, idx)}
                                                >
                                                    <td onClick={e => e.stopPropagation()}>
                                                        <input
                                                            type={singleSelect ? 'radio' : 'checkbox'}
                                                            checked={checked}
                                                            onChange={() => toggle(code)}
                                                            onClick={e => {
                                                                if (!singleSelect && e.shiftKey && lastIdx !== null) {
                                                                    e.preventDefault()
                                                                    addRange(lastIdx, idx)
                                                                }
                                                                setLastIdx(idx)
                                                            }}
                                                        />
                                                    </td>
                                                    {columns.map(c => (
                                                        <td key={c.key}>
                                                            {c.render ? c.render(row) : (row[c.key] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="disc-ms-popup-divider" />

                        <div className="disc-ms-popup-footer">
                            <button type="button" className="toolbar-btn" onClick={() => setOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="toolbar-btn primary" onClick={apply}>
                                Apply {draft.length > 0 && `(${draft.length})`}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
