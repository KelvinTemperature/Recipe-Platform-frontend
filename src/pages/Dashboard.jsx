import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDashboard, deleteRecipe } from '../api/recipes'
import useAuthStore from '../store/authStore'
import { getImageUrl } from '../utils/helpers'

function Dashboard() {
  const { user }              = useAuthStore()
  const navigate              = useNavigate()
  const [stats, setStats]     = useState(null)
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) return navigate('/login')
    if (user.role !== 'creator') return navigate('/')
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const dashRes = await getDashboard()
      setStats(dashRes.data)
      setRecipes(dashRes.data.recipes || [])
    } catch (err) {
      setError('Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteRecipe(id)
      setRecipes(recipes.filter(r => r.id !== id))
    } catch (err) {
      alert('Failed to delete recipe.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-6xl">🍳</div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-screen text-red-500">
      {error}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-heading text-white mb-2">
              👨‍🍳 Creator Dashboard
            </h1>
            <p className="text-green-100">
              Welcome back, <span className="font-bold">{user?.username}</span>!
            </p>
          </div>
          <Link
            to="/recipes/create"
            className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
          >
            + New Recipe
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon  : '🍽️',
              label : 'Total Recipes',
              value : stats?.total_recipes || 0,
              color : 'from-orange-400 to-pink-500',
            },
            {
              icon  : '👁️',
              label : 'Total Views',
              value : stats?.total_views || 0,
              color : 'from-blue-400 to-indigo-500',
            },
            {
              icon  : '🔖',
              label : 'Bookmarks',
              value : stats?.total_bookmarks || 0,
              color : 'from-green-400 to-teal-500',
            },
            {
              icon  : '⭐',
              label : 'Avg Rating',
              value : stats?.recipes?.length > 0
                ? (
                    stats.recipes
                      .filter(r => r.avg_rating)
                      .reduce((sum, r) => sum + r.avg_rating, 0) /
                    (stats.recipes.filter(r => r.avg_rating).length || 1)
                  ).toFixed(1)
                : 'N/A',
              color : 'from-yellow-400 to-orange-500',
            },
          ].map(card => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-md`}
            >
              <p className="text-4xl mb-2">{card.icon}</p>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm opacity-80 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* ── Recipes Table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading text-gray-800">
              My Recipes
            </h2>
            <span className="text-sm text-gray-500">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">🍳</p>
              <p className="text-gray-500 text-lg mb-2">No recipes yet!</p>
              <p className="text-gray-400 text-sm mb-6">
                Start sharing your culinary creations.
              </p>
              <Link
                to="/recipes/create"
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-6 py-4">Recipe</th>
                    <th className="text-center px-4 py-4">Status</th>
                    <th className="text-center px-4 py-4">Views</th>
                    <th className="text-center px-4 py-4">Bookmarks</th>
                    <th className="text-center px-4 py-4">Rating</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recipes.map(recipe => (
                    <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">

                      {/* Recipe Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            {recipe.image ? (
                              <img
                                src={getImageUrl(recipe.image)}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-xl">
                                🍽️
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 line-clamp-1">
                              {recipe.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(recipe.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          recipe.is_public
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {recipe.is_public ? '🌍 Public' : '🔒 Private'}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-4 text-center text-gray-600 text-sm">
                        👁️ {recipe.view_count}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600 text-sm">
                        🔖 {recipe.bookmark_count || 0}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600 text-sm">
                        ⭐ {recipe.avg_rating
                          ? Number(recipe.avg_rating).toFixed(1)
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/recipes/${recipe.id}`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            to={`/recipes/${recipe.id}/edit`}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors"
                          >
                            Edit ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(recipe.id, recipe.title)}
                            disabled={deleting === recipe.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors disabled:opacity-40"
                          >
                            {deleting === recipe.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard