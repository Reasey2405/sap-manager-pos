import { useState, useMemo } from 'react'
import {
    STATUS_OPTIONS, COMBINATION_MODES, CALCULATION_MODES, SCOPES, DISCOUNT_TYPES, APPLY_TO,
    ROUNDING_RULES, ENTITLEMENT_TYPES, BUY_X_GET_Y_SCOPES, BUY_COMBO_GET_Y_SCOPES, toLocalInput
} from './constants'
import { PercentSvgIcon, CloseIcon, PlusIcon, TrashIcon } from './Icons'
import { FormField } from './FormField'
import ConditionEditor from './ConditionEditor'
import MultiSelectDropdown from './MultiSelectDropdown'
import LookupPicker from './LookupPicker'
import { getDiscountProductsEnriched, getDiscountCategories } from '../../service/discountLookups'

const PRODUCT_LOOKUP_COLUMNS = [
    { key: 'itemCode', label: 'Code' },
    { key: 'itemName', label: 'Name' },
    { key: 'itmsGrpCod', label: 'Cat Code' },
    { key: 'categoryName', label: 'Category' },
]

const CATEGORY_LOOKUP_COLUMNS = [
    { key: 'itmsGrpCod', label: 'Code' },
    { key: 'itmsGrpNam', label: 'Name' },
]

