import { getAuthHeaders, getAccessToken, refreshAccessToken, notifySessionExpired } from './auth'

export const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:9988'

/**
 * Wrapper that retries once on 401 by refreshing the token.
 */
export async function fetchWithAuth(url, options = {}) {
    // When the body is FormData let the browser set Content-Type automatically
    // (it must include the multipart boundary). For all other requests use the
    // standard JSON headers.
    const isFormData = options.body instanceof FormData
    options.headers = isFormData
        ? { Authorization: `Bearer ${getAccessToken()}`, Accept: '*/*', ...options.headers }
        : getAuthHeaders(options.headers)

    let res = await fetch(url, options)

    // If 401, try to refresh and retry once
    if (res.status === 401) {
        try {
            await refreshAccessToken()
            options.headers = isFormData
                ? { Authorization: `Bearer ${getAccessToken()}`, Accept: '*/*', ...options.headers }
                : getAuthHeaders(options.headers)
            res = await fetch(url, options)
        } catch {
            notifySessionExpired()
            throw new Error('Session expired')
        }
    }

    return res
}

export async function fetchJSON(url, options = {}) {
    const res = await fetchWithAuth(url, options)
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
    return res.json()
}

export async function fetchText(url, options = {}) {
    const res = await fetchWithAuth(url, options)
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        const err = new Error(text || `GET ${url} failed: ${res.status}`)
        err.status = res.status
        throw err
    }
    return res.text()
}

