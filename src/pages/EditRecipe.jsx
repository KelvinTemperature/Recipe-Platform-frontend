import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getRecipe, updateRecipe, getTags,
  createIngredient, updateIngredient, deleteIngredient,
  createStep, updateStep, deleteStep,
} from '../api/recipes'
import useAuthStore from '../store/authStore'
import { getImageUrl } from '../utils/helpers'

function EditRecipe() {
  const { id }    = useParams()
  const { user }  = useAuthStore()
  const navigate  = useNavigate()

  // ── Basic fields ──
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
  const [image, setImage]             = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)

  // ── Tags ──
  const [tags, setTags]               = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // ── Ingredients ──
  const [ingredients, setIngredients] = useState([])

  // ── Steps ──
  const [steps, setSteps] = useState([])

  // ── UI ──
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [currentTab, setCurrentTab] = useState('basic')
  const [successMsg, setSuccessMsg] = useState(null)

  // ── Load existing recipe data ──
  useEffect(() => {
    if (!user) return navigate('/login')
    if (user.role !== 'creator') return navigate('/')
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log('Recipe ID from URL:', id)
    try {
      const [recipeRes, tagsRes] = await Promise.all([
        getRecipe(id),
        getTags(),
      ])

      const recipe = recipeRes.data

      // Check ownership
      if (!recipe.author.includes(user.username)) {
        return navigate('/')
      }

      // Pre-fill basic fields
      setFormData({
        title       : recipe.title,
        description : recipe.description,
        difficulty  : recipe.difficulty,
        prep_time   : recipe.prep_time,
        cook_time   : recipe.cook_time,
        servings    : recipe.servings,
        is_public   : recipe.is_public,
      })

      // Pre-fill image
      if (recipe.image) {
        setExistingImage(recipe.image)
        setImagePreview(getImageUrl(recipe.image))
      }

      // Pre-fill tags
      setSelectedTags(recipe.tags?.map(t => t.id) || [])
      setTags(tagsRes.data.results || tagsRes.data)

      // Pre-fill ingredients
      setIngredients(
        recipe.ingredients?.length > 0
          ? recipe.ingredients
          : [{ name: '', quantity: '', order: 1 }]
      )

      // Pre-fill steps
      setSteps(
        recipe.steps?.length > 0
          ? recipe.steps
          : [{ step_number: 1, instruction: '' }]
      )

    } catch (err) {
      setError('Failed to load recipe.')
    } finally {
      setLoading(false)
    }
  }

  // ── Basic field handler ──
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  // ── Image handler ──
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setExistingImage(null)
  }

  // ── Tag handler ──
  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // ── Ingredient handlers ──
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '', order: ingredients.length + 1 }
    ])
  }

  const removeIngredient = async (index) => {
    if (ingredients.length === 1) return
    const ing = ingredients[index]
    // If it has an id it exists in the backend — delete it
    if (ing.id) {
      try {
        await deleteIngredient(id, ing.id)
      } catch (err) {
        console.error('Failed to delete ingredient', err)
      }
    }
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredientField = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  // ── Step handlers ──
  const addStep = () => {
    setSteps([
      ...steps,
      { step_number: steps.length + 1, instruction: '' }
    ])
  }

  const removeStepItem = async (index) => {
    if (steps.length === 1) return
    const step = steps[index]
    if (step.id) {
      try {
        await deleteStep(id, step.id)
      } catch (err) {
        console.error('Failed to delete step', err)
      }
    }
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_number: i + 1 }))
    setSteps(updated)
  }

  const updateStepField = (index, value) => {
    const updated = [...steps]
    updated[index].instruction = value
    setSteps(updated)
  }

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      // Build FormData explicitly
      const data = new FormData()
      data.append('title',       formData.title)
      data.append('description', formData.description)
      data.append('difficulty',  formData.difficulty)
      data.append('prep_time',   formData.prep_time)
      data.append('cook_time',   formData.cook_time)
      data.append('servings',    formData.servings)
      data.append('is_public',   formData.is_public)

      // Only append image if a NEW one was selected
      if (image) {
        data.append('image', image)
      }

      selectedTags.forEach(tagId => data.append('tag_ids', tagId))

      await updateRecipe(id, data)

      // Update ingredients
      const validIngredients = ingredients.filter(
        ing => ing.name.trim() && ing.quantity.trim()
      )
      await Promise.all(
        validIngredients.map(ing =>
          ing.id
            ? updateIngredient(id, ing.id, ing)
            : createIngredient(id, ing)
        )
      )

      // Update steps
      const validSteps = steps.filter(s => s.instruction.trim())
      await Promise.all(
        validSteps.map(step =>
          step.id
            ? updateStep(id, step.id, step)
            : createStep(id, step)
        )
      )

      setSuccessMsg('✅ Recipe updated successfully!')
      setTimeout(() => navigate(`/recipes/${id}`), 1500)

    } catch (err) {
      console.error('Update recipe error:', err.response?.data)
      const data = err.response?.data
      const firstError = data
        ? Object.values(data)[0]?.[0] || 'Failed to update recipe.'
        : 'Something went wrong.'
      setError(firstError)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'basic',       label: '📝 Basic Info' },
    { id: 'ingredients', label: '🧺 Ingredients' },
    { id: 'steps',       label: '👨‍🍳 Steps' },
  ]

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin text-6xl">🍳</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-bold to-green-600 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold font-heading text-white mb-1">
            ✏️ Edit Recipe
          </h1>
          <p className="text-green-100">
            Update your recipe details below
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-4 mb-6 text-sm">
            {successMsg}
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                currentTab === tab.id
                  ? 'bg-bold text-white'
                  : 'text-gray-500 hover:bg-green-50'
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none"
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
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Time & Servings */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Prep Time (mins)', name: 'prep_time' },
                  { label: 'Cook Time (mins)', name: 'cook_time' },
                  { label: 'Servings',         name: 'servings'  },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} *
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none"
                      required
                    />
                  </div>
                ))}
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
                          ? level === 'easy'   ? 'border-green-500 bg-green-50 text-green-700'
                          : level === 'medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                               : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {level === 'easy' ? '🟢' : level === 'medium' ? '🟡' : '🔴'} {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image section */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                {imagePreview ? (
                    <div>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl mb-3"
                    />
                    <div className="flex gap-3 justify-center">
                        <label
                        htmlFor="image-upload"  
                        className="bg-green-50 text-bold border border-green-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-100"
                        >
                        Change Image
                        </label>
                        <button
                        type="button"
                        onClick={() => {
                            setImage(null)
                            setImagePreview(null)
                            setExistingImage(null)
                        }}
                        className="text-red-500 text-sm border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                        Remove
                        </button>
                    </div>
                    {/* ← input must be inside same block as label */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    </div>
                ) : (
                    <>
                    <p className="text-4xl mb-2">📸</p>
                    <p className="text-gray-400 text-sm mb-3">Upload a new image</p>
                    <label
                        htmlFor="image-upload"
                        className="bg-green-50 text-bold border border-green-200 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-100"
                    >
                        Choose Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    </>
                )}
                </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border-2 ${
                          selectedTags.includes(tag.id)
                            ? 'bg-bold text-white border-bold'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-bold'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-800">Make recipe public</p>
                  <p className="text-sm text-gray-500">Public recipes are visible to everyone</p>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    formData.is_public ? 'bg-bold' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    formData.is_public ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentTab('ingredients')}
                className="w-full bg-bold hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Next: Ingredients →
              </button>
            </div>
          )}

          {/* ══════════════════════════════════
               TAB 2 — INGREDIENTS
          ══════════════════════════════════ */}
          {currentTab === 'ingredients' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">🧺 Ingredients</h2>
              <p className="text-gray-500 text-sm mb-6">
                Update, add or remove ingredients
              </p>

              <div className="space-y-3 mb-6">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Qty (e.g. 2 cups)"
                      value={ing.quantity}
                      onChange={(e) => updateIngredientField(index, 'quantity', e.target.value)}
                      className="w-36 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ing.name}
                      onChange={(e) => updateIngredientField(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      className="text-red-400 hover:text-red-600 text-xl disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addIngredient}
                className="w-full py-3 border-2 border-dashed border-green-300 text-bold rounded-xl text-sm font-medium hover:bg-green-50 transition-colors mb-6"
              >
                + Add Ingredient
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('basic')}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('steps')}
                  className="flex-1 py-4 bg-bold text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Next: Steps →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
               TAB 3 — STEPS
          ══════════════════════════════════ */}
          {currentTab === 'steps' && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">👨‍🍳 Instructions</h2>
              <p className="text-gray-500 text-sm mb-6">
                Update, add or remove steps
              </p>

              <div className="space-y-4 mb-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="w-9 h-9 rounded-full bg-bold text-white text-sm font-bold flex items-center justify-center">
                        {step.step_number}
                      </span>
                      {index < steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-green-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder={`Describe step ${step.step_number}...`}
                        value={step.instruction}
                        onChange={(e) => updateStepField(index, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-bold focus:outline-none resize-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeStepItem(index)}
                        disabled={steps.length === 1}
                        className="text-red-400 hover:text-red-600 text-xs mt-1 disabled:opacity-30"
                      >
                        Remove this step
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addStep}
                className="w-full py-3 border-2 border-dashed border-green-300 text-bold rounded-xl text-sm font-medium hover:bg-green-50 transition-colors mb-6"
              >
                + Add Step
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab('ingredients')}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
                >
                  {saving ? '⏳ Saving...' : '✅ Save Changes'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default EditRecipe