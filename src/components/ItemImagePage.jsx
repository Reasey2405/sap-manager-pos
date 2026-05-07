import { useState, useEffect, useCallback, useRef } from 'react'
import {
    fetchItemsWithUom,
    fetchItemImageMeta,
    fetchItemImageBlob,
    uploadItemImage,
    deleteItemImage,
} from '../service/api'
import './ItemImagePage.css'

/* ── Icons ── */
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
)
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)
const UploadIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
)
const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
)
const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

/* ── UOM tab strip ── */
function UomTabs({ uoms, selected, onSelect }) {
    return (
        <div className="ii-uom-tabs">
            {uoms.map(u => (
                <button
                    key={u.uomEntry}
                    className={`ii-uom-tab${selected?.uomEntry === u.uomEntry ? ' active' : ''}`}
                    onClick={() => onSelect(u)}
                >
                    {u.uomCode}
                    {u.uomName && u.uomName !== u.uomCode && (
                        <span className="ii-uom-tab-name"> · {u.uomName}</span>
                    )}
                </button>
            ))}
        </div>
    )
}

/* ── Upload zone ── */
function UploadZone({ onFile, busy }) {
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef()

    const handle = (file) => {
        if (!file || !file.type.startsWith('image/')) return
        onFile(file)
    }

    return (
        <div
            className={`ii-upload-zone${dragging ? ' drag-over' : ''}`}
            onClick={() => !busy && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
        >
            <UploadIcon />
            <p className="ii-upload-hint">
                {busy ? 'Uploading…' : 'Drop an image here or click to browse'}
            </p>
            <span className="ii-upload-types">PNG, JPG, WEBP</span>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handle(e.target.files[0])}
            />
        </div>
    )
}

