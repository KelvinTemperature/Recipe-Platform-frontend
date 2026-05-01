import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Navbar() {
  // State to toggle mobile menu open/closed
  const [menuOpen, setMenuOpen] = useState(false)

  // Get user and logout function from our auth store
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Handle logout click
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🍽️</span>
          <span className="text-xl font-bold text-primary font-heading">
            RecipePlatform
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-primary font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/recipes"
            className="text-gray-600 hover:text-primary font-medium transition-colors"
          >
            Recipes
          </Link>

          {/* Show these only if user is logged in */}
          {user && (
            <>
              <Link
                to="/bookmarks"
                className="text-gray-600 hover:text-primary font-medium transition-colors"
              >
                Bookmarks
              </Link>

              {/* Show Dashboard only for creators */}
              {user.role === 'creator' && (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        {/* ── Auth Buttons ── */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            // Logged in — show username and logout
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                👋 {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            // Not logged in — show login and register
            <>
              <Link
                to="/login"
                className="text-primary border-2 border-primary hover:bg-primary hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile Menu Button ── */}
        <button
          className="md:hidden text-gray-600 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
          <Link to="/"        onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Home</Link>
          <Link to="/recipes" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Recipes</Link>
          {user && (
            <>
              <Link to="/bookmarks" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Bookmarks</Link>
              {user.role === 'creator' && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-primary">Dashboard</Link>
              )}
              <button onClick={handleLogout} className="text-red-500 text-left">Logout</button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="text-primary font-medium">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="text-primary font-medium">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar