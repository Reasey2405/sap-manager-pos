import { useState } from 'react'
import { API_BASE, fetchText } from '../../service/api'
import { TerminalSvgIcon, CloseIcon, PlusIcon } from './icons'
import FormField from './FormField'
import CustomSelect from './CustomSelect'
import ExchangeRateRow from './ExchangeRateRow'

/* ===== Add Terminal Modal ===== */
function AddTerminalModal({ group, branches, seriesList, currencies, priceLists, sapSettings, onSubmit, onClose }) {
    const [activeTab, setActiveTab] = useState('general')
    const [form, setForm] = useState({
        posTerminalID: '',
        posName: '',
        bplname: '',
        branchId: group?.branchId || '',
        groupCode: group?.groupCode || '',
        arSeries: '',
        incomingPaymentSeries: '',
        outgoingPaymentSeries: '',
        priceListEntity: '',
        mainCurrency: sapSettings?.sysCurrncy || '',
        amountScale: sapSettings?.sumDec ?? 2,
        priceScale: sapSettings?.priceDec ?? 2,
        qtyScale: sapSettings?.qtyDec ?? 3,
        percentScale: sapSettings?.percentDec ?? 2,
        rateScale: sapSettings?.rateDec ?? 6,
        defaultExchangeRates: [],
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [activationCode, setActivationCode] = useState(null)
    const [loadingCode, setLoadingCode] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopyCode = (code) => {
        if (!code || code === 'Error' || code.startsWith('Please') || code.includes(' ')) return;

        const textToCopy = String(code);

        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => console.error('Failed to copy', err));
        } else {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed";
                textArea.style.top = "0";
                textArea.style.left = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
        }
    }

    const fetchActivationCode = async () => {
        if (!form.posTerminalID) {
            setActivationCode('Please enter Terminal ID on General tab first')
            return
        }
        if (activationCode && activationCode !== 'Error' && !activationCode.startsWith('Please') && !activationCode.includes(' ')) {
            handleCopyCode(activationCode)
            return
        }
        if (loadingCode) return
        setLoadingCode(true)
        try {
            const resData = await fetchText(`${API_BASE}/api/pos_terminal_register/register_code?posTerminalId=${form.posTerminalID}`)
            let codeVal = ''
            try {
                const parsed = JSON.parse(resData)
                if (parsed && typeof parsed === 'object') {
                    codeVal = parsed.registerCode || parsed.code || JSON.stringify(parsed)
                } else {
                    codeVal = String(parsed)
                }
            } catch {
                codeVal = resData.replace(/^"|"$/g, '')
            }
            setActivationCode(codeVal)
            handleCopyCode(codeVal)
        } catch (err) {
            let errMsg = 'Error'
            try {
                const parsed = JSON.parse(err.message)
                if (parsed && parsed.message) errMsg = parsed.message
            } catch {
                if (err.message && !err.message.includes('failed:')) errMsg = err.message
            }
            setActivationCode(errMsg)
        } finally {
            setLoadingCode(false)
        }
    }

    const invoiceSeries = seriesList.filter(s => s.objectCode === 13)
    const incomingPaymentSeries = seriesList.filter(s => s.objectCode === 24)
    const outgoingPaymentSeries = seriesList.filter(s => s.objectCode === 46)

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const addExchangeRate = () => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: [...f.defaultExchangeRates, { currency: '', fallBackExchangeRate: 0 }],
        }))
    }

    const updateExchangeRate = (index, field, value) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: f.defaultExchangeRates.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }))
    }

    const removeExchangeRate = (index) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: f.defaultExchangeRates.filter((_, i) => i !== index),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.posTerminalID || !form.posName) {
            setError('Terminal ID and Name are required')
            setActiveTab('general')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            await onSubmit({
                posTerminalID: form.posTerminalID,
                posName: form.posName,
                bplname: form.bplname || null,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                groupCode: form.groupCode || null,
                arSeries: form.arSeries ? parseInt(form.arSeries) : 0,
                incomingPaymentSeries: form.incomingPaymentSeries ? parseInt(form.incomingPaymentSeries) : 0,
                outgoingPaymentSeries: form.outgoingPaymentSeries ? parseInt(form.outgoingPaymentSeries) : 0,
                priceListEntity: form.priceListEntity ? parseInt(form.priceListEntity) : 0,
                mainCurrency: form.mainCurrency,
                amountScale: parseInt(form.amountScale) || 2,
                priceScale: parseInt(form.priceScale) || 2,
                qtyScale: parseInt(form.qtyScale) || 3,
                percentScale: parseInt(form.percentScale) || 2,
                rateScale: parseInt(form.rateScale) || 6,
                defaultExchangeRates: form.defaultExchangeRates.filter(r => r.currency),
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="org-modal-overlay" onClick={onClose}>
            <div className="org-modal org-modal-lg" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <TerminalSvgIcon />
                        <h3 className="org-modal-title">Add POS Terminal</h3>
                        {group && <span className="org-modal-subtitle">to {group.groupName}</span>}
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                {/* Tabs */}
                <div className="org-modal-tabs">
                    <button className={`org-modal-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')} type="button">General</button>
                    <button className={`org-modal-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')} type="button">Advanced</button>
                </div>

                <form onSubmit={handleSubmit} className="org-modal-body">
                    {error && <div className="org-form-error">{error}</div>}

                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <>
                            <h4 className="org-form-section-title">Basic Information</h4>
                            <div className="org-form-grid">
                                <FormField label="Terminal ID" required>
                                    <input type="text" className="org-form-input" value={form.posTerminalID}
                                        onChange={e => updateField('posTerminalID', e.target.value)}
                                        placeholder="e.g. POS-001" id="input-terminal-id" />
                                </FormField>
                                <FormField label="Terminal Name" required>
                                    <input type="text" className="org-form-input" value={form.posName}
                                        onChange={e => updateField('posName', e.target.value)}
                                        placeholder="e.g. Checkout 1" id="input-terminal-name" />
                                </FormField>
                                <FormField label="BPL Name">
                                    <input type="text" className="org-form-input" value={form.bplname}
                                        onChange={e => updateField('bplname', e.target.value)}
                                        placeholder="Branch name" id="input-bplname" />
                                </FormField>
                                <FormField label="Branch">
                                    <CustomSelect
                                        options={branches.map(b => ({ value: b.BPLId, label: b.BPLName }))}
                                        value={form.branchId}
                                        placeholder="Select branch"
                                        onChange={val => updateField('branchId', val)}
                                    />
                                </FormField>
                                <FormField label="Group">
                                    <CustomSelect
                                        options={group ? [{ value: group.groupCode, label: `${group.groupName} (${group.groupCode})` }] : []}
                                        value={form.groupCode}
                                        placeholder="No group assigned"
                                        onChange={val => updateField('groupCode', val)}
                                    />
                                </FormField>
                            </div>

                            <h4 className="org-form-section-title">Series Configuration</h4>
                            <div className="org-form-grid">
                                <FormField label="AR Series (Invoice)">
                                    <CustomSelect
                                        options={invoiceSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.arSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('arSeries', val)}
                                    />
                                </FormField>
                                <FormField label="Incoming Payment Series">
                                    <CustomSelect
                                        options={incomingPaymentSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.incomingPaymentSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('incomingPaymentSeries', val)}
                                    />
                                </FormField>
                                <FormField label="Outgoing Payment Series">
                                    <CustomSelect
                                        options={outgoingPaymentSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                        value={form.outgoingPaymentSeries}
                                        placeholder="Select series"
                                        onChange={val => updateField('outgoingPaymentSeries', val)}
                                    />
                                </FormField>
                            </div>

                            <h4 className="org-form-section-title">Pricing & Currency</h4>
                            <div className="org-form-grid">
                                <FormField label="Price List">
                                    <CustomSelect
                                        options={priceLists.map(p => ({ value: p.listNum, label: p.listName }))}
                                        value={form.priceListEntity}
                                        placeholder="Select price list"
                                        onChange={val => updateField('priceListEntity', val)}
                                    />
                                </FormField>
                                <FormField label="Main Currency">
                                    <input
                                        type="text"
                                        className="org-form-input"
                                        value={form.mainCurrency}
                                        readOnly
                                        disabled
                                    />
                                </FormField>
                            </div>
                        </>
                    )}

                    {/* Tab: Advanced */}
                    {activeTab === 'advanced' && (
                        <>
                            <h4 className="org-form-section-title">Decimal Scale Settings</h4>
                            <div className="org-form-grid org-form-grid-5">
                                <FormField label="Amount">
                                    <input type="number" className="org-form-input" value={form.amountScale}
                                        onChange={e => updateField('amountScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Price">
                                    <input type="number" className="org-form-input" value={form.priceScale}
                                        onChange={e => updateField('priceScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Quantity">
                                    <input type="number" className="org-form-input" value={form.qtyScale}
                                        onChange={e => updateField('qtyScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Percent">
                                    <input type="number" className="org-form-input" value={form.percentScale}
                                        onChange={e => updateField('percentScale', e.target.value)} min="0" max="10" />
                                </FormField>
                                <FormField label="Rate">
                                    <input type="number" className="org-form-input" value={form.rateScale}
                                        onChange={e => updateField('rateScale', e.target.value)} min="0" max="10" />
                                </FormField>
                            </div>

                            <div className="org-form-grid" style={{ marginTop: '16px' }}>
                                <div className="org-form-field" style={{ cursor: 'pointer' }} onClick={fetchActivationCode} title={copied ? "Copied!" : "Click to show & copy activation code"}>
                                    <label className="org-form-label">Activation Code</label>
                                    <div style={{ color: copied ? '#28a745' : 'var(--primary-color, #007bff)', fontWeight: 600, padding: '8px 12px', background: 'var(--bg-light, #f8f9fa)', borderRadius: '4px', border: '1px solid var(--border-color, #eee)', transition: 'color 0.2s' }}>
                                        {copied ? 'Copied to clipboard!' : (loadingCode ? 'Loading...' : (activationCode || 'Click to show'))}
                                    </div>
                                </div>
                            </div>

                            <h4 className="org-form-section-title">
                                Default Exchange Rates
                                <button type="button" className="org-form-add-inline-btn" onClick={addExchangeRate}>
                                    <PlusIcon /> Add Rate
                                </button>
                            </h4>
                            {form.defaultExchangeRates.length > 0 && (
                                <div className="org-exchange-rates-list">
                                    {form.defaultExchangeRates.map((rate, i) => (
                                        <ExchangeRateRow
                                            key={i} rate={rate} index={i}
                                            currencies={currencies}
                                            onChange={updateExchangeRate}
                                            onRemove={removeExchangeRate}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting} id="btn-submit-terminal">
                            {submitting ? 'Creating...' : 'Create Terminal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddTerminalModal
