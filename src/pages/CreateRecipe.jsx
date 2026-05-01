import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRecipe, createIngredient, createStep, getTags } from '../api/recipes'
import useAuthStore from '../store/authStore'

function CreateRecipe() {
  const { user }      = useAuthStore()
  const navigate      = useNavigate()

  // ── Basic recipe fields ──
  const [formData, setFormData] = useState({
    title       : '',
    description : '',
    difficulty  : 'easy',
    prep_time   : '',
    cook_time   : '',
    servings    : '',
    is_public   : true,
  })

  // ── Image ──
  const [image, setImage]           = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // ── Tags ──
  const [tags, setTags]             = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // ── Dynamic ingredients ──
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', order: 1 }
  ])

  // ── Dynamic steps ──
  const [steps, setSteps] = useState([
    { step_number: 1, instruction: '' }
  ])

  // ── UI state ──
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [currentTab, setCurrentTab] = useState('basic') // basic | ingredients | steps

  // Redirect if not creator
  useEffect(() => {
    if (!user) return navigate('/login')
    if (user.role !== 'creator') return navigate('/')
    // Fetch tags
    getTags()
      .then(res => setTags(res.data.results || res.data))
      .catch(console.error)
  }, [])

  // ── Handlers: basic fields ──
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // ── Handlers: image ──
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── Handlers: tags ──
  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // ── Handlers: ingredients ──
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '', order: ingredients.length + 1 }
    ])
  }

  const removeIngredient = (index) => {
    if (ingredients.length === 1) return // keep at least one
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  // ── Handlers: steps ──
  const addStep = () => {
    setSteps([
      ...steps,
      { step_number: steps.length + 1, instruction: '' }
    ])
  }

  const removeStep = (index) => {
    if (steps.length === 1) return
    const updated = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step_number: i + 1 }))
    setSteps(updated)
  }

  const updateStep = (index, value) => {
    const updated = [...steps]
    updated[index].instruction = value
    setSteps(updated)
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title.trim()) {
      setError('Recipe title is required.')
      setLoading(false)
      return
    }

    try {
      // Build FormData correctly
      const data = new FormData()
      data.append('title',       formData.title)
      data.append('description', formData.description)
      data.append('difficulty',  formData.difficulty)
      data.append('prep_time',   formData.prep_time)
      data.append('cook_time',   formData.cook_time)
      data.append('servings',    formData.servings)
      data.append('is_public',   formData.is_public)

      // Only append image if one was selected
      if (image) {
        data.append('image', image)
      }

      // Append each tag id separately
      selectedTags.forEach(id => data.append('tag_ids', id))

      const recipeRes = await createRecipe(data)
      const recipeId  = recipeRes.data.id

      // Create ingredients
      const validIngredients = ingredients.filter(
        ing => ing.name.trim() && ing.quantity.trim()
      )
      await Promise.all(
        validIngredients.map(ing => createIngredient(recipeId, ing))
      )

      // Create steps
      const validSteps = steps.filter(s => s.instruction.trim())
      await Promise.all(
        validSteps.map(step => createStep(recipeId, step))
      )

      navigate(`/recipes/${recipeId}`)

    } catch (err) {
      console.error('Create recipe error:', err.response?.data)
      const data = err.response?.data
      const firstError = data
        ? Object.values(data)[0]?.[0] || 'Failed to create recipe.'
        : 'Something went wrong.'
      setError(firstError)
    } finally {
      setLoading(false)
    }
  }

  // ── Tab nav ──
  const tabs = [
    { id: 'basic',       label: '📝 Basic Info' },
    { id: 'ingredients', label: '🧺 Ingredients' },
    { id: 'steps',       label: '👨‍🍳 Steps' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold font-heading text-white mb-1">
            🍳 Create New Recipe
          </h1>
          <p className="text-orange-100">
            Share your culinary masterpiece with the world!
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
            ❌ {error}
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                currentTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-orange-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ══════════════════════════════════
               TAB 1 — BASIC INFO
          ══════════════════════════════════ */}
          {currentTab === 'basic' && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Spicy Jollof Rice"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your recipe, its origin, what makes it special..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Time & Servings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prep Time (mins) *
                  </label>
                  <input
                    type="number"
                    name="prep_time"
                    value={formData.prep_time}
                    onChange={handleChange}
                    placeholder="15"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cook Time (mins) *
                  </label>
                  <input
                    type="number"
                    name="cook_time"
                    value={formData.cook_time}
                    onChange={handleChange}
                    placeholder="30"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servings *
                  </label>
                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    placeholder="4"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, difficulty: level })}
                      className={`py-3 rounded-xl border-2 font-semibold text-sm capitalize transition-colors ${
                        formData.difficulty === level
                          ? level === 'easy'   ? 'border-green-500  bg-green-50  text-green-700'
                          : level === 'medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                               : 'border-red-500    bg-red-50    text-red-700'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {level === 'easy' ? '🟢' : level === 'medium' ? '🟡' : '🔴'} {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl mb-3"
                      />
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null) }}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-4xl mb-2">📸</p>
                      <p className="text-gray-400 text-sm mb-3">
                        Click to upload a photo of your dish
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-orange-50 text-primary border border-orange-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-orange-100 transition-colors"
                      >
                        Choose Image
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border-2 ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-800">Make recipe public</p>
                  <p className="text-sm text-gray-500">
                    Public recipes are visible to everyone
                  </p>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    formData.is_public ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    formData.is_public ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>

              {/* Next Tab Button */}
              <button
                type="button"
                onClick={() => setCurrentTab('ingredients')}
                className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Next: Add Ingredients →
              </button>
            </div>
          )}

          {/* ══════════════════════════════════
               TAB 2 — INGREDIENTS
          ══════════════════════════════════ */}
          {currentTab === 'ingredients' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                🧺 Ingredients
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Add each ingredient with its quantity (e.g. "2 cups", "1 tbsp")
              </p>

              <div className="space-y-3 mb-6">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3 items-center">

                    {/* Order number */}
                    <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>

                    {/* Quantity */}
                    <input
                      type="text"
                      placeholder="Qty (e.g. 2 cups)"
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      className="w-36 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm"
                    />

                    {/* Name */}
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ing.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      className="text-red-400 hover:text-red-600 text-xl disabled:opacity-30 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add ingredient */}
              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-3 border-2 border-dashed border-orange-300 text-primary rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors mb-6"
              >
                + Add Ingredient
              </button>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('basic')}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('steps')}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  Next: Add Steps →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
               TAB 3 — STEPS
          ══════════════════════════════════ */}
          {currentTab === 'steps' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                👨‍🍳 Instructions
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Walk your readers through each step clearly
              </p>

              <div className="space-y-4 mb-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">

                    {/* Step number */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                        {step.step_number}
                      </span>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-orange-200 mt-1" />
                      )}
                    </div>

                    {/* Instruction textarea */}
                    <div className="flex-1">
                      <textarea
                        placeholder={`Describe step ${step.step_number}...`}
                        value={step.instruction}
                        onChange={(e) => updateStep(index, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        className="text-red-400 hover:text-red-600 text-xs mt-1 disabled:opacity-30"
                      >
                        Remove this step
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add step */}
              <button
                type="button"
                onClick={addStep}
                className="w-full py-3 border-2 border-dashed border-orange-300 text-primary rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors mb-6"
              >
                + Add Step
              </button>

              {/* Navigation + Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('ingredients')}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
                >
                  {loading ? '⏳ Publishing...' : '🚀 Publish Recipe!'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default CreateRecipe