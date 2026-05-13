import { useState, useEffect } from 'react'
import { API_BASE, putJSON, postJSON, fetchText } from '../../service/api'
import { SettingsGearIcon, EditIcon, SaveIcon, CloseIcon, PlusIcon } from './icons'
import FormField from './FormField'
import CustomSelect from './CustomSelect'
import ExchangeRateRow from './ExchangeRateRow'

/* ===== Terminal Detail Row ===== */
export function SettingRow({ label, value }) {
    const display = value === null || value === undefined || value === '' ? '—' : String(value)
    return (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{display}</span>
        </div>
    )
}

/* ===== Terminal Settings Panel ===== */
function TerminalSettingsPanel({ terminal, seriesList, currencies, priceLists, branches, groups, sapSettings, onClose, onUpdate }) {
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState('')
    const [form, setForm] = useState({})
    const [activeTab, setActiveTab] = useState('general')

    const [activationCode, setActivationCode] = useState(null)
    const [loadingCode, setLoadingCode] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        setActivationCode(null)
        setCopied(false)
    }, [terminal])

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
        if (activationCode && activationCode !== 'Error' && !activationCode.startsWith('Please') && !activationCode.includes(' ')) {
            handleCopyCode(activationCode)
            return
        }
        if (loadingCode) return
        setLoadingCode(true)
        try {
            const resData = await fetchText(`${API_BASE}/api/pos_terminal_register/register_code?posTerminalId=${terminal.posTerminalID}`)
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

    const startRegistration = async () => {
        setRegistering(true)
        setSaveMsg('')
        try {
            await postJSON(`${API_BASE}/api/pos_terminal_register/startRegistration?posTerminalId=${terminal.posTerminalID}`)
            setSaveMsg('Registration started successfully. A new code is generated.')
            setActivationCode(null)
        } catch (err) {
            setSaveMsg('Registration Error: ' + err.message)
        } finally {
            setRegistering(false)
        }
    }

    useEffect(() => {
        setEditing(false)
        setSaveMsg('')
        setActiveTab('general')
        setForm({
            ...terminal,
            amountScale: terminal?.amountScale ?? sapSettings?.sumDec ?? 2,
            priceScale: terminal?.priceScale ?? sapSettings?.priceDec ?? 2,
            qtyScale: terminal?.qtyScale ?? sapSettings?.qtyDec ?? 3,
            percentScale: terminal?.percentScale ?? sapSettings?.percentDec ?? 2,
            rateScale: terminal?.rateScale ?? sapSettings?.rateDec ?? 6,
            defaultExchangeRates: terminal?.defaultExchangeRates ? [...terminal.defaultExchangeRates] : [],
        })
    }, [terminal])

    if (!terminal) return null

    const findSeries = (val) => { const s = seriesList.find(s => s.series === val); return s ? `${s.seriesName} (${s.series})` : val }
    const findCurrency = (code) => { const c = currencies.find(c => c.currCode === code); return c ? `${c.currCode} - ${c.currName}` : code }
    const findPriceList = (num) => { const p = priceLists.find(p => p.listNum === num); return p ? p.listName : num }
    const findBranch = (id) => { const b = branches.find(b => b.BPLId === id); return b ? b.BPLName : id }
    const findGroup = (code) => { const g = groups.find(g => g.groupCode === code); return g ? g.groupName : code }

    const invoiceSeries = seriesList.filter(s => s.objectCode === 13)
    const incomingPmtSeries = seriesList.filter(s => s.objectCode === 24)
    const outgoingPmtSeries = seriesList.filter(s => s.objectCode === 46)

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const addExchangeRate = () => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: [...(f.defaultExchangeRates || []), { currency: '', fallBackExchangeRate: 0 }],
        }))
    }

    const updateExchangeRate = (index, field, value) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: (f.defaultExchangeRates || []).map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }))
    }

    const removeExchangeRate = (index) => {
        setForm(f => ({
            ...f,
            defaultExchangeRates: (f.defaultExchangeRates || []).filter((_, i) => i !== index),
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        setSaveMsg('')
        try {
            await putJSON(`${API_BASE}/api/pos_terminal/${terminal.posTerminalID}`, {
                ...form,
                branchId: form.branchId ? parseInt(form.branchId) : null,
                arSeries: form.arSeries ? parseInt(form.arSeries) : 0,
                incomingPaymentSeries: form.incomingPaymentSeries ? parseInt(form.incomingPaymentSeries) : 0,
                outgoingPaymentSeries: form.outgoingPaymentSeries ? parseInt(form.outgoingPaymentSeries) : 0,
                priceListEntity: form.priceListEntity ? parseInt(form.priceListEntity) : 0,
                amountScale: parseInt(form.amountScale) || 2,
                priceScale: parseInt(form.priceScale) || 2,
                qtyScale: parseInt(form.qtyScale) || 3,
                percentScale: parseInt(form.percentScale) || 2,
                rateScale: parseInt(form.rateScale) || 6,
                defaultExchangeRates: (form.defaultExchangeRates || []).filter(r => r.currency),
            })
            setSaveMsg('Saved successfully')
            setEditing(false)
            if (onUpdate) onUpdate()
        } catch (err) {
            setSaveMsg('Error: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => { setForm({ ...terminal, defaultExchangeRates: terminal?.defaultExchangeRates ? [...terminal.defaultExchangeRates] : [] }); setEditing(false); setSaveMsg(''); setActiveTab('general') }

    const renderValue = (label, value) => (
        <div className="org-setting-row">
            <span className="org-setting-label">{label}</span>
            <span className="org-setting-value">{value === null || value === undefined || value === '' ? '—' : String(value)}</span>
        </div>
    )

    return (
        <div className="org-settings-panel" id={`settings-panel-${terminal.posTerminalID}`}>
            <div className="org-settings-panel-header">
                <div className="org-settings-panel-title-row">
                    <SettingsGearIcon />
                    <h3 className="org-settings-panel-title">{terminal.posName || terminal.posTerminalID}</h3>
                </div>
                <div className="org-settings-header-actions">
                    {!editing ? (
                        <button className="org-settings-edit-btn" onClick={() => setEditing(true)} title="Edit"><EditIcon /></button>
                    ) : (
                        <>
                            <button className="org-settings-save-btn" onClick={handleSave} disabled={saving} title="Save"><SaveIcon /></button>
                            <button className="org-settings-cancel-btn" onClick={handleCancel} disabled={saving} title="Cancel"><CloseIcon /></button>
                        </>
                    )}
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>
            </div>

            {saveMsg && <div className={`org-save-msg ${saveMsg.startsWith('Error') ? 'error' : 'success'}`}>{saveMsg}</div>}

            {/* Terminal Info */}
            {!editing ? (
                <>
                    <div className="org-settings-info-grid">
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Terminal ID</span><span className="org-settings-info-value mono">{terminal.posTerminalID}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Branch</span><span className="org-settings-info-value">{findBranch(terminal.branchId)}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Group</span><span className="org-settings-info-value">{terminal.groupCode ? findGroup(terminal.groupCode) : '—'}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">BPL Name</span><span className="org-settings-info-value">{terminal.bplname || '—'}</span></div>
                        <div className="org-settings-info-item"><span className="org-settings-info-label">Currency</span><span className="org-settings-info-value">{findCurrency(terminal.mainCurrency)}</span></div>
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Series Configuration</h4>
                    <div className="org-settings-list">
                        {renderValue('AR Series', findSeries(terminal.arSeries))}
                        {renderValue('Incoming Payment', findSeries(terminal.incomingPaymentSeries))}
                        {renderValue('Outgoing Payment', findSeries(terminal.outgoingPaymentSeries))}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Pricing</h4>
                    <div className="org-settings-list">
                        {renderValue('Price List', findPriceList(terminal.priceListEntity))}
                        {renderValue('Main Currency', findCurrency(terminal.mainCurrency))}
                    </div>
                    <div className="org-settings-divider" />
                    <h4 className="org-settings-section-title">Decimal Scales</h4>
                    <div className="org-settings-list">
                        {renderValue('Amount', terminal.amountScale)}
                        {renderValue('Price', terminal.priceScale)}
                        {renderValue('Qty', terminal.qtyScale)}
                        {renderValue('Percent', terminal.percentScale)}
                        {renderValue('Rate', terminal.rateScale)}
                        <div className="org-setting-row" style={{ cursor: 'pointer' }} onClick={fetchActivationCode} title={copied ? "Copied!" : "Click to show & copy activation code"}>
                            <span className="org-setting-label">Activation Code</span>
                            <span className="org-setting-value" style={{ color: copied ? '#28a745' : 'var(--primary-color, #007bff)', transition: 'color 0.2s' }}>
                                {copied ? 'Copied to clipboard!' : (loadingCode ? 'Loading...' : (activationCode || 'Click to show'))}
                            </span>
                        </div>
                    </div>
                    {terminal.defaultExchangeRates?.length > 0 && (
                        <><div className="org-settings-divider" /><h4 className="org-settings-section-title">Exchange Rates</h4>
                            <div className="org-settings-list">{terminal.defaultExchangeRates.map((r, i) => renderValue(findCurrency(r.currency), r.fallBackExchangeRate))}</div></>
                    )}
                </>
            ) : (
                <div className="org-settings-edit-form">
                    {/* Tabs */}
                    <div className="org-modal-tabs">
                        <button className={`org-modal-tab ${activeTab === 'general' ? 'active' : ''}`}
                            onClick={() => setActiveTab('general')} type="button">General</button>
                        <button className={`org-modal-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                            onClick={() => setActiveTab('advanced')} type="button">Advanced</button>
                    </div>

                    {/* Tab: General */}
                    {activeTab === 'general' && (
                        <>
                            <FormField label="POS Name"><input className="org-form-input" value={form.posName || ''} onChange={e => updateField('posName', e.target.value)} /></FormField>
                            <FormField label="BPL Name"><input className="org-form-input" value={form.bplname || ''} onChange={e => updateField('bplname', e.target.value)} /></FormField>
                            <FormField label="Branch">
                                <CustomSelect
                                    options={branches.map(b => ({ value: b.BPLId, label: b.BPLName }))}
                                    value={form.branchId || ''}
                                    placeholder="None"
                                    onChange={val => updateField('branchId', val)}
                                />
                            </FormField>
                            <FormField label="Group">
                                <CustomSelect
                                    options={groups.map(g => ({ value: g.groupCode, label: `${g.groupName} (${g.groupCode})` }))}
                                    value={form.groupCode || ''}
                                    placeholder="None (Unassigned)"
                                    onChange={val => updateField('groupCode', val)}
                                />
                            </FormField>
                            <div className="org-settings-divider" />
                            <h4 className="org-settings-section-title">Series</h4>
                            <FormField label="AR Series">
                                <CustomSelect
                                    options={invoiceSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.arSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('arSeries', val)}
                                />
                            </FormField>
                            <FormField label="Incoming Payment">
                                <CustomSelect
                                    options={incomingPmtSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.incomingPaymentSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('incomingPaymentSeries', val)}
                                />
                            </FormField>
                            <FormField label="Outgoing Payment">
                                <CustomSelect
                                    options={outgoingPmtSeries.map(s => ({ value: s.series, label: `${s.seriesName} (${s.series})` }))}
                                    value={form.outgoingPaymentSeries || ''}
                                    placeholder="None"
                                    onChange={val => updateField('outgoingPaymentSeries', val)}
                                />
                            </FormField>
                            <div className="org-settings-divider" />
                            <h4 className="org-settings-section-title">Pricing</h4>
                            <FormField label="Price List">
                                <CustomSelect
                                    options={priceLists.map(p => ({ value: p.listNum, label: p.listName }))}
                                    value={form.priceListEntity || ''}
                                    placeholder="None"
                                    onChange={val => updateField('priceListEntity', val)}
                                />
                            </FormField>
                            <FormField label="Main Currency">
                                <input
                                    type="text"
                                    className="org-form-input"
                                    value={form.mainCurrency || ''}
                                    readOnly
                                    disabled
                                />
                            </FormField>
                        </>
                    )}

                    {/* Tab: Advanced */}
                    {activeTab === 'advanced' && (
                        <>
                            <h4 className="org-settings-section-title">Decimal Scales</h4>
                            <div className="org-form-grid org-form-grid-5">
                                <FormField label="Amt"><input type="number" className="org-form-input" value={form.amountScale ?? ''} onChange={e => updateField('amountScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Price"><input type="number" className="org-form-input" value={form.priceScale ?? ''} onChange={e => updateField('priceScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Qty"><input type="number" className="org-form-input" value={form.qtyScale ?? ''} onChange={e => updateField('qtyScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="%"><input type="number" className="org-form-input" value={form.percentScale ?? ''} onChange={e => updateField('percentScale', e.target.value)} min="0" max="10" /></FormField>
                                <FormField label="Rate"><input type="number" className="org-form-input" value={form.rateScale ?? ''} onChange={e => updateField('rateScale', e.target.value)} min="0" max="10" /></FormField>
                            </div>

                            <div className="org-form-grid" style={{ marginTop: '16px' }}>
                                <div className="org-form-field">
                                    <label className="org-form-label">Terminal Registration</label>
                                    <button
                                        type="button"
                                        className="toolbar-btn primary"
                                        onClick={startRegistration}
                                        disabled={registering}
                                        title="Create a new registration code for this terminal"
                                    >
                                        {registering ? 'Starting...' : 'Start Registration (New Code)'}
                                    </button>
                                </div>
                            </div>

                            <h4 className="org-form-section-title">
                                Default Exchange Rates
                                <button type="button" className="org-form-add-inline-btn" onClick={addExchangeRate}>
                                    <PlusIcon /> Add Rate
                                </button>
                            </h4>
                            {(form.defaultExchangeRates || []).length > 0 && (
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
                </div>
            )}
        </div>
    )
}

export default TerminalSettingsPanel
