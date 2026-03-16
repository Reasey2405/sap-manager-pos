import { getAuthHeaders, refreshAccessToken, notifySessionExpired } from './auth'

export const API_BASE = 'http://localhost:9988'

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

export async function postJSON(url, body) {
    const res = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(body),
    })
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
