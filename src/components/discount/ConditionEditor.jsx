import { CONDITION_TYPES, CONDITION_OPERATORS, CONDITION_TYPE_OPERATORS, CONDITION_VALUE_HINTS, isOperatorAllowed, getDefaultOperator } from './constants'
import { TrashIcon } from './Icons'
import MultiSelectDropdown from './MultiSelectDropdown'
import LookupPicker from './LookupPicker'
import {
    getDiscountProductsEnriched,
    getDiscountCategories,
    getDiscountCustomerGroups,
    getDiscountPaymentMethodsFlat,
} from '../../service/discountLookups'

const LOOKUP_CONFIGS = {
    PRODUCT: {
        placeholder: 'Select products',
        loader: () => getDiscountProductsEnriched(),
        columns: [
            { key: 'itemCode', label: 'Code' },
            { key: 'itemName', label: 'Name' },
            { key: 'itmsGrpCod', label: 'Cat Code' },
            { key: 'categoryName', label: 'Category' },
        ],
    },
    CATEGORY: {
        placeholder: 'Select categories',
        loader: () => getDiscountCategories(),
        columns: [
            { key: 'itmsGrpCod', label: 'Code' },
            { key: 'itmsGrpNam', label: 'Name' },
        ],
    },
    CUSTOMER_GROUP: {
        placeholder: 'Select customer groups',
        loader: () => getDiscountCustomerGroups(),
        columns: [
            { key: 'groupCode', label: 'Code' },
            { key: 'groupName', label: 'Name' },
        ],
    },
    PAYMENT_METHOD: {
        placeholder: 'Select payment methods',
        loader: () => getDiscountPaymentMethodsFlat(),
        columns: [
            { key: 'code', label: 'Code' },
            { key: 'description', label: 'Name' },
            { key: 'paymentType', label: 'Type' },
            { key: 'paymentGroupCode', label: 'Group' },
        ],
    },
}

const TIME_VALUE_PATTERN = /^\d{2}:\d{2}$/
const getSafeTimeValue = value => TIME_VALUE_PATTERN.test(value) ? value : ''
const DAY_OPTIONS = [
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
    { value: 'SUNDAY', label: 'Sunday' },
]

