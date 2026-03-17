/**
 * Authentication Service
 * Handles login, token storage, refresh, and session management.
 */

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:9988'
const TOKEN_KEY = 'sap_access_token'
const REFRESH_KEY = 'sap_refresh_token'
const COMPANY_KEY = 'sap_company_id'

// ── Token Storage ──────────────────────────────────────────────
export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getCompanyId() {
  return localStorage.getItem(COMPANY_KEY)
}

export function setTokens({ token, accessToken, refreshToken, companyId }) {
  const access = token || accessToken
  if (access) localStorage.setItem(TOKEN_KEY, access)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  if (companyId != null) localStorage.setItem(COMPANY_KEY, String(companyId))
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(COMPANY_KEY)
}

export function isAuthenticated() {
  return !!getAccessToken()
}

export function getAuthHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: '*/*', ...extra }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// ── Session-expired listeners ──────────────────────────────────
const sessionExpiredListeners = new Set()

export function onSessionExpired(callback) {
  sessionExpiredListeners.add(callback)
  return () => sessionExpiredListeners.delete(callback)
}

export function notifySessionExpired() {
  clearTokens()
  sessionExpiredListeners.forEach((cb) => cb())
}

// ── Login ──────────────────────────────────────────────────────
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Login failed (${res.status})`)
  }

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.message || 'Login failed')
  }

  setTokens({
    token: data.token,
    refreshToken: data.refreshToken,
    companyId: data.companyId,
  })

  return data
}

// ── Refresh Token ──────────────────────────────────────────────
let refreshPromise = null

export async function refreshAccessToken() {
  // Deduplicate concurrent refresh requests
  if (refreshPromise) return refreshPromise

  const currentRefresh = getRefreshToken()
  if (!currentRefresh) {
    notifySessionExpired()
    throw new Error('No refresh token available')
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refreshToken: currentRefresh }),
      })

      if (!res.ok) {
        notifySessionExpired()
        throw new Error('Token refresh failed')
      }

      const data = await res.json()

      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })

      return data.accessToken
    } catch (err) {
      notifySessionExpired()
      throw err
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ── Logout ─────────────────────────────────────────────────────
export function logout() {
  clearTokens()
  sessionExpiredListeners.forEach((cb) => cb())
}
