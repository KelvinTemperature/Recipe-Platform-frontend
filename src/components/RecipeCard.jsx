import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toggleBookmark } from '../api/recipes'
import useAuthStore from '../store/authStore'
import { getImageUrl } from '../utils/helpers'

// 🧠 This component receives a "recipe" prop and displays it as a card
function RecipeCard({ recipe }) {
  const { user } = useAuthStore()
  const [bookmarked, setBookmarked] = useState(recipe.is_bookmarked || false)
  const [bookmarkCount, setBookmarkCount] = useState(recipe.bookmark_count || 0)

  const handleBookmark = async (e) => {
    // Prevent the click from navigating to recipe detail
    e.preventDefault()
    if (!user) return alert('Please login to bookmark recipes!')

    try {
      const res = await toggleBookmark(recipe.id)
      if (res.data.status === 'bookmarked') {
        setBookmarked(true)
        setBookmarkCount(prev => prev + 1)
      } else {
        setBookmarked(false)
        setBookmarkCount(prev => prev - 1)
      }
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  // Difficulty badge color
  const difficultyColor = {
    easy:   'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard:   'bg-red-100 text-red-700',
  }

  return (
    <Link to={`/recipes/${recipe.id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">

        {/* ── Image ── */}
        <div className="relative h-52 overflow-hidden">
          {recipe.image ? (
            <img
              src={getImageUrl(recipe.image)}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            // Fallback if no image
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          )}

          {/* Difficulty Badge */}
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
          >
            {bookmarked ? '❤️' : '🤍'}
          </button>
        </div>

        {/* ── Card Body ── */}
        <div className="p-4">

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.tags?.slice(0, 2).map(tag => (
              <span
                key={tag.id}
                className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 text-lg mb-1 font-heading line-clamp-1">
            {recipe.title}
          </h3>

          {/* Author */}
          <p className="text-sm text-gray-500 mb-3">
            by <span className="text-primary font-medium">{recipe.author}</span>
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
            <span>⏱️ {recipe.total_time} mins</span>
            <span>⭐ {recipe.avg_rating || 'No ratings'}</span>
            <span>🔖 {bookmarkCount}</span>
          </div>
        </div>

      </div>
    </Link>
  )
}

export default RecipeCard