import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, getProfile } from '../api/auth'
import useAuthStore from '../store/authStore'

function Login() {
  // 🧠 One state object for the whole form
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const { login } = useAuthStore()
  const navigate  = useNavigate()

  // 🧠 One handler for all inputs — reads the input's name attribute
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()  // stop page reload
    setLoading(true)
    setError(null)

    try {
      // Step 1 — get tokens
      const res     = await loginUser(formData)
      const { access, refresh } = res.data

      // Step 2 — get user profile using the access token
      const profileRes = await getProfile(access)
      const user        = profileRes.data

      // Step 3 — save to store and localStorage
      login(user, access, refresh)

      // Step 4 — redirect based on role
      if (user.role === 'creator') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl">👨‍🍳</span>
            <h1 className="text-3xl font-bold font-heading text-gray-800 mt-3">
              Welcome Back!
            </h1>
            <p className="text-gray-500 mt-2">
              Log in to access your recipes
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-md"
            >
              {loading ? '⏳ Logging in...' : 'Login 🚀'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login