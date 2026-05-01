import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, loginUser, getProfile } from '../api/auth'
import useAuthStore from '../store/authStore'

function Register() {
  const [formData, setFormData] = useState({
    username  : '',
    email     : '',
    password  : '',
    password2 : '',
    role      : 'visitor',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.password2) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    try {
      // Step 1 — register
      await registerUser(formData)

      // Step 2 — auto login after register
      const res = await loginUser({
        username: formData.username,
        password: formData.password,
      })
      const { access, refresh } = res.data

      // Step 3 — get profile
      const profileRes = await getProfile(access)
      login(profileRes.data, access, refresh)

      // Step 4 — redirect
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      // Show first error from backend validation
      const firstError = data
        ? Object.values(data)[0]?.[0] || 'Registration failed.'
        : 'Something went wrong.'
      setError(firstError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-5xl">🍳</span>
            <h1 className="text-3xl font-bold font-heading text-gray-800 mt-3">
              Join RecipePlatform
            </h1>
            <p className="text-gray-500 mt-2">
              Create your free account today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'visitor' })}
                  className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-colors ${
                    formData.role === 'visitor'
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🍽️ Discover Recipes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'creator' })}
                  className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-colors ${
                    formData.role === 'creator'
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  👨‍🍳 Share Recipes
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-md"
            >
              {loading ? '⏳ Creating account...' : 'Create Account 🎉'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register