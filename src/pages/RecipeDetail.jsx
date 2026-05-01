import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getRecipe, toggleBookmark, rateRecipe } from '../api/recipes'
import useAuthStore from '../store/authStore'
import { getImageUrl } from '../utils/helpers'

function RecipeDetail() {
  const { id }       = useParams()   // 🧠 get recipe ID from URL
  const navigate     = useNavigate()
  const { user }     = useAuthStore()

  const [recipe,     setRecipe]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  // Rating form state
  const [rating,     setRating]     = useState(0)
  const [review,     setReview]     = useState('')
  const [ratingMsg,  setRatingMsg]  = useState(null)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await getRecipe(id)
        setRecipe(res.data)
        setBookmarked(res.data.is_bookmarked)
      } catch (err) {
        setError('Recipe not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipe()
  }, [id])

  const handleBookmark = async () => {
    if (!user) return navigate('/login')
    try {
      const res = await toggleBookmark(id)
      setBookmarked(res.data.status === 'bookmarked')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRating = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    if (rating === 0) return setRatingMsg('Please select a star rating!')
    try {
      await rateRecipe(id, { score: rating, review })
      setRatingMsg('✅ Rating submitted successfully!')
      setRating(0)
      setReview('')
      // Refresh recipe to show new rating
      const res = await getRecipe(id)
      setRecipe(res.data)
    } catch (err) {
      setRatingMsg(
        err.response?.data?.detail || '❌ You may have already rated this recipe.'
      )
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-6xl">🍳</div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-gray-500 text-xl">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Image ── */}
      <div className="relative h-80 md:h-96 w-full overflow-hidden">
        {recipe.image ? (
          <img
            src={getImageUrl(recipe.image)}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <span className="text-9xl">🍽️</span>
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.tags?.map(tag => (
                <span key={tag.id} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                  {tag.name}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-2">
              {recipe.title}
            </h1>
            <p className="text-orange-200">
              by <span className="font-semibold">{recipe.author}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '⏱️', label: 'Prep Time',  value: `${recipe.prep_time} mins` },
            { icon: '🔥', label: 'Cook Time',  value: `${recipe.cook_time} mins` },
            { icon: '⏰', label: 'Total Time', value: `${recipe.total_time} mins` },
            { icon: '🍽️', label: 'Servings',   value: recipe.servings },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p className="text-3xl mb-1">{stat.icon}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
              bookmarked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
            }`}
          >
            {bookmarked ? '❤️ Bookmarked' : '🤍 Bookmark'}
          </button>
          <div className="flex items-center gap-2 bg-yellow-50 px-6 py-3 rounded-xl">
            <span className="text-yellow-500 text-xl">⭐</span>
            <span className="font-bold text-gray-800">
              {recipe.avg_rating || 'No ratings yet'}
            </span>
          </div>
          
          {/* Show Edit button only if logged in user is the author */}
          {user && recipe.author?.includes(user.username) && (
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              ✏️ Edit Recipe
            </Link>
          )}
        </div>

        {/* ── Description ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-bold font-heading text-gray-800 mb-3">
            About this Recipe
          </h2>
          <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* ── Ingredients ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold font-heading text-gray-800 mb-4">
              🧺 Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients?.map(ingredient => (
                <li key={ingredient.id} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-800">{ingredient.quantity}</span>
                    {' '}{ingredient.name}
                  </span>
                </li>
              ))}
              {recipe.ingredients?.length === 0 && (
                <p className="text-gray-400 text-sm">No ingredients added yet.</p>
              )}
            </ul>
          </div>

          {/* ── Difficulty & Info ── */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold font-heading text-gray-800 mb-4">
              📊 Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Difficulty</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  recipe.difficulty === 'easy'   ? 'bg-green-100 text-green-700' :
                  recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-red-100 text-red-700'
                }`}>
                  {recipe.difficulty}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Views</span>
                <span className="font-semibold text-gray-800">👁️ {recipe.view_count}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Bookmarks</span>
                <span className="font-semibold text-gray-800">🔖 {recipe.bookmark_count}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Rating</span>
                <span className="font-semibold text-gray-800">
                  ⭐ {recipe.avg_rating || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Steps ── */}
        {recipe.steps?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-2xl font-bold font-heading text-gray-800 mb-6">
              👨‍🍳 Instructions
            </h2>

            {/* Step tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                    activeStep === i
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  {step.step_number}
                </button>
              ))}
            </div>

            {/* Active Step Content */}
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                  {recipe.steps[activeStep]?.step_number}
                </span>
                <h3 className="font-bold text-gray-800 text-lg">
                  Step {recipe.steps[activeStep]?.step_number}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {recipe.steps[activeStep]?.instruction}
              </p>
              {recipe.steps[activeStep]?.image && (
                <img
                  src={recipe.steps[activeStep].image}
                  alt={`Step ${recipe.steps[activeStep].step_number}`}
                  className="mt-4 rounded-xl w-full object-cover max-h-64"
                />
              )}
            </div>

            {/* Next/Prev step buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-orange-100"
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveStep(p => Math.min(recipe.steps.length - 1, p + 1))}
                disabled={activeStep === recipe.steps.length - 1}
                className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-40 hover:bg-orange-600"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Rating Form ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-gray-800 mb-6">
            ⭐ Rate this Recipe
          </h2>

          {ratingMsg && (
            <div className={`rounded-xl p-4 mb-4 text-sm ${
              ratingMsg.startsWith('✅')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {ratingMsg}
            </div>
          )}

          <form onSubmit={handleRating}>
            {/* Star Rating */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= (hoveredStar || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            {/* Review text */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none mb-4"
            />

            <button
              type="submit"
              className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Submit Rating ⭐
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail