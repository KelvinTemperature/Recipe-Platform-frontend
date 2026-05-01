import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBookmarks, toggleBookmark } from '../api/recipes'
import useAuthStore from '../store/authStore'
import { getImageUrl } from '../utils/helpers'

function Bookmarks() {
  const { user }               = useAuthStore()
  const navigate               = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [removing, setRemoving]   = useState(null)

  useEffect(() => {
    if (!user) return navigate('/login')
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const res = await getBookmarks()
      setBookmarks(res.data.results || res.data)
    } catch (err) {
      setError('Failed to load bookmarks.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (recipeId, title) => {
    if (!window.confirm(`Remove "${title}" from bookmarks?`)) return
    setRemoving(recipeId)
    try {
      await toggleBookmark(recipeId)
      setBookmarks(bookmarks.filter(b => b.recipe.id !== recipeId))
    } catch (err) {
      alert('Failed to remove bookmark.')
    } finally {
      setRemoving(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-6xl">🍳</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-dark to-blue-700 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold font-heading text-white mb-2">
            🔖 My Bookmarks
          </h1>
          <p className="text-blue-200">
            {bookmarks.length} saved recipe{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-6 text-center mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookmarks.length === 0 && (
          <div className="text-center py-24">
            <p className="text-7xl mb-6">🔖</p>
            <h2 className="text-2xl font-bold font-heading text-gray-700 mb-3">
              No bookmarks yet!
            </h2>
            <p className="text-gray-400 mb-8">
              Start exploring recipes and save your favourites.
            </p>
            <Link
              to="/recipes"
              className="bg-primary text-white px-10 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md inline-block"
            >
              Explore Recipes 🚀
            </Link>
          </div>
        )}

        {/* Bookmarks Grid */}
        {bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <Link to={`/recipes/${bookmark.recipe.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    {bookmark.recipe.image ? (
                      <img
                        src={getImageUrl(bookmark.recipe.image)}
                        alt={bookmark.recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                    {/* Difficulty badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      bookmark.recipe.difficulty === 'easy'   ? 'bg-green-100 text-green-700' :
                      bookmark.recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                 'bg-red-100 text-red-700'
                    }`}>
                      {bookmark.recipe.difficulty}
                    </span>
                  </div>
                </Link>

                {/* Body */}
                <div className="p-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bookmark.recipe.tags?.slice(0, 2).map(tag => (
                      <span
                        key={tag.id}
                        className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <Link to={`/recipes/${bookmark.recipe.id}`}>
                    <h3 className="font-bold text-gray-800 text-lg font-heading hover:text-primary transition-colors line-clamp-1">
                      {bookmark.recipe.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500 mt-1 mb-3">
                    by <span className="text-primary font-medium">{bookmark.recipe.author}</span>
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 mb-3">
                    <span>⏱️ {bookmark.recipe.total_time} mins</span>
                    <span>⭐ {bookmark.recipe.avg_rating || 'N/A'}</span>
                    <span className="text-xs text-gray-400">
                      Saved {new Date(bookmark.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/recipes/${bookmark.recipe.id}`}
                      className="flex-1 text-center bg-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      View Recipe
                    </Link>
                    <button
                      onClick={() => handleRemove(bookmark.recipe.id, bookmark.recipe.title)}
                      disabled={removing === bookmark.recipe.id}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                      {removing === bookmark.recipe.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookmarks