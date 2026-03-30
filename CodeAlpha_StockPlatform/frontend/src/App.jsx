import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Trade from './pages/Trade'
import Portfolio from './pages/Portfolio'
import Watchlist from './pages/Watchlist'
import History from './pages/History'
import Login from './pages/Login'
import Register from './pages/Register'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index               element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="market"      element={<Market />} />
        <Route path="market/:sym" element={<Market />} />
        <Route path="trade"       element={<Trade />} />
        <Route path="trade/:sym"  element={<Trade />} />
        <Route path="portfolio"   element={<Portfolio />} />
        <Route path="watchlist"   element={<Watchlist />} />
        <Route path="history"     element={<History />} />
      </Route>
    </Routes>
  )
}
