/* ═══════════════════════════════════════════════════
   Constants / Enum Options
   ═══════════════════════════════════════════════════ */
export const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED']
export const COMBINATION_MODES = ['EXCLUSIVE', 'ADDITIVE', 'BEST_OF']
export const CALCULATION_MODES = ['GROSS', 'NET']
export const SCOPES = ['GLOBAL', 'POS_GROUP', 'POS_TERMINAL']
export const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE', 'TIERED', 'BUY_X_GET_Y', 'BUY_COMBO_GET_Y', 'REDUCE_TO_CLEAR']
export const APPLY_TO = ['TRANSACTION', 'LINE_ITEM', 'CHEAPEST_ITEM']
export const ROUNDING_RULES = ['NEAREST_CENT', 'FLOOR', 'CEILING']
export const CONDITION_TYPES = ['PRODUCT', 'CATEGORY', 'CUSTOMER_GROUP', 'PAYMENT_METHOD', 'TIME_OF_DAY', 'DAY_OF_WEEK', 'QUANTITY_THRESHOLD', 'BASKET_VALUE', 'FIRST_PURCHASE', 'COUPON_CODE']
export const CONDITION_OPERATORS = ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'IN', 'NOT_IN', 'BETWEEN']
export const ENTITLEMENT_TYPES = ['PUBLIC', 'CUSTOMER_GROUP', 'SPECIFIC_CUSTOMER', 'COUPON']
export const COUPON_TYPES = ['SINGLE_USE', 'MULTI_USE', 'ONE_PER_CUSTOMER']
// Backend uses a single BuyXGetYScope enum for both the buy and get sides
// of BUY_X_GET_Y and the get side of BUY_COMBO_GET_Y.
export const BUY_X_GET_Y_SCOPES = ['SPECIFIC_PRODUCT', 'CATEGORY', 'CHEAPEST_IN_BASKET']
export const BUY_COMBO_GET_Y_SCOPES = ['SPECIFIC_PRODUCT', 'CATEGORY', 'CHEAPEST_IN_BASKET']

export const STATUS_COLORS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired'
}

/* ═══════════════════════════════════════════════════
   Condition Type → Allowed Operators Mapping
   ═══════════════════════════════════════════════════
   Each condition type only supports a subset of operators.
   Operators not in this list are shown in UI but disabled.
*/
export const CONDITION_TYPE_OPERATORS = {
    PRODUCT: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'],
    CATEGORY: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'],
    CUSTOMER_GROUP: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'],
    PAYMENT_METHOD: ['EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN'],
    TIME_OF_DAY: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN'],
    DAY_OF_WEEK: [],  // operator is ignored — no valid operators
    QUANTITY_THRESHOLD: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN'],
    BASKET_VALUE: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'BETWEEN'],
    FIRST_PURCHASE: [],  // operator and value are ignored
    COUPON_CODE: [],  // operator is ignored
}

/** Check if a given operator is allowed for a condition type */
export function isOperatorAllowed(conditionType, operator) {
    const allowed = CONDITION_TYPE_OPERATORS[conditionType]
    if (!allowed || allowed.length === 0) return false
    return allowed.includes(operator)
}

/** Get the default (first valid) operator for a condition type, or fallback */
export function getDefaultOperator(conditionType) {
    const allowed = CONDITION_TYPE_OPERATORS[conditionType]
    if (!allowed || allowed.length === 0) return 'EQUALS'
    return allowed[0]
}

/* ═══════════════════════════════════════════════════
   Condition Type Value Hints
   ═══════════════════════════════════════════════════ */
export const CONDITION_VALUE_HINTS = {
    PRODUCT: 'Item code(s), comma-separated for IN/NOT_IN',
    CATEGORY: 'Category code(s), comma-separated for IN/NOT_IN',
    CUSTOMER_GROUP: 'Customer group code',
    PAYMENT_METHOD: 'Payment method code',
    TIME_OF_DAY: 'HH:mm format. For BETWEEN: HH:mm,HH:mm',
    DAY_OF_WEEK: 'e.g. MONDAY,WEDNESDAY,FRIDAY',
    QUANTITY_THRESHOLD: 'Numeric. For BETWEEN: min,max',
    BASKET_VALUE: 'Numeric. For BETWEEN: min,max',
    FIRST_PURCHASE: 'No value needed (auto-evaluated)',
    COUPON_CODE: '"any" for any coupon, or exact coupon code',
}

/* ═══════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════ */
export function formatDate(dt) {
    if (!dt) return '--'
    try {
        const d = new Date(dt)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch { return String(dt) }
}

export function formatDateTime(dt) {
    if (!dt) return '--'
    try {
        const d = new Date(dt)
        return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return String(dt) }
}

export function toLocalInput(dt) {
    if (!dt) return ''
    try {
        const d = new Date(dt)
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch { return '' }
}
