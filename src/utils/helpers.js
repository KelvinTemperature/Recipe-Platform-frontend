const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://51.20.78.36:8000'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null

  // Already a full Cloudinary or external URL
  if (imagePath.startsWith('https://res.cloudinary.com')) return imagePath

  // Already a full Railway URL
  if (imagePath.startsWith('http')) return imagePath

  // Relative path — prepend backend URL
  return `${BACKEND_URL}${imagePath}`
}