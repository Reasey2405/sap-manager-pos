import { getAuthHeaders, refreshAccessToken, notifySessionExpired } from './auth'

export const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:9988'

/**
 * Wrapper that retries once on 401 by refreshing the token.
 */
async function fetchWithAuth(url, options = {}) {
    // First attempt
    options.headers = getAuthHeaders(options.headers)
    let res = await fetch(url, options)

    // If 401, try to refresh and retry once
    if (res.status === 401) {
        try {
            await refreshAccessToken()
            options.headers = getAuthHeaders(options.headers)
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