/* ═══════════════════════════════════════════════════
   Condition Editor
   ═══════════════════════════════════════════════════
   Renders the condition type, operator, and value inputs.
   Operators that are not supported by the selected condition type
   are shown but rendered as disabled (unselectable).
   When the condition type changes, the operator auto-resets
   to the first valid operator for that type.
*/
export default function ConditionEditor({ condition, ruleIdx, condIdx, onUpdate, onRemove }) {
    const allowedOps = CONDITION_TYPE_OPERATORS[condition.conditionType] || []
    const hasOperators = allowedOps.length > 0
    const hint = CONDITION_VALUE_HINTS[condition.conditionType] || ''
    const isTimeOfDay = condition.conditionType === 'TIME_OF_DAY'
    const isDayOfWeek = condition.conditionType === 'DAY_OF_WEEK'
    const isBetweenTime = isTimeOfDay && condition.operator === 'BETWEEN'
    const timeParts = String(condition.value || '').split(',')
    const timeFrom = getSafeTimeValue(timeParts[0] || '')
    const timeTo = getSafeTimeValue(timeParts[1] || '')
    const selectedDays = String(condition.value || '')
        .split(',')
        .map(day => day.trim().toUpperCase())
        .filter(day => DAY_OPTIONS.some(option => option.value === day))
    const valueDisabled = condition.conditionType === 'FIRST_PURCHASE'

    // When conditionType changes, reset operator (if invalid for the new type) and always clear value
    const handleConditionTypeChange = (newType) => {
        onUpdate(ruleIdx, condIdx, 'conditionType', newType)
        const newDefault = getDefaultOperator(newType)
        if (!isOperatorAllowed(newType, condition.operator)) {
            onUpdate(ruleIdx, condIdx, 'operator', newDefault)
        }
        onUpdate(ruleIdx, condIdx, 'value', '')
    }

    const handleOperatorChange = (newOperator) => {
        onUpdate(ruleIdx, condIdx, 'operator', newOperator)

        if (!isTimeOfDay) return

        if (newOperator === 'BETWEEN') {
            onUpdate(ruleIdx, condIdx, 'value', `${timeFrom}${timeTo ? `,${timeTo}` : ','}`)
            return
        }

        if (condition.operator === 'BETWEEN') {
            onUpdate(ruleIdx, condIdx, 'value', timeFrom)
        }
    }

    const updateTimePart = (partIdx, newValue) => {
        const nextParts = [timeFrom, timeTo]
        nextParts[partIdx] = newValue
        onUpdate(ruleIdx, condIdx, 'value', nextParts.join(','))
    }

    const updateSelectedDays = days => {
        onUpdate(ruleIdx, condIdx, 'value', days.join(','))
    }

    const formatDayTriggerLabel = days => {
        if (days.length === 0) return 'Select days...'
        if (days.length === DAY_OPTIONS.length) return 'All days selected'
        return `${days.length} day${days.length === 1 ? '' : 's'} selected`
    }

    const renderValueInput = () => {
        if (isDayOfWeek) {
            return (
                <div className="disc-condition-value">
                    <MultiSelectDropdown
                        options={DAY_OPTIONS}
                        value={selectedDays}
                        onChange={updateSelectedDays}
                        placeholder="Select days..."
                        formatTriggerLabel={formatDayTriggerLabel}
                    />
                </div>
            )
        }

        if (isBetweenTime) {
            return (
                <div className="disc-time-range-inputs" title={hint}>
                    <input
                        type="time"
                        className="org-form-input small"
                        value={timeFrom}
                        onChange={e => updateTimePart(0, e.target.value)}
                    />
                    <span className="disc-time-range-separator">to</span>
                    <input
                        type="time"
                        className="org-form-input small"
                        value={timeTo}
                        onChange={e => updateTimePart(1, e.target.value)}
                    />
                </div>
            )
        }

        if (isTimeOfDay) {
            return (
                <input
                    type="time"
                    className="org-form-input small"
                    value={timeFrom}
                    onChange={e => onUpdate(ruleIdx, condIdx, 'value', e.target.value)}
                    title={hint}
                />
            )
        }

        const lookupConfig = LOOKUP_CONFIGS[condition.conditionType]
        if (lookupConfig) {
            return (
                <div className="disc-lookup-value">
                    <input type="text" className="org-form-input small" value={condition.value || ''}
                        onChange={e => onUpdate(ruleIdx, condIdx, 'value', e.target.value)}
                        placeholder={hint || 'Value'}
                        disabled={valueDisabled}
                        title={hint}
                    />
                    <LookupPicker
                        value={condition.value || ''}
                        onChange={v => onUpdate(ruleIdx, condIdx, 'value', v)}
                        placeholder={lookupConfig.placeholder}
                        loader={lookupConfig.loader}
                        columns={lookupConfig.columns}
                        disabled={valueDisabled}
                        title={`Pick ${condition.conditionType.toLowerCase()}`}
                    />
                </div>
            )
        }

        return (
            <input type="text" className="org-form-input small" value={condition.value || ''}
                onChange={e => onUpdate(ruleIdx, condIdx, 'value', e.target.value)}
                placeholder={hint || 'Value'}
                disabled={valueDisabled}
                title={hint}
            />
        )
    }

    return (
        <div className="disc-condition-editor">
            {/* Condition Type */}
            <select className="org-form-input small" value={condition.conditionType}
                onChange={e => handleConditionTypeChange(e.target.value)}>
                {CONDITION_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>

            {/* Operator — show all but disable unsupported ones */}
            <select
                className="org-form-input small"
                value={hasOperators ? condition.operator : ''}
                onChange={e => handleOperatorChange(e.target.value)}
                disabled={!hasOperators}
                title={!hasOperators ? `Operator is ignored for ${condition.conditionType}` : ''}
            >
                {!hasOperators && (
                    <option value="">N/A</option>
                )}
                {CONDITION_OPERATORS.map(op => {
                    const allowed = isOperatorAllowed(condition.conditionType, op)
                    return (
                        <option key={op} value={op} disabled={!allowed}>
                            {op}{!allowed ? ' ✗' : ''}
                        </option>
                    )
                })}
            </select>

            {/* Value */}
            {renderValueInput()}

            <button type="button" className="toolbar-btn tiny danger" onClick={() => onRemove(ruleIdx, condIdx)}>
                <TrashIcon />
            </button>
        </div>
    )
}