export default function SchemeModal({ scheme, terminals = [], onSubmit, onClose }) {
    const isEdit = !!scheme
    const [activeTab, setActiveTab] = useState('general')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const [form, setForm] = useState({
        name: scheme?.name || '',
        description: scheme?.description || '',
        status: scheme?.status || 'DRAFT',
        priority: scheme?.priority ?? 1,
        combinationMode: scheme?.combinationMode || 'EXCLUSIVE',
        calculationMode: scheme?.calculationMode || 'GROSS',
        validFrom: toLocalInput(scheme?.validFrom) || '',
        validTo: toLocalInput(scheme?.validTo) || '',
        approvedBy: scheme?.approvedBy || '',
        scope: scheme?.scope || 'GLOBAL',
        scopeIds: scheme?.scopeIds || [],
        rules: scheme?.rules || [],
        entitlements: scheme?.entitlements || [],
    })

    const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }))

    /* ── Scope ID options derived from terminals ── */
    const scopeIdOptions = useMemo(() => {
        if (form.scope === 'POS_GROUP') {
            const codes = [...new Set(terminals.map(t => t.groupCode).filter(Boolean))]
            return codes.map(c => ({ value: c, label: c }))
        }
        if (form.scope === 'POS_TERMINAL') {
            return terminals.map(t => ({ value: t.posTerminalID, label: `${t.posName} (${t.posTerminalID})` }))
        }
        return []
    }, [form.scope, terminals])

    const handleScopeChange = (newScope) => {
        updateField('scope', newScope)
        updateField('scopeIds', [])
    }

    /* ── Rule management ── */
    const addRule = () => {
        updateField('rules', [...form.rules, {
            name: '', sequence: form.rules.length + 1, discountType: 'PERCENTAGE',
            discountValue: 0, applyTo: 'TRANSACTION', maxDiscountAmount: null, minOrderAmount: null,
            minQuantity: null, minLineTotal: null, minLineUnitPrice: null, roundingRule: 'NEAREST_CENT',
            conditions: [], tiers: [], buyXGetYRule: null, buyComboGetYRule: null, rtcTiers: []
        }])
    }
    const updateRule = (idx, field, value) => {
        const updated = [...form.rules]
        updated[idx] = { ...updated[idx], [field]: value }
        updateField('rules', updated)
    }
    const removeRule = (idx) => updateField('rules', form.rules.filter((_, i) => i !== idx))

    /* ── Condition management ── */
    const addCondition = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            conditions: [...(updated[ruleIdx].conditions || []), { conditionType: 'PRODUCT', operator: 'EQUALS', value: '' }]
        }
        updateField('rules', updated)
    }
    const updateCondition = (ruleIdx, condIdx, field, value) => {
        setForm(f => {
            const updated = [...f.rules]
            const conds = [...updated[ruleIdx].conditions]
            conds[condIdx] = { ...conds[condIdx], [field]: value }
            updated[ruleIdx] = { ...updated[ruleIdx], conditions: conds }
            return { ...f, rules: updated }
        })
    }
    const removeCondition = (ruleIdx, condIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            conditions: updated[ruleIdx].conditions.filter((_, i) => i !== condIdx)
        }
        updateField('rules', updated)
    }

    /* ── Tier management ── */
    const addTier = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            tiers: [...(updated[ruleIdx].tiers || []), { minValue: 0, maxValue: null, discountType: 'PERCENTAGE', discountValue: 0 }]
        }
        updateField('rules', updated)
    }
    const updateTier = (ruleIdx, tierIdx, field, value) => {
        const updated = [...form.rules]
        const tiers = [...updated[ruleIdx].tiers]
        tiers[tierIdx] = { ...tiers[tierIdx], [field]: value }
        updated[ruleIdx] = { ...updated[ruleIdx], tiers }
        updateField('rules', updated)
    }
    const removeTier = (ruleIdx, tierIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = { ...updated[ruleIdx], tiers: updated[ruleIdx].tiers.filter((_, i) => i !== tierIdx) }
        updateField('rules', updated)
    }

    /* ── RTC tier management ── */
    const addRtcTier = (ruleIdx) => {
        const updated = [...form.rules]
        const existing = updated[ruleIdx].rtcTiers || []
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            rtcTiers: [...existing, { sequence: existing.length + 1, fromTime: '18:00', toTime: '20:00', discountType: 'PERCENTAGE', discountValue: 10 }]
        }
        updateField('rules', updated)
    }
    const updateRtcTier = (ruleIdx, tierIdx, field, value) => {
        const updated = [...form.rules]
        const tiers = [...updated[ruleIdx].rtcTiers]
        tiers[tierIdx] = { ...tiers[tierIdx], [field]: value }
        updated[ruleIdx] = { ...updated[ruleIdx], rtcTiers: tiers }
        updateField('rules', updated)
    }
    const removeRtcTier = (ruleIdx, tierIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = { ...updated[ruleIdx], rtcTiers: updated[ruleIdx].rtcTiers.filter((_, i) => i !== tierIdx) }
        updateField('rules', updated)
    }

    /* ── BuyXGetY management ── */
    const toggleBuyXGetY = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            buyXGetYRule: updated[ruleIdx].buyXGetYRule ? null : {
                buyQuantity: 2, buyScope: 'SPECIFIC_PRODUCT', buyProductIds: [],
                getQuantity: 1, getScope: 'CHEAPEST_IN_BASKET', getProductIds: [], getDiscountPercentage: 100
            }
        }
        updateField('rules', updated)
    }
    const updateBuyXGetY = (ruleIdx, field, value) => {
        const updated = [...form.rules]
        updated[ruleIdx] = { ...updated[ruleIdx], buyXGetYRule: { ...updated[ruleIdx].buyXGetYRule, [field]: value } }
        updateField('rules', updated)
    }

    /* ── BuyComboGetY management ── */
    const toggleBuyComboGetY = (ruleIdx) => {
        const updated = [...form.rules]
        updated[ruleIdx] = {
            ...updated[ruleIdx],
            buyComboGetYRule: updated[ruleIdx].buyComboGetYRule ? null : {
                comboItems: [{ itemCode: '', requiredQty: 1 }],
                getQuantity: 1, getScope: 'SPECIFIC_PRODUCT', getProductIds: [], getDiscountPercentage: 100
            }
        }
        updateField('rules', updated)
    }
    const updateBuyComboGetY = (ruleIdx, field, value) => {
        const updated = [...form.rules]
        updated[ruleIdx] = { ...updated[ruleIdx], buyComboGetYRule: { ...updated[ruleIdx].buyComboGetYRule, [field]: value } }
        updateField('rules', updated)
    }
    const addComboItem = (ruleIdx) => {
        const updated = [...form.rules]
        const comboItems = [...(updated[ruleIdx].buyComboGetYRule.comboItems || []), { itemCode: '', requiredQty: 1 }]
        updated[ruleIdx] = { ...updated[ruleIdx], buyComboGetYRule: { ...updated[ruleIdx].buyComboGetYRule, comboItems } }
        updateField('rules', updated)
    }
    const updateComboItem = (ruleIdx, itemIdx, field, value) => {
        const updated = [...form.rules]
        const comboItems = [...updated[ruleIdx].buyComboGetYRule.comboItems]
        comboItems[itemIdx] = { ...comboItems[itemIdx], [field]: value }
        updated[ruleIdx] = { ...updated[ruleIdx], buyComboGetYRule: { ...updated[ruleIdx].buyComboGetYRule, comboItems } }
        updateField('rules', updated)
    }
    const removeComboItem = (ruleIdx, itemIdx) => {
        const updated = [...form.rules]
        const comboItems = updated[ruleIdx].buyComboGetYRule.comboItems.filter((_, i) => i !== itemIdx)
        updated[ruleIdx] = { ...updated[ruleIdx], buyComboGetYRule: { ...updated[ruleIdx].buyComboGetYRule, comboItems } }
        updateField('rules', updated)
    }

    /* ── Entitlement management ── */
    const addEntitlement = () => {
        updateField('entitlements', [...form.entitlements, { entitlementType: 'PUBLIC', referenceId: '', usageLimitPerCustomer: null }])
    }
    const updateEntitlement = (idx, field, value) => {
        const updated = [...form.entitlements]
        updated[idx] = { ...updated[idx], [field]: value }
        updateField('entitlements', updated)
    }
    const removeEntitlement = (idx) => updateField('entitlements', form.entitlements.filter((_, i) => i !== idx))

    /* ── Submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name) { setError('Name is required'); return }
        if (!form.validFrom || !form.validTo) { setError('Valid from and to dates are required'); return }

        setSubmitting(true); setError(''); setSuccessMsg('')
        try {
            const isBuyComboByRule = (r) => r.discountType === 'BUY_COMBO_GET_Y'
            const payload = {
                name: form.name,
                description: form.description || null,
                status: form.status,
                priority: Number(form.priority),
                combinationMode: form.combinationMode,
                calculationMode: form.calculationMode,
                validFrom: form.validFrom,
                validTo: form.validTo,
                approvedBy: form.approvedBy || null,
                scope: form.scope,
                scopeIds: form.scopeIds,
                rules: form.rules.map((r, i) => {
                    const isBuyCombo = isBuyComboByRule(r)
                    return {
                        ...r,
                        sequence: r.sequence ?? i + 1,
                        discountValue: isBuyCombo ? null : (Number(r.discountValue) || 0),
                        maxDiscountAmount: r.maxDiscountAmount ? Number(r.maxDiscountAmount) : null,
                        minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : null,
                        minQuantity: r.minQuantity ? Number(r.minQuantity) : null,
                        minLineTotal: r.minLineTotal ? Number(r.minLineTotal) : null,
                        minLineUnitPrice: r.minLineUnitPrice ? Number(r.minLineUnitPrice) : null,
                        conditions: (r.conditions || []).map(c => ({ ...c })),
                        tiers: (r.tiers || []).map(t => ({
                            ...t,
                            minValue: Number(t.minValue) || 0,
                            maxValue: t.maxValue ? Number(t.maxValue) : null,
                            discountValue: Number(t.discountValue) || 0,
                        })),
                        buyXGetYRule: (isBuyCombo || !r.buyXGetYRule) ? null : {
                            ...r.buyXGetYRule,
                            buyQuantity: Number(r.buyXGetYRule.buyQuantity) || 1,
                            getQuantity: Number(r.buyXGetYRule.getQuantity) || 1,
                            getDiscountPercentage: Number(r.buyXGetYRule.getDiscountPercentage) || 100,
                            buyProductIds: typeof r.buyXGetYRule.buyProductIds === 'string'
                                ? r.buyXGetYRule.buyProductIds.split(',').map(s => s.trim()).filter(Boolean)
                                : (r.buyXGetYRule.buyProductIds || []),
                            getProductIds: typeof r.buyXGetYRule.getProductIds === 'string'
                                ? r.buyXGetYRule.getProductIds.split(',').map(s => s.trim()).filter(Boolean)
                                : (r.buyXGetYRule.getProductIds || []),
                        },
                        buyComboGetYRule: (!isBuyCombo || !r.buyComboGetYRule) ? null : {
                            ...r.buyComboGetYRule,
                            getQuantity: Number(r.buyComboGetYRule.getQuantity) || 1,
                            getDiscountPercentage: Number(r.buyComboGetYRule.getDiscountPercentage) || 100,
                            getProductIds: typeof r.buyComboGetYRule.getProductIds === 'string'
                                ? r.buyComboGetYRule.getProductIds.split(',').map(s => s.trim()).filter(Boolean)
                                : (r.buyComboGetYRule.getProductIds || []),
                            comboItems: (r.buyComboGetYRule.comboItems || [])
                                .map(ci => ({ itemCode: ci.itemCode, requiredQty: Number(ci.requiredQty) || 1 }))
                                .filter(ci => ci.itemCode)
                        },
                        rtcTiers: r.discountType === 'REDUCE_TO_CLEAR'
                            ? (r.rtcTiers || []).map((t, ti) => ({
                                sequence: t.sequence ?? ti + 1,
                                fromTime: t.fromTime,
                                toTime: t.toTime,
                                discountType: t.discountType,
                                discountValue: Number(t.discountValue) || 0,
                            }))
                            : []
                    }
                }),
                entitlements: form.entitlements.map(ent => ({
                    ...ent,
                    usageLimitPerCustomer: ent.usageLimitPerCustomer ? Number(ent.usageLimitPerCustomer) : null,
                })),
            }
            await onSubmit(payload, isEdit)
            setSuccessMsg('Saved successfully!')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const tabs = [
        { key: 'general', label: 'General' },
        { key: 'rules', label: `Rules (${form.rules.length})` },
        { key: 'entitlements', label: `Entitlements (${form.entitlements.length})` },
    ]

    return (
        <div className="org-modal-overlay">
            <div className="disc-modal-large" onClick={e => e.stopPropagation()}>
                <div className="org-modal-header">
                    <div className="org-modal-title-row">
                        <PercentSvgIcon />
                        <h3 className="org-modal-title">{isEdit ? 'Edit Discount Scheme' : 'Create Discount Scheme'}</h3>
                    </div>
                    <button className="org-settings-close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <div className="disc-modal-tabs">
                    {tabs.map(t => (
                        <button key={t.key}
                            className={`disc-modal-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >{t.label}</button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="disc-modal-body">
                    {error && <div className="org-form-error">{error}</div>}
                    {successMsg && <div className="org-save-msg success">{successMsg}</div>}

                    {/* ── General Tab ── */}
                    {activeTab === 'general' && (
                        <div className="disc-tab-content">
                            <div className="org-form-grid">
                                <FormField label="Name" required>
                                    <input type="text" className="org-form-input" value={form.name}
                                        onChange={e => updateField('name', e.target.value)} placeholder="e.g. Ramadan Promotion" />
                                </FormField>
                                <FormField label="Status">
                                    <select className="org-form-input" value={form.status} onChange={e => updateField('status', e.target.value)}>
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="Description">
                                <textarea className="org-form-input disc-textarea" value={form.description}
                                    onChange={e => updateField('description', e.target.value)} placeholder="Describe the discount scheme..." rows={2} />
                            </FormField>

                            <div className="org-form-grid three-col">
                                <FormField label="Priority">
                                    <input type="number" className="org-form-input" value={form.priority}
                                        onChange={e => updateField('priority', e.target.value)} min={1} />
                                </FormField>
                                <FormField label="Combination Mode">
                                    <select className="org-form-input" value={form.combinationMode} onChange={e => updateField('combinationMode', e.target.value)}>
                                        {COMBINATION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Calculation Mode">
                                    <select className="org-form-input" value={form.calculationMode} onChange={e => updateField('calculationMode', e.target.value)}>
                                        {CALCULATION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <div className="org-form-grid">
                                <FormField label="Valid From" required>
                                    <input type="datetime-local" className="org-form-input" value={form.validFrom}
                                        onChange={e => updateField('validFrom', e.target.value)} />
                                </FormField>
                                <FormField label="Valid To" required>
                                    <input type="datetime-local" className="org-form-input" value={form.validTo}
                                        onChange={e => updateField('validTo', e.target.value)} />
                                </FormField>
                            </div>

                            <div className="org-form-grid">
                                <FormField label="Scope">
                                    <select className="org-form-input" value={form.scope} onChange={e => handleScopeChange(e.target.value)}>
                                        {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Approved By">
                                    <input type="text" className="org-form-input" value={form.approvedBy}
                                        onChange={e => updateField('approvedBy', e.target.value)} placeholder="Approver name" />
                                </FormField>
                            </div>

                            <div className="org-form-grid">
                                {(form.scope === 'POS_GROUP' || form.scope === 'POS_TERMINAL') && (
                                    <FormField label={form.scope === 'POS_GROUP' ? 'POS Groups' : 'POS Terminals'}>
                                        <MultiSelectDropdown
                                            options={scopeIdOptions}
                                            value={form.scopeIds}
                                            onChange={ids => updateField('scopeIds', ids)}
                                            placeholder={`Select ${form.scope === 'POS_GROUP' ? 'groups' : 'terminals'}...`}
                                        />
                                    </FormField>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Rules Tab ── */}
                    {activeTab === 'rules' && (
                        <div className="disc-tab-content">
                            <div className="disc-section-header">
                                <span>Discount Rules</span>
                                <button type="button" className="toolbar-btn small primary" onClick={addRule}>
                                    <PlusIcon /> Add Rule
                                </button>
                            </div>

                            {form.rules.length === 0 && <p className="disc-empty-text">No rules yet. Add one to define how discounts are calculated.</p>}

                            {form.rules.map((rule, ri) => (
                                <div key={ri} className="disc-rule-editor">
                                    <div className="disc-rule-editor-header">
                                        <div className="disc-rule-editor-title-group">
                                            <span className="disc-rule-badge">Rule {ri + 1}</span>
                                            {rule.name && <span className="disc-rule-name-preview">{rule.name}</span>}
                                            <span className="disc-rule-chip disc-rule-chip-type">{rule.discountType}</span>
                                            {(rule.conditions?.length || 0) > 0 && (
                                                <span className="disc-rule-chip">
                                                    {rule.conditions.length} condition{rule.conditions.length === 1 ? '' : 's'}
                                                </span>
                                            )}
                                        </div>
                                        <button type="button" className="toolbar-btn small danger" onClick={() => removeRule(ri)} title="Remove rule">
                                            <TrashIcon />
                                        </button>
                                    </div>

                                    <div className="org-form-grid">
                                        <FormField label="Name">
                                            <input type="text" className="org-form-input" value={rule.name}
                                                onChange={e => updateRule(ri, 'name', e.target.value)} placeholder="Rule name" />
                                        </FormField>
                                        <FormField label="Sequence">
                                            <input type="number" className="org-form-input" value={rule.sequence}
                                                onChange={e => updateRule(ri, 'sequence', Number(e.target.value))} min={1} />
                                        </FormField>
                                    </div>

                                    <div className="org-form-grid three-col">
                                        <FormField label="Discount Type">
                                            <select className="org-form-input" value={rule.discountType} onChange={e => updateRule(ri, 'discountType', e.target.value)}>
                                                {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </FormField>
                                        <FormField label="Discount Value">
                                            <input type="number" className="org-form-input" value={rule.discountValue}
                                                onChange={e => updateRule(ri, 'discountValue', e.target.value)} step="0.01" />
                                        </FormField>
                                        <FormField label="Apply To">
                                            <select className="org-form-input" value={rule.applyTo} onChange={e => updateRule(ri, 'applyTo', e.target.value)}>
                                                {APPLY_TO.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </FormField>
                                    </div>

                                    <div className="org-form-grid four-col">
                                        <FormField label="Max Discount">
                                            <input type="number" className="org-form-input" value={rule.maxDiscountAmount || ''}
                                                onChange={e => updateRule(ri, 'maxDiscountAmount', e.target.value)} step="0.01" placeholder="No limit" />
                                        </FormField>
                                        <FormField label="Min Order Amount">
                                            <input type="number" className="org-form-input" value={rule.minOrderAmount || ''}
                                                onChange={e => updateRule(ri, 'minOrderAmount', e.target.value)} step="0.01" placeholder="None" />
                                        </FormField>
                                        <FormField label="Min Quantity">
                                            <input type="number" className="org-form-input" value={rule.minQuantity || ''}
                                                onChange={e => updateRule(ri, 'minQuantity', e.target.value)} placeholder="None" />
                                        </FormField>
                                        <FormField label="Rounding">
                                            <select className="org-form-input" value={rule.roundingRule} onChange={e => updateRule(ri, 'roundingRule', e.target.value)}>
                                                {ROUNDING_RULES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </FormField>
                                    </div>

                                    <div className="org-form-grid three-col">
                                        <FormField label="Min Line Total">
                                            <input type="number" className="org-form-input" value={rule.minLineTotal || ''}
                                                onChange={e => updateRule(ri, 'minLineTotal', e.target.value)} step="0.01" placeholder="None" />
                                        </FormField>
                                        <FormField label="Min Line Unit Price">
                                            <input type="number" className="org-form-input" value={rule.minLineUnitPrice || ''}
                                                onChange={e => updateRule(ri, 'minLineUnitPrice', e.target.value)} step="0.01" placeholder="None" />
                                        </FormField>
                                    </div>

                                    {/* Conditions */}
                                    <div className="disc-sub-section">
                                        <div className="disc-section-header small">
                                            <span>Conditions ({rule.conditions?.length || 0})</span>
                                            <button type="button" className="toolbar-btn tiny" onClick={() => addCondition(ri)}>
                                                <PlusIcon /> Add
                                            </button>
                                        </div>
                                        {(rule.conditions || []).length === 0 ? (
                                            <p className="disc-empty-text">No conditions — rule applies to every transaction.</p>
                                        ) : (
                                            <div className="disc-conditions-list">
                                                {(rule.conditions || []).map((cond, ci) => (
                                                    <div key={ci} className="disc-condition-row">
                                                        {ci > 0 && <span className="disc-condition-and">AND</span>}
                                                        <div className="disc-condition-wrapper">
                                                            <span className="disc-condition-num">#{ci + 1}</span>
                                                            <div className="disc-condition-body">
                                                                <ConditionEditor
                                                                    condition={cond}
                                                                    ruleIdx={ri}
                                                                    condIdx={ci}
                                                                    onUpdate={updateCondition}
                                                                    onRemove={removeCondition}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tiers (for TIERED type) */}
                                    {rule.discountType === 'TIERED' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Tiers ({rule.tiers?.length || 0})</span>
                                                <button type="button" className="toolbar-btn tiny" onClick={() => addTier(ri)}>
                                                    <PlusIcon /> Add
                                                </button>
                                            </div>
                                            {(rule.tiers || []).map((tier, ti) => (
                                                <div key={ti} className="disc-tier-editor">
                                                    <FormField label="Min">
                                                        <input type="number" className="org-form-input small" value={tier.minValue}
                                                            onChange={e => updateTier(ri, ti, 'minValue', e.target.value)} step="0.01" />
                                                    </FormField>
                                                    <FormField label="Max">
                                                        <input type="number" className="org-form-input small" value={tier.maxValue || ''}
                                                            onChange={e => updateTier(ri, ti, 'maxValue', e.target.value)} step="0.01" placeholder="No max" />
                                                    </FormField>
                                                    <FormField label="Type">
                                                        <select className="org-form-input small" value={tier.discountType}
                                                            onChange={e => updateTier(ri, ti, 'discountType', e.target.value)}>
                                                            {DISCOUNT_TYPES.filter(t => t !== 'TIERED' && t !== 'BUY_X_GET_Y').map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </FormField>
                                                    <FormField label="Value">
                                                        <input type="number" className="org-form-input small" value={tier.discountValue}
                                                            onChange={e => updateTier(ri, ti, 'discountValue', e.target.value)} step="0.01" />
                                                    </FormField>
                                                    <button type="button" className="toolbar-btn tiny danger disc-tier-remove" onClick={() => removeTier(ri, ti)}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* BuyXGetY (for BUY_X_GET_Y type) */}
                                    {rule.discountType === 'BUY_X_GET_Y' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Buy X Get Y</span>
                                                {!rule.buyXGetYRule ? (
                                                    <button type="button" className="toolbar-btn tiny" onClick={() => toggleBuyXGetY(ri)}>
                                                        <PlusIcon /> Configure
                                                    </button>
                                                ) : (
                                                    <button type="button" className="toolbar-btn tiny danger" onClick={() => toggleBuyXGetY(ri)}>
                                                        <TrashIcon /> Remove
                                                    </button>
                                                )}
                                            </div>
                                            {rule.buyXGetYRule && (
                                                <div className="disc-bxgy-editor">
                                                    {/* ── Stage 1: Buy ── */}
                                                    <div className="disc-bxgy-stage buy">
                                                        <div className="disc-bxgy-stage-header">
                                                            <span className="disc-bxgy-stage-label">
                                                                <span className="disc-bxgy-stage-num">1</span>
                                                                Customer must buy
                                                            </span>
                                                        </div>
                                                        <div className="org-form-grid three-col">
                                                            <FormField label="Buy Quantity" required>
                                                                <input type="number" className="org-form-input" value={rule.buyXGetYRule.buyQuantity}
                                                                    onChange={e => updateBuyXGetY(ri, 'buyQuantity', e.target.value)} min={1} />
                                                            </FormField>
                                                            <FormField label="Buy Scope" required>
                                                                <select className="org-form-input" value={rule.buyXGetYRule.buyScope}
                                                                    onChange={e => updateBuyXGetY(ri, 'buyScope', e.target.value)}>
                                                                    {BUY_X_GET_Y_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            </FormField>
                                                        </div>
                                                        {rule.buyXGetYRule.buyScope !== 'CHEAPEST_IN_BASKET' && (() => {
                                                            const isCategory = rule.buyXGetYRule.buyScope === 'CATEGORY'
                                                            const label = isCategory ? 'Buy Category Codes' : 'Buy Product IDs'
                                                            const placeholder = isCategory ? 'Select buy categories' : 'Select buy products'
                                                            const loader = isCategory ? getDiscountCategories : getDiscountProductsEnriched
                                                            const cols = isCategory ? CATEGORY_LOOKUP_COLUMNS : PRODUCT_LOOKUP_COLUMNS
                                                            return (
                                                                <FormField label={label} hint="Comma-separated">
                                                                    <div className="disc-lookup-value">
                                                                        <input type="text" className="org-form-input"
                                                                            value={Array.isArray(rule.buyXGetYRule.buyProductIds) ? rule.buyXGetYRule.buyProductIds.join(', ') : rule.buyXGetYRule.buyProductIds || ''}
                                                                            onChange={e => updateBuyXGetY(ri, 'buyProductIds', e.target.value)} />
                                                                        <LookupPicker
                                                                            value={Array.isArray(rule.buyXGetYRule.buyProductIds) ? rule.buyXGetYRule.buyProductIds.join(',') : rule.buyXGetYRule.buyProductIds || ''}
                                                                            onChange={v => updateBuyXGetY(ri, 'buyProductIds', v)}
                                                                            placeholder={placeholder}
                                                                            loader={() => loader()}
                                                                            columns={cols}
                                                                            title={`Pick buy ${isCategory ? 'categories' : 'products'}`}
                                                                        />
                                                                    </div>
                                                                </FormField>
                                                            )
                                                        })()}
                                                    </div>

                                                    {/* ── Arrow connector ── */}
                                                    <div className="disc-bxgy-arrow">
                                                        <span className="disc-bxgy-arrow-line" />
                                                        <span className="disc-bxgy-arrow-label">THEN GET</span>
                                                        <span className="disc-bxgy-arrow-line" />
                                                    </div>

                                                    {/* ── Stage 2: Get ── */}
                                                    <div className="disc-bxgy-stage get">
                                                        <div className="disc-bxgy-stage-header">
                                                            <span className="disc-bxgy-stage-label">
                                                                <span className="disc-bxgy-stage-num">2</span>
                                                                Customer receives reward
                                                            </span>
                                                        </div>
                                                        <div className="org-form-grid three-col">
                                                            <FormField label="Reward Quantity" required>
                                                                <input type="number" className="org-form-input" value={rule.buyXGetYRule.getQuantity}
                                                                    onChange={e => updateBuyXGetY(ri, 'getQuantity', e.target.value)} min={1} />
                                                            </FormField>
                                                            <FormField label="Reward Scope" required>
                                                                <select className="org-form-input" value={rule.buyXGetYRule.getScope}
                                                                    onChange={e => updateBuyXGetY(ri, 'getScope', e.target.value)}>
                                                                    {BUY_X_GET_Y_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            </FormField>
                                                            <FormField label="Reward Discount %" required>
                                                                <input type="number" className="org-form-input" value={rule.buyXGetYRule.getDiscountPercentage}
                                                                    onChange={e => updateBuyXGetY(ri, 'getDiscountPercentage', e.target.value)} step="0.01" max={100} />
                                                            </FormField>
                                                        </div>
                                                        {rule.buyXGetYRule.getScope !== 'CHEAPEST_IN_BASKET' && (() => {
                                                            const isCategory = rule.buyXGetYRule.getScope === 'CATEGORY'
                                                            const label = isCategory ? 'Reward Category Codes' : 'Reward Product IDs'
                                                            const placeholder = isCategory ? 'Select reward categories' : 'Select reward products'
                                                            const loader = isCategory ? getDiscountCategories : getDiscountProductsEnriched
                                                            const cols = isCategory ? CATEGORY_LOOKUP_COLUMNS : PRODUCT_LOOKUP_COLUMNS
                                                            return (
                                                                <FormField label={label} hint="Comma-separated">
                                                                    <div className="disc-lookup-value">
                                                                        <input type="text" className="org-form-input"
                                                                            value={Array.isArray(rule.buyXGetYRule.getProductIds) ? rule.buyXGetYRule.getProductIds.join(', ') : rule.buyXGetYRule.getProductIds || ''}
                                                                            onChange={e => updateBuyXGetY(ri, 'getProductIds', e.target.value)} />
                                                                        <LookupPicker
                                                                            value={Array.isArray(rule.buyXGetYRule.getProductIds) ? rule.buyXGetYRule.getProductIds.join(',') : rule.buyXGetYRule.getProductIds || ''}
                                                                            onChange={v => updateBuyXGetY(ri, 'getProductIds', v)}
                                                                            placeholder={placeholder}
                                                                            loader={() => loader()}
                                                                            columns={cols}
                                                                            title={`Pick reward ${isCategory ? 'categories' : 'products'}`}
                                                                        />
                                                                    </div>
                                                                </FormField>
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* RTC Time Tiers (for REDUCE_TO_CLEAR type) */}
                                    {rule.discountType === 'REDUCE_TO_CLEAR' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Time Windows ({rule.rtcTiers?.length || 0})</span>
                                                <button type="button" className="toolbar-btn tiny" onClick={() => addRtcTier(ri)}>
                                                    <PlusIcon /> Add Window
                                                </button>
                                            </div>
                                            <p className="disc-form-hint" style={{ marginBottom: 8 }}>
                                                Each window applies a different discount in its time range. Evaluated in sequence order — first match wins.
                                            </p>
                                            {(rule.rtcTiers || []).map((tier, ti) => (
                                                <div key={ti} className="disc-tier-editor">
                                                    <FormField label="Seq">
                                                        <input type="number" className="org-form-input small" value={tier.sequence}
                                                            onChange={e => updateRtcTier(ri, ti, 'sequence', Number(e.target.value))} min={1} />
                                                    </FormField>
                                                    <FormField label="From">
                                                        <input type="time" className="org-form-input small" value={tier.fromTime}
                                                            onChange={e => updateRtcTier(ri, ti, 'fromTime', e.target.value)} />
                                                    </FormField>
                                                    <FormField label="To">
                                                        <input type="time" className="org-form-input small" value={tier.toTime}
                                                            onChange={e => updateRtcTier(ri, ti, 'toTime', e.target.value)} />
                                                    </FormField>
                                                    <FormField label="Type">
                                                        <select className="org-form-input small" value={tier.discountType}
                                                            onChange={e => updateRtcTier(ri, ti, 'discountType', e.target.value)}>
                                                            <option value="PERCENTAGE">PERCENTAGE</option>
                                                            <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                                                        </select>
                                                    </FormField>
                                                    <FormField label="Value">
                                                        <input type="number" className="org-form-input small" value={tier.discountValue}
                                                            onChange={e => updateRtcTier(ri, ti, 'discountValue', e.target.value)} step="0.01" />
                                                    </FormField>
                                                    <button type="button" className="toolbar-btn tiny danger disc-tier-remove" onClick={() => removeRtcTier(ri, ti)}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            ))}
                                            {(rule.rtcTiers || []).length === 0 && (
                                                <p className="disc-empty-text">No time windows yet. Add one to define when each discount applies.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* BuyComboGetY (for BUY_COMBO_GET_Y type) */}
                                    {rule.discountType === 'BUY_COMBO_GET_Y' && (
                                        <div className="disc-sub-section">
                                            <div className="disc-section-header small">
                                                <span>Buy Combo Get Y</span>
                                                {!rule.buyComboGetYRule ? (
                                                    <button type="button" className="toolbar-btn tiny" onClick={() => toggleBuyComboGetY(ri)}>
                                                        <PlusIcon /> Configure
                                                    </button>
                                                ) : (
                                                    <button type="button" className="toolbar-btn tiny danger" onClick={() => toggleBuyComboGetY(ri)}>
                                                        <TrashIcon /> Remove
                                                    </button>
                                                )}
                                            </div>
                                            {rule.buyComboGetYRule && (
                                                <div className="disc-bxgy-editor">
                                                    {/* ── Stage 1: Buy ── */}
                                                    <div className="disc-bxgy-stage buy">
                                                        <div className="disc-bxgy-stage-header">
                                                            <span className="disc-bxgy-stage-label">
                                                                <span className="disc-bxgy-stage-num">1</span>
                                                                Customer buys these together
                                                            </span>
                                                            <button type="button" className="toolbar-btn tiny" onClick={() => addComboItem(ri)}>
                                                                <PlusIcon /> Add Item
                                                            </button>
                                                        </div>
                                                        {(rule.buyComboGetYRule.comboItems || []).length === 0 && (
                                                            <p className="disc-empty-text">No combo items yet.</p>
                                                        )}
                                                        {(rule.buyComboGetYRule.comboItems || []).map((item, idx) => (
                                                            <div key={idx} className="disc-combo-item-row">
                                                                <span className="disc-combo-item-badge">#{idx + 1}</span>
                                                                <FormField label="Item Code" required>
                                                                    <div className="disc-lookup-value">
                                                                        <input type="text" className="org-form-input" value={item.itemCode}
                                                                            onChange={e => updateComboItem(ri, idx, 'itemCode', e.target.value)} placeholder="ITEM-A" />
                                                                        <LookupPicker
                                                                            value={item.itemCode || ''}
                                                                            onChange={v => updateComboItem(ri, idx, 'itemCode', v)}
                                                                            placeholder="Select product"
                                                                            loader={() => getDiscountProductsEnriched()}
                                                                            columns={PRODUCT_LOOKUP_COLUMNS}
                                                                            singleSelect
                                                                            title="Pick product"
                                                                        />
                                                                    </div>
                                                                </FormField>
                                                                <FormField label="Required Qty" required>
                                                                    <input type="number" className="org-form-input" value={item.requiredQty}
                                                                        onChange={e => updateComboItem(ri, idx, 'requiredQty', e.target.value)} min={1} />
                                                                </FormField>
                                                                <button type="button" className="toolbar-btn tiny danger disc-combo-item-remove" onClick={() => removeComboItem(ri, idx)} title="Remove item">
                                                                    <TrashIcon />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* ── Arrow connector ── */}
                                                    <div className="disc-bxgy-arrow">
                                                        <span className="disc-bxgy-arrow-line" />
                                                        <span className="disc-bxgy-arrow-label">THEN GET</span>
                                                        <span className="disc-bxgy-arrow-line" />
                                                    </div>

                                                    {/* ── Stage 2: Get ── */}
                                                    <div className="disc-bxgy-stage get">
                                                        <div className="disc-bxgy-stage-header">
                                                            <span className="disc-bxgy-stage-label">
                                                                <span className="disc-bxgy-stage-num">2</span>
                                                                Customer receives reward
                                                            </span>
                                                        </div>
                                                        <div className="org-form-grid three-col">
                                                            <FormField label="Reward Quantity" required>
                                                                <input type="number" className="org-form-input" value={rule.buyComboGetYRule.getQuantity}
                                                                    onChange={e => updateBuyComboGetY(ri, 'getQuantity', e.target.value)} min={1} />
                                                            </FormField>
                                                            <FormField label="Reward Scope" required>
                                                                <select className="org-form-input" value={rule.buyComboGetYRule.getScope}
                                                                    onChange={e => updateBuyComboGetY(ri, 'getScope', e.target.value)}>
                                                                    {BUY_COMBO_GET_Y_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            </FormField>
                                                            <FormField label="Reward Discount %" required>
                                                                <input type="number" className="org-form-input" value={rule.buyComboGetYRule.getDiscountPercentage}
                                                                    onChange={e => updateBuyComboGetY(ri, 'getDiscountPercentage', e.target.value)} step="0.01" max={100} />
                                                            </FormField>
                                                        </div>
                                                        {rule.buyComboGetYRule.getScope !== 'CHEAPEST_IN_BASKET' && (() => {
                                                            const isCategory = rule.buyComboGetYRule.getScope === 'CATEGORY'
                                                            const label = isCategory ? 'Reward Category Codes' : 'Reward Product IDs'
                                                            const placeholder = isCategory ? 'Select categories' : 'Select products'
                                                            const loader = isCategory ? getDiscountCategories : getDiscountProductsEnriched
                                                            const cols = isCategory ? CATEGORY_LOOKUP_COLUMNS : PRODUCT_LOOKUP_COLUMNS
                                                            return (
                                                                <FormField label={label} hint="Comma-separated">
                                                                    <div className="disc-lookup-value">
                                                                        <input type="text" className="org-form-input"
                                                                            value={Array.isArray(rule.buyComboGetYRule.getProductIds) ? rule.buyComboGetYRule.getProductIds.join(', ') : rule.buyComboGetYRule.getProductIds || ''}
                                                                            onChange={e => updateBuyComboGetY(ri, 'getProductIds', e.target.value)} />
                                                                        <LookupPicker
                                                                            value={Array.isArray(rule.buyComboGetYRule.getProductIds) ? rule.buyComboGetYRule.getProductIds.join(',') : rule.buyComboGetYRule.getProductIds || ''}
                                                                            onChange={v => updateBuyComboGetY(ri, 'getProductIds', v)}
                                                                            placeholder={placeholder}
                                                                            loader={() => loader()}
                                                                            columns={cols}
                                                                            title={`Pick ${isCategory ? 'categories' : 'products'}`}
                                                                        />
                                                                    </div>
                                                                </FormField>
                                                            )
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Entitlements Tab ── */}
                    {activeTab === 'entitlements' && (
                        <div className="disc-tab-content">
                            <div className="disc-section-header">
                                <span>Entitlements</span>
                                <button type="button" className="toolbar-btn small primary" onClick={addEntitlement}>
                                    <PlusIcon /> Add Entitlement
                                </button>
                            </div>

                            {form.entitlements.length === 0 && <p className="disc-empty-text">No entitlements. Add one to control who can use this discount.</p>}

                            {form.entitlements.map((ent, ei) => (
                                <div key={ei} className="disc-entitlement-editor">
                                    <div className="org-form-grid three-col">
                                        <FormField label="Type">
                                            <select className="org-form-input" value={ent.entitlementType}
                                                onChange={e => updateEntitlement(ei, 'entitlementType', e.target.value)}>
                                                {ENTITLEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </FormField>
                                        {ent.entitlementType !== 'PUBLIC' && (
                                            <FormField label="Reference ID" hint={ent.entitlementType === 'COUPON' ? 'Coupon code' : 'Customer/Group ID'}>
                                                <input type="text" className="org-form-input" value={ent.referenceId || ''}
                                                    onChange={e => updateEntitlement(ei, 'referenceId', e.target.value)} />
                                            </FormField>
                                        )}
                                        <FormField label="Usage Limit / Customer">
                                            <input type="number" className="org-form-input" value={ent.usageLimitPerCustomer || ''}
                                                onChange={e => updateEntitlement(ei, 'usageLimitPerCustomer', e.target.value)} placeholder="Unlimited" min={1} />
                                        </FormField>
                                    </div>
                                    <button type="button" className="toolbar-btn tiny danger" onClick={() => removeEntitlement(ei)}>
                                        <TrashIcon /> Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="org-modal-actions">
                        <button type="button" className="toolbar-btn" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="toolbar-btn primary" disabled={submitting}>
                            {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Scheme')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
