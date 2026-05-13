/* ===== Loading Spinner ===== */
function LoadingSpinner({ text }) {
    return (
        <div className="org-loading">
            <div className="org-spinner" />
            <span>{text || 'Loading...'}</span>
        </div>
    )
}

export default LoadingSpinner
