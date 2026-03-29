const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';
export const AUTH_TOKEN_KEY = 'arthaai-auth-token';

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('Server returned an invalid JSON response', response.status);
  }
}

async function request(path, { method = 'GET', body, headers = {}, auth = false } = {}) {
  const token = auth ? getStoredToken() : null;
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.error?.details || null);
  }

  return payload;
}

function unwrap(payload) {
  return payload?.data ?? payload;
}

export function summarizePortfolio(holdings = []) {
  const totals = holdings.reduce(
    (accumulator, holding) => ({
      investedValue: accumulator.investedValue + Number(holding.investedValue || 0),
      currentValue: accumulator.currentValue + Number(holding.currentValue || 0),
      pnl: accumulator.pnl + Number(holding.pnl || 0),
    }),
    { investedValue: 0, currentValue: 0, pnl: 0 },
  );

  const pnlPercentage = totals.investedValue === 0 ? 0 : Number(((totals.pnl / totals.investedValue) * 100).toFixed(2));

  return {
    investedValue: Number(totals.investedValue.toFixed(2)),
    currentValue: Number(totals.currentValue.toFixed(2)),
    pnl: Number(totals.pnl.toFixed(2)),
    pnlPercentage,
  };
}

export function toChatPortfolio(holdings = []) {
  return holdings.map((holding) => ({
    symbol: holding.symbol,
    quantity: holding.quantity,
    averagePrice: holding.avgPrice,
  }));
}

export async function registerUser(payload) {
  return unwrap(await request('/auth/register', { method: 'POST', body: payload }));
}

export async function loginUser(payload) {
  return unwrap(await request('/auth/login', { method: 'POST', body: payload }));
}

export async function getCurrentUser() {
  return unwrap(await request('/auth/me', { auth: true }));
}

export async function getPortfolio() {
  return unwrap(await request('/portfolio', { auth: true }));
}

export async function getSignals() {
  return unwrap(await request('/signals'));
}

export async function getAlerts() {
  return unwrap(await request('/alerts', { auth: true }));
}

export async function subscribeToAlerts(payload) {
  return unwrap(await request('/alerts/subscribe', { method: 'POST', body: payload, auth: true }));
}

export async function askMarketQuestion({ question, portfolio, riskProfile = 'moderate' }) {
  return unwrap(
    await request('/chat/query', {
      method: 'POST',
      body: {
        question,
        riskProfile,
        portfolio,
      },
    }),
  );
}

