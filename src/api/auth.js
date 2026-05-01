import API from './axios'
import axios from 'axios'

export const registerUser = (data) => API.post('/auth/register/', data)
export const loginUser    = (data) => API.post('/auth/login/', data)
export const logoutUser   = (data) => API.post('/auth/logout/', data)

// Pass token manually since user isn't logged in yet
export const getProfile = (token) => API.get('/auth/profile/', {
  headers: { Authorization: `Bearer ${token}` }
})