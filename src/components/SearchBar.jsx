import { useState } from 'react'

// 🧠 This component receives "onSearch" as a prop — a function to call when user searches
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()  // prevent page reload on form submit
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes, ingredients, cuisines..."
        className="flex-1 px-6 py-4 rounded-full border-2 border-orange-200 focus:border-primary focus:outline-none text-gray-700 text-base shadow-sm"
      />
      <button
        type="submit"
        className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-colors shadow-md"
      >
        Search 🔍
      </button>
    </form>
  )
}

export default SearchBar