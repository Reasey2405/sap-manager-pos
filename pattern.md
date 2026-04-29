# UI Implementation Pattern — sap-manager-pos

## Stack
- React 19 (JSX, no TypeScript)
- Vite
- Native `fetch` via custom `fetchWithAuth` wrapper
- CSS custom properties for theming (dark/light)
- No external state management (useState/useCallback only)

---

## 1. Register a New Page

### sections.js
```js
{ title: 'Your Title', icon: SomeIcon, isImplemented: true }
```

### App.jsx — import
```js
import YourPage from './components/YourPage'
import './components/YourPage.css'
```

### App.jsx — handleCardClick
```js
} else if (cardTitle === 'Your Title') {
  navigateToPage('your-page')
}
```

### App.jsx — route render (before the `return` dashboard block)
```jsx
if (currentPage === 'your-page') {
  return (
    <div className="app">
      <Navbar
        sections={sections}
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <YourPage onBack={() => navigateToPage('dashboard')} />
      {sessionExpiredOverlay}
    </div>
  )
}
```

---

## 2. Page Component File Structure

```
src/components/YourPage.jsx   ← component
src/components/YourPage.css   ← styles
```

### YourPage.jsx skeleton
```jsx
import { useState, useEffect, useCallback } from 'react'
import { API_BASE, fetchJSON, postJSON, putJSON, deleteJSON } from '../service/api'

/* ===== Icons ===== */
// Inline SVG only — no icon libraries
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
// Add SearchIcon, PlusIcon, CloseIcon, RefreshIcon, SaveIcon, TrashIcon as needed

/* ===== Sub-components ===== */
// Keep all sub-components in the same file

/* ===== Loading Spinner ===== */
function LoadingSpinner({ text }) {
  return (
    <div className="org-loading">
      <div className="org-spinner"/>
      <span>{text || 'Loading...'}</span>
    </div>
  )
}

/* ===== Main Page ===== */
function YourPage({ onBack }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState(null)   // for side panel
  const [showModal, setShowModal] = useState(false) // for modal

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchJSON(`${API_BASE}/api/your/endpoint`)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async (payload) => {
    await postJSON(`${API_BASE}/api/your/endpoint`, payload)
    await loadData()
  }

  const handleUpdate = async (id, payload) => {
    await putJSON(`${API_BASE}/api/your/endpoint/${id}`, payload)
    await loadData()
  }

  const handleDelete = async (id) => {
    await deleteJSON(`${API_BASE}/api/your/endpoint/${id}`)
    await loadData()
    setSelected(null)
  }

  const query = searchQuery.toLowerCase()
  const filtered = items.filter(i =>
    (i.name || '').toLowerCase().includes(query)
  )

  const panelOpen = selected !== null

  return (
    <div className={`org-page ${panelOpen ? 'panel-open' : ''}`}>
      <div className="org-content">
        <div className={`org-main ${panelOpen ? 'with-panel' : ''}`}>

          {/* Back + Title */}
          <div className="org-title-section">
            <button className="back-button" onClick={onBack}>
              <BackIcon/><span>Back to Dashboard</span>
            </button>
            <h2 className="org-page-title">Page Title</h2>
            <p className="org-page-subtitle">Subtitle description</p>
          </div>

          {/* Toolbar */}
          <div className="org-toolbar">
            <div className="org-search-wrapper">
              <SearchIcon/>
              <input type="text" className="org-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}/>
            </div>
            <div className="org-toolbar-actions">
              <button className="toolbar-btn" onClick={loadData}><RefreshIcon/> Refresh</button>
              <button className="toolbar-btn primary" onClick={() => setShowModal(true)}>
                <PlusIcon/> Add Item
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="org-error-banner">
              <span>⚠ {error}</span>
              <button className="org-error-retry" onClick={loadData}>Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading && <LoadingSpinner text="Loading..."/>}

          {/* Content */}
          {!loading && (
            <div className="your-grid">
              {filtered.length > 0 ? filtered.map(item => (
                <YourCard
                  key={item.id}
                  item={item}
                  isSelected={selected?.id === item.id}
                  onSelect={setSelected}
                />
              )) : (
                <div className="org-empty-state">
                  <p>{searchQuery ? `No results for "${searchQuery}"` : 'No items found.'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel */}
        {panelOpen && (
          <YourDetailPanel
            item={selected}
            onClose={() => setSelected(null)}
            onUpdate={loadData}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <YourModal
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default YourPage
```

---

## 3. API Service (`src/service/api.js`)

```js
import { API_BASE, fetchJSON, postJSON, putJSON, deleteJSON, patchJSON } from '../service/api'
```

| Function | HTTP | Usage |
|---|---|---|
| `fetchJSON(url)` | GET | Read data |
| `postJSON(url, body)` | POST | Create |
| `putJSON(url, body)` | PUT | Full update |
| `patchJSON(url, body)` | PATCH | Partial update |
| `deleteJSON(url)` | DELETE | Delete |

- `API_BASE` = `''` in prod, `'http://localhost:9988'` in dev
- All functions auto-refresh token on 401 and retry once
- All throw `Error` with a message on non-ok status

