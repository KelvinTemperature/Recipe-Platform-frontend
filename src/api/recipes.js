import API from './axios'

export const getRecipes       = (params)     => API.get('/recipes/', { params })
export const getRecipe        = (id)         => API.get(`/recipes/${id}/`)
export const createRecipe     = (data)       => API.post('/recipes/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const updateRecipe     = (id, data)   => API.patch(`/recipes/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const deleteRecipe     = (id)         => API.delete(`/recipes/${id}/`)
export const getTags          = ()           => API.get('/tags/')
export const toggleBookmark   = (id)         => API.post(`/recipes/${id}/bookmark/`)
export const getBookmarks     = ()           => API.get('/bookmarks/')
export const rateRecipe       = (id, data)   => API.post(`/recipes/${id}/ratings/`, data)
export const getDashboard     = ()           => API.get('/dashboard/')

// Ingredients
export const createIngredient = (recipeId, data)     => API.post(`/recipes/${recipeId}/ingredients/`, data)
export const updateIngredient = (recipeId, id, data) => API.patch(`/recipes/${recipeId}/ingredients/${id}/`, data)
export const deleteIngredient = (recipeId, id)       => API.delete(`/recipes/${recipeId}/ingredients/${id}/`)

// Steps
export const createStep = (recipeId, data)     => API.post(`/recipes/${recipeId}/steps/`, data)
export const updateStep = (recipeId, id, data) => API.patch(`/recipes/${recipeId}/steps/${id}/`, data)
export const deleteStep = (recipeId, id)       => API.delete(`/recipes/${recipeId}/steps/${id}/`)