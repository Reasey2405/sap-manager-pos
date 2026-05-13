import { useState } from 'react'
import { validateCoupon } from '../../service/api'

export default function CouponValidator() {
    const [code, setCode] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleValidate = async () => {
        if (!code.trim()) return
        setLoading(true); setResult(null)
        try { const res = await validateCoupon(code.trim()); setResult(res) }
        catch (err) { setResult({ valid: false, rejectionReason: err.message }) }
        finally { setLoading(false) }
    }

    return (
        <div className="disc-validator-section">
            <h4 className="disc-validator-title">Validate Coupon</h4>
            <div className="disc-validator-input-row">
                <input type="text" className="org-form-input" value={code}
                    onChange={e => setCode(e.target.value)} placeholder="Enter coupon code..."
                    onKeyDown={e => e.key === 'Enter' && handleValidate()} />
                <button className="toolbar-btn primary" onClick={handleValidate} disabled={loading || !code.trim()}>
                    {loading ? 'Checking...' : 'Validate'}
                </button>
            </div>
            {result && (
                <div className={`disc-validator-result ${result.valid ? 'valid' : 'invalid'}`}>
                    <span className="disc-validator-icon">{result.valid ? '✓' : '✗'}</span>
                    <span>{result.valid ? 'Coupon is valid' : (result.rejectionReason || 'Coupon is invalid')}</span>
                </div>
            )}
        </div>
    )
}
