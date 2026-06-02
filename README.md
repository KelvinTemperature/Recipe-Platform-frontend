# 🍽️ Recipe Platform — Frontend

A bold, colorful React frontend for the Recipe Platform API. Built for food lovers — discover recipes, bookmark favourites, rate dishes, and share your own culinary creations.

---

## 🌍 Live Demo

**Live URL:** http://51.20.78.36
**API:** http://51.20.78.36/api/
**Admin:** http://51.20.78.36/admin/

---

## ✨ Features

### For Everyone
- 🔍 Search recipes by title, description, or author
- 🏷️ Filter by cuisine tag, dietary tag, difficulty, and prep time
- 📖 View full recipe details with ingredients and step-by-step instructions
- ⭐ See average ratings and bookmark counts

### For Visitors
- 🔖 Bookmark and unbookmark favourite recipes
- ⭐ Rate and review recipes (1–5 stars)
- 📚 View all saved bookmarks in one place

### For Creators
- 🍳 Create recipes with dynamic ingredients and step-by-step instructions
- 📸 Upload recipe images (stored on Cloudinary)
- ✏️ Edit existing recipes
- 🗑️ Delete recipes
- 📊 Creator dashboard with views, bookmarks, and rating stats
- 🔒 Toggle recipes between public and private

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS v3 | Styling |
| Axios | API requests & interceptors |
| Zustand | Global auth state management |
| Google Fonts | Playfair Display + Inter |

---

## 📁 Project Structure

```
recipe-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance with JWT interceptors
│   │   ├── auth.js           # Auth API calls
│   │   └── recipes.js        # Recipe API calls
│   ├── components/
│   │   ├── Navbar.jsx        # Sticky responsive navbar
│   │   ├── RecipeCard.jsx    # Recipe card with bookmark toggle
│   │   └── SearchBar.jsx     # Search input component
│   ├── pages/
│   │   ├── Home.jsx          # Hero, tag filters, recipe grid
│   │   ├── Recipes.jsx       # Full recipes page with sidebar filters
│   │   ├── RecipeDetail.jsx  # Full recipe view with steps & ratings
│   │   ├── Login.jsx         # Login form
│   │   ├── Register.jsx      # Register form with role selection
│   │   ├── Dashboard.jsx     # Creator stats & recipe management
│   │   ├── Bookmarks.jsx     # Saved recipes
│   │   ├── CreateRecipe.jsx  # Multi-tab recipe creation form
│   │   └── EditRecipe.jsx    # Recipe editing form
│   ├── store/
│   │   └── authStore.js      # Zustand auth store
│   ├── utils/
│   │   └── helpers.js        # Image URL helper
│   ├── App.jsx               # Routes
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + Google Fonts
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 22+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/KelvinTemperature/recipe-frontend.git
cd recipe-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Update the backend URL

Open `src/api/axios.js` and update the `baseURL`:
```js
const API = axios.create({
  baseURL: 'https://recipe-platform-production-f8c7.up.railway.app/api',
})
```

Also update `src/utils/helpers.js`:
```js
const BACKEND_URL = 'https://recipe-platform-production-f8c7.up.railway.app'
```

### 4. Start the development server
```bash
npm run dev
```

Visit **http://localhost:5173**

---

## 🗺️ Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/recipes` | All Recipes + Filters | Public |
| `/recipes/:id` | Recipe Detail | Public |
| `/recipes/create` | Create Recipe | Creator only |
| `/recipes/:id/edit` | Edit Recipe | Recipe author only |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Creator Dashboard | Creator only |
| `/bookmarks` | My Bookmarks | Authenticated |

---

## 🔐 Authentication Flow

```
Register → Auto login → Redirect based on role
    │
    ├── Creator → Dashboard
    └── Visitor → Home

Login → Get JWT tokens → Store in localStorage
    │
    └── Axios interceptor attaches token to every request automatically

Token expires → Interceptor auto-refreshes using refresh token
    │
    └── Refresh fails → Logout → Redirect to /login
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `primary` | `#FF6B35` | Orange — buttons, links, active states |
| `secondary` | `#F7C59F` | Light orange — backgrounds |
| `accent` | `#EFEFD0` | Cream — subtle backgrounds |
| `dark` | `#004E89` | Deep blue — bookmarks header |
| `bold` | `#1A936F` | Green — dashboard, edit |
| Font Heading | Playfair Display | Titles and headings |
| Font Body | Inter | All body text |

---

## 🧠 Key React Concepts Used

| Concept | Where used |
|---|---|
| `useState` | All forms, toggles, loading states |
| `useEffect` | Data fetching on page load |
| `useParams` | Reading recipe ID from URL |
| `useSearchParams` | Reading search query from URL |
| `useNavigate` | Programmatic redirects |
| Conditional rendering | Auth-based UI, loading/error/empty states |
| Dynamic form fields | Add/remove ingredients and steps |
| `FormData` | Image file uploads |
| Zustand store | Global auth state |
| Axios interceptors | Auto JWT attachment and refresh |
| `Promise.all` | Parallel API calls |

---

## 🚀 Deployment

This frontend is deployed on **Vercel**.


---

## 🔗 Related

- **Backend Repository:** [Recipe Platform API](https://github.com/KelvinTemperature/Recipe-Platform)
- **Backend API Docs:** Available via the Django admin panel

---

## 📄 License

Built as a Django Bootcamp final project.