### Parallel fetch
```js
const [data1, data2] = await Promise.all([
  fetchJSON(`${API_BASE}/api/endpoint1`),
  fetchJSON(`${API_BASE}/api/endpoint2`),
])
```

---

## 4. Shared CSS Classes (already global)

These come from `OrgStructurePage.css` and are imported globally in `App.jsx`:

### Layout
| Class | Purpose |
|---|---|
| `.org-page` | Full page wrapper (`display:flex flex-direction:column`) |
| `.org-page.panel-open` | Page with side panel open |
| `.org-content` | Content area (`display:flex gap`) |
| `.org-main` | Main scrollable column |
| `.org-main.with-panel` | Shrinks main when panel is open |
| `.org-settings-panel` | Side detail panel shell |

### Title section
| Class | Purpose |
|---|---|
| `.org-title-section` | Back button + title area |
| `.org-page-title` | `<h2>` page title |
| `.org-page-subtitle` | Subtitle paragraph |
| `.back-button` | Back navigation button |

### Toolbar
| Class | Purpose |
|---|---|
| `.org-toolbar` | Flex row with search + actions |
| `.org-search-wrapper` | Search icon + input wrapper |
| `.org-search-input` | Search text input |
| `.org-toolbar-actions` | Right-side button group |
| `.toolbar-btn` | Secondary action button |
| `.toolbar-btn.primary` | Primary action button (accent color) |

### States
| Class | Purpose |
|---|---|
| `.org-loading` | Spinner + text wrapper |
| `.org-spinner` | CSS spinner animation |
| `.org-error-banner` | Error bar with retry button |
| `.org-error-retry` | Retry button inside error banner |
| `.org-empty-state` | Empty list placeholder |

### Form (used in modals/panels)
| Class | Purpose |
|---|---|
| `.org-modal-overlay` | Full-screen modal backdrop |
| `.org-modal` | Modal card |
| `.org-modal-header` | Modal title row |
| `.org-modal-title` | Modal `<h3>` |
| `.org-modal-body` | Modal content / form |
| `.org-modal-actions` | Cancel + Submit button row |
| `.org-form-field` | Label + input wrapper |
| `.org-form-label` | Form label |
| `.org-form-input` | Text input |
| `.org-form-required` | Red `*` span |
| `.org-form-error` | Inline error message |
| `.org-form-grid` | 2-column form grid |

### Panel internals
| Class | Purpose |
|---|---|
| `.org-settings-panel-header` | Panel title row |
| `.org-settings-panel-title` | Panel `<h3>` |
| `.org-settings-close-btn` | Panel close `×` button |
| `.org-settings-edit-btn` | Edit icon button |
| `.org-settings-save-btn` | Save icon button |
| `.org-settings-cancel-btn` | Cancel icon button |
| `.org-settings-info-grid` | 2-col info display grid |
| `.org-settings-info-item` | Label + value pair |
| `.org-settings-info-label` | Small muted label |
| `.org-settings-info-value` | Value text |
| `.org-settings-section-title` | Section `<h4>` inside panel |
| `.org-settings-divider` | Horizontal rule |
| `.org-settings-list` | Stacked key-value rows |
| `.org-setting-row` | Single key-value row |
| `.org-setting-label` | Row label |
| `.org-setting-value` | Row value |
| `.org-save-msg` | Save feedback message |
| `.org-save-msg.success` | Green success |
| `.org-save-msg.error` | Red error |

### Stats bar
| Class | Purpose |
|---|---|
| `.org-summary-stats` | Stats card row |
| `.org-stat-card` | Individual stat card |
| `.org-stat-number` | Large number |
| `.org-stat-label` | Stat description label |

---

## 5. Theme CSS Variables

Use these everywhere — never hardcode colors:

```css
/* Backgrounds */
var(--bg-primary)        /* page background */
var(--bg-secondary)      /* input / subtle background */
var(--bg-card)           /* card background */
var(--bg-card-hover)     /* card hover background */

/* Text */
var(--text-primary)      /* main text */
var(--text-secondary)    /* secondary text */
var(--text-muted)        /* muted/labels */

/* Accent */
var(--accent-primary)        /* blue highlight */
var(--accent-secondary)      /* purple highlight */
var(--accent-primary-glow)   /* translucent blue (badges, tag bg) */

/* Borders */
var(--border-card)       /* card border */
var(--border-subtle)     /* dividers */

/* Shadows */
var(--shadow-card)       /* default card shadow */
var(--shadow-card-hover) /* hover card shadow */

/* Spacing */
var(--space-xs)  /* 4px */
var(--space-sm)  /* 8px */
var(--space-md)  /* 12px */
var(--space-lg)  /* 16px */
var(--space-xl)  /* 24px */
var(--space-2xl) /* 32px */

/* Border radius */
var(--radius-sm)   /* 4px */
var(--radius-md)   /* 8px */
var(--radius-lg)   /* 12px */
var(--radius-xl)   /* 16px */
var(--radius-full) /* 9999px — pills/circles */

/* Transitions */
var(--transition-fast)  /* 0.15s */
var(--transition-base)  /* 0.25s */
var(--transition-slow)  /* 0.4s */
```

