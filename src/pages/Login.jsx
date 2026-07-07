import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/auth/login', form)
      // Save user info to localStorage so we can access it across pages
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // Redirect based on role
      if (res.data.user.role === 'staff') {
        navigate('/staff/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🎓 Internship Diary</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#6b7280',fontFamily:'poppins' }}>Sign In</h3>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="text"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <span className="link" onClick={() => navigate('/register')}>
          Don't have an account? Register
        </span>
      </div>
    </div>
  )
}

export default Login