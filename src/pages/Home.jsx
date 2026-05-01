import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRecipes, getTags } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'
import SearchBar from '../components/SearchBar'

function Home() {
  // 🧠 useState — our data lives here
  const [recipes, setRecipes]     = useState([])
  const [tags, setTags]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [activeTag, setActiveTag] = useState(null)

  // 🧠 useEffect — fetch data when page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, tagsRes] = await Promise.all([
          getRecipes({ ordering: '-created_at' }),
          getTags(),
        ])
        setRecipes(recipesRes.data.results)
        setTags(tagsRes.data.results || tagsRes.data)
      } catch (err) {
        setError('Failed to load recipes. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // ← runs once when Home page loads

  // Filter by tag when user clicks a tag pill
  const handleTagFilter = async (tagSlug) => {
    setLoading(true)
    setActiveTag(tagSlug)
    try {
      const res = await getRecipes(tagSlug ? { tag: tagSlug } : {})
      setRecipes(res.data.results)
    } catch (err) {
      setError('Failed to filter recipes.')
    } finally {
      setLoading(false)
    }
  }

  // Search handler
  const handleSearch = async (query) => {
    setLoading(true)
    setActiveTag(null)
    try {
      const res = await getRecipes({ search: query })
      setRecipes(res.data.results)
    } catch (err) {
      setError('Search failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>

      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight">
            Discover & Share
            <span className="block text-yellow-300">Amazing Recipes</span>
          </h1>
          <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
            From quick weeknight dinners to weekend feasts — find the perfect recipe for every occasion.
          </p>

          {/* Search Bar in Hero */}
          <SearchBar onSearch={handleSearch} />

          {/* Quick Stats */}
          <div className="flex justify-center gap-10 mt-12">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-300">{recipes.length}+</p>
              <p className="text-orange-100 text-sm">Recipes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-300">{tags.length}+</p>
              <p className="text-orange-100 text-sm">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-300">⭐</p>
              <p className="text-orange-100 text-sm">Top Rated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tag Filter Pills ── */}
      <section className="bg-white py-6 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
          {/* "All" pill */}
          <button
            onClick={() => handleTagFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTag === null
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
            }`}
          >
            🍽️ All
          </button>

          {/* Tag pills — 🧠 .map() turns array into list of elements */}
          {(tags || []).map(tag => (
            <button
              key={tag.id}
              onClick={() => handleTagFilter(tag.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTag === tag.slug
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Recipe Grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 font-heading">
            {activeTag ? 'Filtered Recipes' : '🔥 Latest Recipes'}
          </h2>
          <Link
            to="/recipes"
            className="text-primary font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin text-5xl">🍳</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500 text-xl">No recipes found.</p>
            <p className="text-gray-400 mt-2">Be the first to add one!</p>
          </div>
        )}

        {/* 🧠 .map() — loop through recipes and render a RecipeCard for each */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.slice(0, 8).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* View More Button */}
        {!loading && recipes.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/recipes"
              className="bg-primary hover:bg-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg inline-block"
            >
              Explore All Recipes 🚀
            </Link>
          </div>
        )}
      </section>

      {/* ── Call To Action Banner ── */}
      <section className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-16 px-4 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-heading mb-4">
            Are you a Chef or Food Creator? 👨‍🍳
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Share your recipes with thousands of food lovers. Register as a Creator today!
          </p>
          <Link
            to="/register"
            className="bg-white text-green-600 hover:bg-green-50 px-10 py-4 rounded-full font-bold text-lg transition-colors shadow-lg inline-block"
          >
            Start Sharing Recipes →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Home