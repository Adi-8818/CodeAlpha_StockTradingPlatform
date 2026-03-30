import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const [stocks, setStocks]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchStocks = useCallback(async () => {
    try {
      const { data } = await api.get('/api/market/stocks')
      setStocks(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Market fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
    const interval = setInterval(fetchStocks, 5000)
    return () => clearInterval(interval)
  }, [fetchStocks])

  const getStock = (symbol) => stocks.find(s => s.symbol === symbol?.toUpperCase())

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers  = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)
  const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5)

  return (
    <MarketContext.Provider value={{
      stocks, loading, lastUpdate,
      getStock, topGainers, topLosers, mostActive,
      refresh: fetchStocks,
    }}>
      {children}
    </MarketContext.Provider>
  )
}

export const useMarket = () => {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error('useMarket must be used within MarketProvider')
  return ctx
}