/* ── Right panel ── */
function ImagePanel({ item, uom, onUomChange }) {
    const [meta, setMeta]         = useState(null)   // null = no image
    const [imgUrl, setImgUrl]     = useState(null)
    const [loadingImg, setLoading] = useState(false)
    const [busy, setBusy]         = useState(false)
    const [msg, setMsg]           = useState('')

    /* Revoke previous blob URL on unmount / change */
    useEffect(() => {
        return () => { if (imgUrl) URL.revokeObjectURL(imgUrl) }
    }, [imgUrl])

    const loadImage = useCallback(async () => {
        if (!item || !uom) return
        setLoading(true)
        setMeta(null)
        setImgUrl(null)
        setMsg('')
        try {
            const m = await fetchItemImageMeta(item.itemCode, uom.uomEntry)
            setMeta(m)
            // null means no image exists yet — skip blob fetch, show upload zone
            if (m) {
                const blob = await fetchItemImageBlob(item.itemCode, uom.uomEntry)
                setImgUrl(URL.createObjectURL(blob))
            }
        } catch (e) {
            console.warn('loadImage:', e.message)
        } finally {
            setLoading(false)
        }
    }, [item, uom])

    useEffect(() => { loadImage() }, [loadImage])

    const handleUpload = async (file) => {
        setBusy(true)
        setMsg('')
        try {
            await uploadItemImage(item.itemCode, uom.uomEntry, file)
            setMsg('Image saved.')
            await loadImage()
        } catch (e) {
            setMsg('Error: ' + e.message)
        } finally {
            setBusy(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Remove this image?')) return
        setBusy(true)
        setMsg('')
        try {
            await deleteItemImage(item.itemCode, uom.uomEntry)
            setMeta(null)
            setImgUrl(null)
            setMsg('Image deleted.')
        } catch (e) {
            setMsg('Error: ' + e.message)
        } finally {
            setBusy(false)
        }
    }

    if (!item) return (
        <div className="ii-panel ii-panel-empty">
            <p>Select an item from the list</p>
        </div>
    )

    return (
        <div className="ii-panel">
            {/* Item header */}
            <div className="ii-panel-header">
                <div>
                    <span className="ii-panel-code">{item.itemCode}</span>
                    <h3 className="ii-panel-name">{item.itemName || '—'}</h3>
                </div>
            </div>

            {/* UOM tabs */}
            {item.uoms.length > 0 ? (
                <UomTabs uoms={item.uoms} selected={uom} onSelect={onUomChange} />
            ) : (
                <p className="ii-no-uom">No UOM group assigned to this item</p>
            )}

            {/* Image area */}
            {uom && (
                <div className="ii-image-area">
                    {loadingImg ? (
                        <div className="org-loading"><div className="org-spinner" /><span>Loading image…</span></div>
                    ) : imgUrl ? (
                        <>
                            <div className="ii-preview-wrap">
                                <img src={imgUrl} alt={`${item.itemCode} · ${uom.uomCode}`} className="ii-preview-img" />
                            </div>
                            <p className="ii-meta-info">
                                {meta?.fileName} &nbsp;·&nbsp; last updated {meta?.updatedAt ? new Date(meta.updatedAt).toLocaleDateString() : '—'}
                            </p>
                            <div className="ii-actions">
                                <label className={`toolbar-btn primary ii-replace-btn${busy ? ' disabled' : ''}`}>
                                    <UploadIcon style={{ width: 14, height: 14 }} /> Replace
                                    <input type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => handleUpload(e.target.files[0])} disabled={busy} />
                                </label>
                                <button className="ii-delete-btn" onClick={handleDelete} disabled={busy}>
                                    <TrashIcon /> Delete
                                </button>
                            </div>
                        </>
                    ) : (
                        <UploadZone onFile={handleUpload} busy={busy} />
                    )}

                    {msg && (
                        <div className={`ii-msg${msg.startsWith('Error') ? ' error' : ' success'}`}>{msg}</div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ── Main page ── */
export default function ItemImagePage({ onBack }) {
    const [items, setItems]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [search, setSearch]       = useState('')
    const [debouncedSearch, setDebounced] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedUom, setSelectedUom]   = useState(null)

    /* Debounce search input by 400 ms */
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400)
        return () => clearTimeout(t)
    }, [search])

    const loadItems = useCallback(async (q) => {
        setLoading(true)
        setError('')
        try {
            const data = await fetchItemsWithUom(q)
            setItems(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadItems(debouncedSearch) }, [loadItems, debouncedSearch])

    const handleSelectItem = (item) => {
        setSelectedItem(item)
        setSelectedUom(item.uoms[0] ?? null)
    }

    return (
        <div className="org-page">
            <div className="ii-page-wrap">

                {/* Back + title */}
                <div className="org-title-section">
                    <button className="back-button" onClick={onBack}>
                        <BackIcon /><span>Back to Dashboard</span>
                    </button>
                    <div className="ii-page-header">
                        <div>
                            <h2 className="org-page-title">Item Images</h2>
                            <p className="org-page-subtitle">Assign one image per item × UOM</p>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="cn-search-bar">
                    <div className="org-search-wrapper cn-search-expand">
                        <SearchIcon />
                        <input
                            type="text"
                            className="org-search-input"
                            placeholder="Search by item code or name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="toolbar-btn" onClick={() => loadItems(debouncedSearch)}>
                        <RefreshIcon /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="org-error-banner">
                        <span>⚠ {error}</span>
                        <button className="org-error-retry" onClick={() => loadItems(debouncedSearch)}>Retry</button>
                    </div>
                )}

                {/* Two-column body */}
                <div className="cn-body">

                    {/* Left — item list */}
                    <div className="cn-list-col">
                        {loading ? (
                            <div className="org-loading"><div className="org-spinner" /><span>Loading items…</span></div>
                        ) : items.length === 0 ? (
                            <div className="org-empty-state">
                                <p>{debouncedSearch ? `No items matching "${debouncedSearch}"` : 'No items found.'}</p>
                            </div>
                        ) : (
                            <div className="ii-item-list">
                                {items.map(item => (
                                    <div
                                        key={item.itemCode}
                                        className={`ii-item-card${selectedItem?.itemCode === item.itemCode ? ' selected' : ''}`}
                                        onClick={() => handleSelectItem(item)}
                                    >
                                        <span className="ii-item-code">{item.itemCode}</span>
                                        <span className="ii-item-name">{item.itemName || '—'}</span>
                                        <span className="ii-item-uom-count">{item.uoms.length} UOM{item.uoms.length !== 1 ? 's' : ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right — image panel */}
                    <div className="cn-panel-col">
                        <ImagePanel
                            item={selectedItem}
                            uom={selectedUom}
                            onUomChange={setSelectedUom}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
