const BACKEND_URL = 'https://recipe-platform-production-f8c7.up.railway.app'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null

  // Already a full Cloudinary or external URL
  if (imagePath.startsWith('https://res.cloudinary.com')) return imagePath

  // Already a full Railway URL
  if (imagePath.startsWith('http')) return imagePath

  // Relative path — prepend backend URL
  return `${BACKEND_URL}${imagePath}`
}