### Dark/Light overrides
```css
/* Default = dark theme styles */
.your-element { color: rgba(255,255,255,0.8); }

/* Light theme override */
[data-theme="light"] .your-element { color: rgba(0,0,0,0.8); }
```

---

## 6. Card Pattern

```css
.your-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
/* Top accent bar on hover */
.your-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  opacity: 0;
  transition: opacity 0.25s ease;
}
.your-card:hover { border-color: var(--accent-primary); box-shadow: var(--shadow-card-hover); transform: translateY(-2px); }
.your-card:hover::before { opacity: 1; }
.your-card.selected { border-color: var(--accent-primary); background: var(--accent-primary-glow); }
.your-card.selected::before { opacity: 1; }
```

---

## 7. Modal Pattern

```jsx
function YourModal({ item, onSubmit, onClose }) {
  const isEdit = !!item
  const [form, setForm] = useState({ name: item?.name || '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('Name is required'); return }
    setSubmitting(true)
    try {
      await onSubmit(form, isEdit)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="org-modal-overlay" onClick={onClose}>
      <div className="org-modal" onClick={e => e.stopPropagation()}>
        <div className="org-modal-header">
          <div className="org-modal-title-row">
            <YourIcon/>
            <h3 className="org-modal-title">{isEdit ? 'Edit Item' : 'Add Item'}</h3>
          </div>
          <button className="org-settings-close-btn" onClick={onClose}><CloseIcon/></button>
        </div>
        <form onSubmit={handleSubmit} className="org-modal-body">
          {error && <div className="org-form-error">{error}</div>}
          <div className="org-form-field">
            <label className="org-form-label">Name <span className="org-form-required">*</span></label>
            <input className="org-form-input" value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
          </div>
          <div className="org-modal-actions">
            <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="toolbar-btn primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 8. Side Panel Pattern

```jsx
function YourDetailPanel({ item, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [form, setForm] = useState({})

  useEffect(() => {
    setEditing(false)
    setSaveMsg('')
    setForm({ ...item })
  }, [item])

  if (!item) return null

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await putJSON(`${API_BASE}/api/your/endpoint/${item.id}`, form)
      setSaveMsg('Saved successfully')
      setEditing(false)
      onUpdate()
    } catch (err) {
      setSaveMsg('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="org-settings-panel">
      <div className="org-settings-panel-header">
        <div className="org-settings-panel-title-row">
          <YourIcon/>
          <h3 className="org-settings-panel-title">{item.name}</h3>
        </div>
        <div className="org-settings-header-actions">
          {!editing ? (
            <button className="org-settings-edit-btn" onClick={() => setEditing(true)}><EditIcon/></button>
          ) : (
            <>
              <button className="org-settings-save-btn" onClick={handleSave} disabled={saving}><SaveIcon/></button>
              <button className="org-settings-cancel-btn" onClick={() => { setForm({...item}); setEditing(false) }}><CloseIcon/></button>
            </>
          )}
          <button className="org-settings-close-btn" onClick={onClose}><CloseIcon/></button>
        </div>
      </div>

      {saveMsg && (
        <div className={`org-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>
          {saveMsg}
        </div>
      )}

      {!editing ? (
        <div className="org-settings-list">
          <div className="org-setting-row">
            <span className="org-setting-label">Name</span>
            <span className="org-setting-value">{item.name || '—'}</span>
          </div>
        </div>
      ) : (
        <div className="org-settings-edit-form">
          <div className="org-form-field">
            <label className="org-form-label">Name</label>
            <input className="org-form-input" value={form.name || ''}
              onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 9. Icons

All icons are inline SVG. Copy one of these templates:

```jsx
// 18×18 stroke icons (for page headers, cards)
const XxxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* SVG paths */}
  </svg>
)

// 14×14 stroke icons (for toolbar buttons, tags)
const XxxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* SVG paths */}
  </svg>
)
```

Common icons used across pages:
- **BackIcon** — `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`
- **CloseIcon** — `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`
- **SearchIcon** — `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`
- **PlusIcon** — `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`
- **RefreshIcon** — `<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>`
- **SaveIcon** — floppy disk SVG
- **EditIcon** — pencil/square SVG
- **TrashIcon** — trash bin SVG

---

## 10. Checklist for a New Page

- [ ] Add entry in `sections.js` with `isImplemented: true`
- [ ] Create `src/components/YourPage.jsx`
- [ ] Create `src/components/YourPage.css`
- [ ] Import component in `App.jsx`
- [ ] Import CSS in `App.jsx`
- [ ] Add `handleCardClick` case in `App.jsx`
- [ ] Add `if (currentPage === 'your-page')` render block in `App.jsx`
- [ ] Use only `var(--...)` CSS variables — no hardcoded colors
- [ ] Add `[data-theme="light"]` overrides for any non-standard colors
- [ ] Use `org-*` shared classes for layout, toolbar, modal, panel shell
- [ ] Define page-specific classes in your own CSS file with a unique prefix
