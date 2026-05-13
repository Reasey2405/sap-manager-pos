/* ===== Form Field Component ===== */
function FormField({ label, children, required }) {
    return (
        <div className="org-form-field">
            <label className="org-form-label">
                {label} {required && <span className="org-form-required">*</span>}
            </label>
            {children}
        </div>
    )
}

export default FormField
