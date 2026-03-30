import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/marketService'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      login({ userId: data.userId, username: data.username, email: data.email, balance: data.balance }, data.token)
      toast.success(`Welcome back, ${data.username}!`)
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #00c896, #4d9fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={24} color="#000" fill="#000" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>BullRun</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>NSE Stock Trading Simulator</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg2)', border: '1px solid #ffffff12',
          borderRadius: 14, padding: '28px 24px',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Sign in to your account</h2>

          {[
            { label: 'Username', key: 'username', type: 'text',     placeholder: 'Enter username' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Enter password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid #ffffff18',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
                  fontSize: 13, outline: 'none', fontFamily: 'Sora, sans-serif',
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: 8, borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #00c896, #4d9fff)',
            color: '#000', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora, sans-serif', opacity: loading ? .7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text3)' }}>
          Start with ₹1,00,000 virtual balance — no real money involved
        </p>
      </div>
    </div>
  )
}
