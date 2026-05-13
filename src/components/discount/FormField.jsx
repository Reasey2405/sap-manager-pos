import { STATUS_COLORS } from './constants'

/* ═══════════════════════════════════════════════════
   Reusable Sub-components
   ═══════════════════════════════════════════════════ */
export function FormField({ label, children, required, hint }) {
    return (
        <div className="disc-form-field">
            <label className="disc-form-label">
                {label} {required && <span className="disc-form-required">*</span>}
            </label>
            {children}
            {hint && <span className="disc-form-hint">{hint}</span>}
        </div>
    )
}

export function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

export function StatusBadge({ status }) {
    return (
        <span className={`disc-status-badge ${STATUS_COLORS[status] || 'draft'}`}>
            {status}
        </span>
    )
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
    return (
        <div className="org-modal-overlay" onClick={onCancel}>
            <div className="disc-confirm-dialog" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="disc-confirm-actions">
                    <button className="toolbar-btn" onClick={onCancel}>Cancel</button>
                    <button className="toolbar-btn danger" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    )
}
