import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/marketService'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6)       { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await authService.register({
        username: form.username, email: form.email, password: form.password,
      })
      login({ userId: data.userId, username: data.username, email: data.email, balance: data.balance }, data.token)
      toast.success('Account created! Welcome to BullRun 🎉')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #00c896, #4d9fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={24} color="#000" fill="#000" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Get ₹1,00,000 virtual balance to start</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: 'var(--bg2)', border: '1px solid #ffffff12',
          borderRadius: 14, padding: '28px 24px',
        }}>
          {[
            { label: 'Username', key: 'username', type: 'text',     placeholder: 'Choose a username' },
            { label: 'Email',    key: 'email',    type: 'email',    placeholder: 'your@email.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                style={{
                  width: '100%', background: 'var(--bg3)', border: '1px solid #ffffff18',
                  borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
                  fontSize: 13, outline: 'none', fontFamily: 'Sora, sans-serif',
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', marginTop: 6, borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #00c896, #4d9fff)',
            color: '#000', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Sora, sans-serif', opacity: loading ? .7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
