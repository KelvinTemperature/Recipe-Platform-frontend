import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Bookmarks from './pages/Bookmarks'
import CreateRecipe from './pages/CreateRecipe'
import EditRecipe from './pages/EditRecipe'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/recipes"         element={<Recipes />} />
        <Route path="/recipes/create"  element={<CreateRecipe />} />  
        <Route path="/recipes/:id"     element={<RecipeDetail />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/bookmarks"       element={<Bookmarks />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
      </Routes>
    </div>
  )
}

export default App