export async function postJSON(url, body) {
    const options = {
        method: 'POST',
    }
    if (body !== undefined) {
        options.body = JSON.stringify(body)
    }
    const res = await fetchWithAuth(url, options)
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`POST ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

export async function putJSON(url, body) {
    const res = await fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`PUT ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

export async function fetchSapSyncQueue(page, size, status) {
    let url = `${API_BASE}/api/monitoring/sap-invoice-sync-que?page=${page}&size=${size}`
    if (status !== 'ALL') url += `&status=${status}`
    return fetchJSON(url)
}

export async function retrySapSyncQueue(payload) {
    return postJSON(`${API_BASE}/api/monitoring/retry-sap-invoice-sync-que`, payload)
}

export async function fetchSapReturnReceiptSyncQueue(page, size, status) {
    let url = `${API_BASE}/api/monitoring/sap-return-receipt-sync-que?page=${page}&size=${size}`
    if (status !== 'ALL') url += `&status=${status}`
    return fetchJSON(url)
}

export async function retrySapReturnReceiptSyncQueue(payload) {
    return postJSON(`${API_BASE}/api/monitoring/retry-sap-return-receipt-sync-que`, payload)
}

export async function fetchSapFinancialReceiptSyncQueue(page, size, status) {
    let url = `${API_BASE}/api/monitoring/sap-financial-receipt-sync-que?page=${page}&size=${size}`
    if (status !== 'ALL') url += `&status=${status}`
    return fetchJSON(url)
}

export async function retrySapFinancialReceiptSyncQueue(payload) {
    return postJSON(`${API_BASE}/api/monitoring/retry-sap-financial-receipt-sync-que`, payload)
}

export async function deleteJSON(url) {
    const res = await fetchWithAuth(url, { method: 'DELETE' })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`DELETE ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

export async function patchJSON(url, body) {
    const res = await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`PATCH ${url} failed: ${res.status} ${text}`)
    }
    return res.json().catch(() => ({}))
}

/* ===== Report APIs ===== */

function buildQueryString(params) {
    const qs = Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    return qs ? `?${qs}` : ''
}

export async function fetchReceipts(params = {}) {
    const url = `${API_BASE}/api/reports/receipts${buildQueryString(params)}`
    return fetchJSON(url)
}

export async function fetchSalesSummary(params = {}) {
    const url = `${API_BASE}/api/reports/sales-summary${buildQueryString(params)}`
    return fetchJSON(url)
}

export async function fetchItemSales(params = {}) {
    const url = `${API_BASE}/api/reports/item-sales${buildQueryString(params)}`
    return fetchJSON(url)
}

export async function fetchPaymentSummary(params = {}) {
    const url = `${API_BASE}/api/reports/payment-summary${buildQueryString(params)}`
    return fetchJSON(url)
}

/* ===== Discount Scheme APIs ===== */

export async function fetchDiscountSchemes() {
    return fetchJSON(`${API_BASE}/api/discount/scheme`)
}

export async function fetchDiscountSchemeHistory(page = 0, size = 20) {
    return fetchJSON(`${API_BASE}/api/discount/scheme/history?page=${page}&size=${size}`)
}

export async function fetchDiscountScheme(id) {
    return fetchJSON(`${API_BASE}/api/discount/scheme/${id}`)
}

export async function fetchDiscountSchemesByStatus(status) {
    return fetchJSON(`${API_BASE}/api/discount/scheme/status/${status}`)
}

export async function createDiscountScheme(data) {
    return postJSON(`${API_BASE}/api/discount/scheme`, data)
}

export async function updateDiscountScheme(id, data) {
    return putJSON(`${API_BASE}/api/discount/scheme/${id}`, data)
}

export async function deleteDiscountScheme(id) {
    return deleteJSON(`${API_BASE}/api/discount/scheme/${id}`)
}

export async function activateScheme(id) {
    return patchJSON(`${API_BASE}/api/discount/scheme/${id}/activate`)
}

export async function pauseScheme(id) {
    return patchJSON(`${API_BASE}/api/discount/scheme/${id}/pause`)
}

export async function expireScheme(id) {
    return patchJSON(`${API_BASE}/api/discount/scheme/${id}/expire`)
}

/* ===== Coupon APIs ===== */

export async function generateCoupons(data) {
    return postJSON(`${API_BASE}/api/discount/coupon/generate`, data)
}

export async function fetchCouponsByScheme(schemeId) {
    return fetchJSON(`${API_BASE}/api/discount/coupon/scheme/${schemeId}`)
}

export async function activateCoupon(couponId) {
    return patchJSON(`${API_BASE}/api/discount/coupon/${couponId}/activate`)
}

export async function deactivateCoupon(couponId) {
    return patchJSON(`${API_BASE}/api/discount/coupon/${couponId}/deactivate`)
}

export async function validateCoupon(code) {
    return fetchJSON(`${API_BASE}/api/discount/coupon/validate?code=${encodeURIComponent(code)}`)
}

/* ===== Item APIs ===== */

export async function fetchItemsWithUom(search = '') {
    const qs = search ? `?search=${encodeURIComponent(search)}` : ''
    return fetchJSON(`${API_BASE}/api/master_data/items${qs}`)
}

/* ===== Discount lookup data APIs ===== */

export async function fetchDiscountProductData() {
    return fetchJSON(`${API_BASE}/api/master_data/discount_data/product`)
}

export async function fetchDiscountCategoryData() {
    return fetchJSON(`${API_BASE}/api/master_data/discount_data/category`)
}

export async function fetchDiscountCustomerGroupData() {
    return fetchJSON(`${API_BASE}/api/master_data/discount_data/customer_group`)
}

export async function fetchDiscountCustomerData() {
    return fetchJSON(`${API_BASE}/api/master_data/bpMasterData`)
}

export async function fetchDiscountPaymentGroupData() {
    return fetchJSON(`${API_BASE}/api/master_data/discount_data/payment_group`)
}

export async function fetchDiscountCardData() {
    return fetchJSON(`${API_BASE}/api/discountCards`)
}

export async function createDiscountCard(data) {
    return postJSON(`${API_BASE}/api/discountCards`, data)
}

export async function updateDiscountCard(id, data) {
    return putJSON(`${API_BASE}/api/discountCards/${id}`, data)
}

export async function deleteDiscountCard(id) {
    return deleteJSON(`${API_BASE}/api/discountCards/${id}`)
}

export async function uploadDiscountCardImage(id, file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetchWithAuth(`${API_BASE}/api/discountCards/${id}/image`, {
        method: 'POST',
        body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
    return res.json()
}

export async function deleteDiscountCardImage(id) {
    return deleteJSON(`${API_BASE}/api/discountCards/${id}/image`)
}

export function discountCardImageUrl(id) {
    return `${API_BASE}/api/discountCards/${id}/image`
}

/* ===== Item Image APIs ===== */

export async function fetchItemImageMeta(itemCode, uomEntry) {
    return fetchJSON(`${API_BASE}/api/item-image/${encodeURIComponent(itemCode)}/uom/${uomEntry}`)
}

export async function fetchItemImageBlob(itemCode, uomEntry) {
    const res = await fetchWithAuth(
        `${API_BASE}/api/item-image/${encodeURIComponent(itemCode)}/uom/${uomEntry}/raw`
    )
    if (!res.ok) throw new Error(`No image: ${res.status}`)
    return res.blob()
}

export async function uploadItemImage(itemCode, uomEntry, file) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetchWithAuth(
        `${API_BASE}/api/item-image/${encodeURIComponent(itemCode)}/uom/${uomEntry}`,
        { method: 'POST', body: form }
    )
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Upload failed: ${res.status} ${text}`)
    }
    return res.json()
}

export async function deleteItemImage(itemCode, uomEntry) {
    return deleteJSON(`${API_BASE}/api/item-image/${encodeURIComponent(itemCode)}/uom/${uomEntry}`)
}
