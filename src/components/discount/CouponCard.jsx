import { useState } from 'react'
import { formatDate } from './constants'
import { CopyIcon, CheckIcon } from './Icons'

export default function CouponCard({ coupon, onToggle }) {
    const [copied, setCopied] = useState(false)
    const copyCode = (e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(coupon.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }
    const isExpired = coupon.validTo && new Date(coupon.validTo) < new Date()
    const usageRatio = coupon.maxUses ? (coupon.usedCount || 0) / coupon.maxUses : 0

    return (
        <div className={`disc-coupon-card ${!coupon.isActive ? 'inactive' : ''} ${isExpired ? 'expired' : ''}`}>
            <div className="disc-coupon-card-top">
                <div className="disc-coupon-code-row">
                    <span className="disc-coupon-code">{coupon.code}</span>
                    <button className="disc-coupon-copy-btn" onClick={copyCode} title="Copy code">
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                </div>
                <span className={`disc-coupon-status ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {isExpired ? 'EXPIRED' : (coupon.isActive ? 'ACTIVE' : 'INACTIVE')}
                </span>
            </div>
            <div className="disc-coupon-card-body">
                <div className="disc-coupon-meta-item"><span className="disc-meta-label">Type</span><span className="disc-meta-value">{coupon.type}</span></div>
                <div className="disc-coupon-meta-item"><span className="disc-meta-label">Usage</span><span className="disc-meta-value">{coupon.usedCount || 0} / {coupon.maxUses || '--'}</span></div>
                <div className="disc-coupon-meta-item"><span className="disc-meta-label">Valid</span><span className="disc-meta-value">{formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}</span></div>
                {coupon.schemeName && (<div className="disc-coupon-meta-item"><span className="disc-meta-label">Scheme</span><span className="disc-meta-value">{coupon.schemeName}</span></div>)}
            </div>
            {coupon.maxUses && (
                <div className="disc-coupon-usage-bar"><div className="disc-coupon-usage-fill" style={{ width: `${Math.min(usageRatio * 100, 100)}%` }} /></div>
            )}
            <div className="disc-coupon-card-footer">
                <button className={`toolbar-btn tiny ${coupon.isActive ? 'warning' : 'success'}`} onClick={() => onToggle(coupon)} disabled={isExpired}>
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        </div>
    )
}
