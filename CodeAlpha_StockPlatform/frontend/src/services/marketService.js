import api from './api'

export const marketService = {
  getAll:     ()      => api.get('/api/market/stocks'),
  getOne:     (sym)   => api.get(`/api/market/stocks/${sym}`),
  gainers:    (n = 5) => api.get(`/api/market/gainers?limit=${n}`),
  losers:     (n = 5) => api.get(`/api/market/losers?limit=${n}`),
  mostActive: (n = 5) => api.get(`/api/market/active?limit=${n}`),
  summary:    ()      => api.get('/api/market/summary'),
}

export const tradeService = {
  buy:     (payload) => api.post('/api/trade/buy', payload),
  sell:    (payload) => api.post('/api/trade/sell', payload),
  history: (page = 0, size = 50) => api.get(`/api/trade/history?page=${page}&size=${size}`),
}

export const portfolioService = {
  get:         ()    => api.get('/api/portfolio'),
  summary:     ()    => api.get('/api/portfolio/summary'),
  watchlist:   ()    => api.get('/api/portfolio/watchlist'),
  addWatch:    (sym) => api.post(`/api/portfolio/watchlist/${sym}`),
  removeWatch: (sym) => api.delete(`/api/portfolio/watchlist/${sym}`),
}

export const authService = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
}
