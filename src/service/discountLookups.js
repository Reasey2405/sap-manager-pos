import {
    fetchDiscountProductData,
    fetchDiscountCategoryData,
    fetchDiscountCustomerGroupData,
    fetchDiscountPaymentGroupData,
} from './api'

/* ═══════════════════════════════════════════════════
   Discount lookup data cache
   ═══════════════════════════════════════════════════
   Each getter returns a cached Promise so concurrent
   callers share a single network round-trip. The page
   prefetches all four on mount so pickers open instantly.
*/

let productsPromise = null
let categoriesPromise = null
let customerGroupsPromise = null
let paymentGroupsPromise = null
let productsEnrichedPromise = null
let paymentMethodsFlatPromise = null

export function getDiscountProducts() {
    if (!productsPromise) productsPromise = fetchDiscountProductData().then(d => d || [])
    return productsPromise
}

export function getDiscountCategories() {
    if (!categoriesPromise) categoriesPromise = fetchDiscountCategoryData().then(d => d || [])
    return categoriesPromise
}

export function getDiscountCustomerGroups() {
    if (!customerGroupsPromise) customerGroupsPromise = fetchDiscountCustomerGroupData().then(d => d || [])
    return customerGroupsPromise
}

export function getDiscountPaymentGroups() {
    if (!paymentGroupsPromise) paymentGroupsPromise = fetchDiscountPaymentGroupData().then(d => d || [])
    return paymentGroupsPromise
}

export function getDiscountProductsEnriched() {
    if (!productsEnrichedPromise) {
        productsEnrichedPromise = Promise.all([
            getDiscountProducts(),
            getDiscountCategories(),
        ]).then(([products, categories]) => {
            const catMap = new Map(categories.map(c => [String(c.itmsGrpCod), c.itmsGrpNam]))
            return products.map(p => ({
                ...p,
                categoryName: catMap.get(String(p.itmsGrpCod)) || '',
            }))
        })
    }
    return productsEnrichedPromise
}

export function getDiscountPaymentMethodsFlat() {
    if (!paymentMethodsFlatPromise) {
        paymentMethodsFlatPromise = getDiscountPaymentGroups().then(groups =>
            (groups || []).flatMap(g =>
                (g.paymentMethods || []).map(pm => ({
                    code: pm.code,
                    description: pm.description,
                    paymentType: pm.paymentType,
                    paymentGroupCode: g.code,
                    paymentGroupDescription: g.description,
                }))
            )
        )
    }
    return paymentMethodsFlatPromise
}

export function prefetchDiscountLookups() {
    getDiscountProductsEnriched()
    getDiscountCustomerGroups()
    getDiscountPaymentMethodsFlat()
}

export function resetDiscountLookupCache() {
    productsPromise = null
    categoriesPromise = null
    customerGroupsPromise = null
    paymentGroupsPromise = null
    productsEnrichedPromise = null
    paymentMethodsFlatPromise = null
}
