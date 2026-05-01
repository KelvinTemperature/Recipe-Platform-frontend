import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRecipes, getTags } from '../api/recipes'
import RecipeCard from '../components/RecipeCard'
import SearchBar from '../components/SearchBar'

function Recipes() {
  const [recipes, setRecipes]         = useState([])
  const [tags, setTags]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [totalCount, setTotalCount]   = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTag, setActiveTag]     = useState(null)
  const [difficulty, setDifficulty]   = useState('')
  const [maxTime, setMaxTime]         = useState('')

  // 🧠 useSearchParams — reads ?search=xxx from the URL
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  // Fetch recipes whenever filters change
  useEffect(() => {
    fetchRecipes()
  }, [currentPage, activeTag, difficulty, maxTime, searchQuery])

  // Fetch tags once on load
  useEffect(() => {
    getTags()
      .then(res => setTags(res.data.results || res.data))
      .catch(err => console.error(err))
  }, [])

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        ...(searchQuery && { search: searchQuery }),
        ...(activeTag   && { tag: activeTag }),
        ...(difficulty  && { difficulty }),
        ...(maxTime     && { max_time: maxTime }),
      }
      const res = await getRecipes(params)
      setRecipes(res.data.results)
      setTotalCount(res.data.count)
    } catch (err) {
      setError('Failed to load recipes.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchParams(query ? { search: query } : {})
    setCurrentPage(1)
  }

  const handleTagFilter = (slug) => {
    setActiveTag(slug)
    setCurrentPage(1)
  }

  const handleDifficulty = (val) => {
    setDifficulty(val)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold font-heading text-white mb-4">
            All Recipes 🍽️
          </h1>
          <p className="text-orange-100 text-lg mb-8">
            {totalCount} recipes waiting to be discovered
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar Filters ── */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 text-lg mb-4">🔧 Filters</h3>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Difficulty
                </h4>
                <div className="flex flex-col gap-2">
                  {['', 'easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => handleDifficulty(level)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        difficulty === level
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      {level === ''     ? '🍽️ All Levels' :
                       level === 'easy'   ? '🟢 Easy' :
                       level === 'medium' ? '🟡 Medium' :
                                           '🔴 Hard'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Prep Time Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Max Prep Time
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: '⚡ Any time',      value: '' },
                    { label: '⏱️ Under 15 mins', value: '15' },
                    { label: '⏱️ Under 30 mins', value: '30' },
                    { label: '⏱️ Under 60 mins', value: '60' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setMaxTime(opt.value); setCurrentPage(1) }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        maxTime === opt.value
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTagFilter(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeTag === null
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                    }`}
                  >
                    All
                  </button>
                  {(tags || []).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagFilter(tag.slug)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeTag === tag.slug
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(activeTag || difficulty || maxTime) && (
                <button
                  onClick={() => {
                    setActiveTag(null)
                    setDifficulty('')
                    setMaxTime('')
                    setCurrentPage(1)
                  }}
                  className="w-full mt-6 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1">

            {/* Active filters summary */}
            {(searchQuery || activeTag || difficulty || maxTime) && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-orange-700">
                🔍 Showing results for:
                {searchQuery  && <span className="ml-2 font-semibold">"{searchQuery}"</span>}
                {activeTag    && <span className="ml-2 font-semibold">Tag: {activeTag}</span>}
                {difficulty   && <span className="ml-2 font-semibold">Difficulty: {difficulty}</span>}
                {maxTime      && <span className="ml-2 font-semibold">Max time: {maxTime} mins</span>}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin text-5xl">🍳</div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-6 text-center">
                {error}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && recipes.length === 0 && (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🤷</p>
                <p className="text-gray-500 text-xl">No recipes found.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters.</p>
              </div>
            )}

            {/* Recipe Grid */}
            {!loading && recipes.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 disabled:opacity-40"
                    >
                      ← Prev
                    </button>

                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-orange-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Recipes