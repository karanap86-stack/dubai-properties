# Quick Reference Guide - Dubai Properties Platform

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install lucide-react react-gesture-handler

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 File Structure Overview

```
src/
├── components/                    # UI Components
│   ├── Navbar.jsx                # Navigation (4 tabs)
│   ├── HeroSection.jsx           # Welcome banner
│   ├── FilterPanel.jsx           # Filters sidebar
│   ├── ProjectShowcase.jsx       # Swipeable cards
│   ├── PropertyComparison.jsx    # ROI analysis
│   ├── AIContentGenerator.jsx    # AI content
│   └── GoogleSheetIntegration.jsx # Lead export
├── context/
│   └── ProjectContext.jsx        # Global state
├── services/
│   └── projectService.js         # Data & calculations
├── config/
│   └── apiConfig.js              # API setup
├── App.jsx                       # Main component
├── index.css                     # Global styles
├── main.jsx                      # Entry point
└── [Documentation files]
```

## 🎯 Main Features at a Glance

| Feature | Location | How to Use |
|---------|----------|-----------|
| Browse Properties | Discover Tab | Swipe/arrow buttons |
| Filter Results | Left sidebar | Check boxes & sliders |
| Compare Properties | Compare Tab | Select up to 5 |
| Generate Content | AI Agent Tab | Choose type & tone |
| Export Data | Export Tab | Fill form & submit |

## 🔧 Common Customizations

### Add New Property
In `src/services/projectService.js`:
```javascript
{
  id: 13,
  name: "Property Name",
  location: "Dubai Marina",
  price: 1200000,
  bedrooms: 2,
  sqft: 1200,
  roi: 8.5,
  appreciation: 12.3,
  // ... other fields
}
```

### Add New Filter
In `src/components/FilterPanel.jsx`:
```javascript
const myNewOptions = ['Option 1', 'Option 2', 'Option 3']
```

### Change Colors
In `src/index.css`:
- Primary: `cyan-500` → your color
- Secondary: `blue-600` → your color

## 📊 Data Structure

### Project Object
```javascript
{
  id: number,
  name: string,
  developer: string,
  location: string,
  price: number (AED),
  bedrooms: number,
  sqft: number,
  imageUrl: string,
  roi: number (%),
  appreciation: number (%),
  amenities: string[],
  description: string,
  completionDate: string,
  units: number
}
```

### Customer Object
```javascript
{
  name: string,
  email: string,
  phone: string,
  budget: string,
  preferences: string
}
```

## 🎨 Component Props

### ProjectShowcase
```jsx
<ProjectShowcase 
  filters={filterObject}
  selectedProjects={projectArray}
  setSelectedProjects={setFunction}
/>
```

### PropertyComparison
```jsx
<PropertyComparison 
  selectedProjects={projectArray}
/>
```

### FilterPanel
```jsx
<FilterPanel 
  filters={filterObject}
  setFilters={setFunction}
/>
```

## 🔌 Environment Variables

```env
# Google APIs
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_SHEETS_API_KEY=

# AI
VITE_AI_API_KEY=

# Backend
VITE_BACKEND_URL=http://localhost:3000

# Email
VITE_EMAIL_API_KEY=
```

## 💬 Component Communication

```
App (Main)
├── Navbar (Tab control)
├── ProjectContext (Global data)
└── Content (Based on active tab)
    ├── Discover
    │   ├── HeroSection
    │   ├── FilterPanel
    │   └── ProjectShowcase
    ├── Compare
    │   └── PropertyComparison
    ├── AI Agent
    │   └── AIContentGenerator
    └── Export
        └── GoogleSheetIntegration
```

## 🎯 User Actions Flow

```
1. User lands on Discover tab
   ↓
2. Adjusts filters (budget, location)
   ↓
3. Browses properties (swipe/arrows)
   ↓
4. Selects favorite properties (❤️)
   ↓
5. Goes to Compare tab
   ↓
6. Views ROI & appreciation analysis
   ↓
7. Goes to AI Agent tab
   ↓
8. Generates marketing content
   ↓
9. Goes to Export tab
   ↓
10. Saves to Google Sheets or emails lead
```

## 📱 Responsive Breakpoints

| Device | Width | CSS Class |
|--------|-------|-----------|
| Mobile | < 640px | sm:hidden |
| Tablet | 640-1024px | md:block |
| Desktop | > 1024px | lg:block |

## 🎨 Key CSS Classes

```css
/* Buttons */
.btn-primary {
  @apply px-6 py-3 bg-cyan-500 text-white rounded-lg;
  /* bg-gradient-to-r from-cyan-500 to-blue-600 removed for Tailwind v4+ compatibility */
}

/* Cards */
.card {
  @apply bg-slate-800 border border-slate-700 rounded-xl p-6
}

/* Text */
.text-heading {
  @apply text-3xl font-bold text-white
}
```

## 🔄 Data Flow

```
Filter Panel
    ↓
SetFilters (state)
    ↓
ProjectShowcase (uses filters)
    ↓
Filtered Projects Display
    ↓
User selects projects
    ↓
PropertyComparison (analyzes selected)
```

## 📊 ROI Calculation Formula

```
Expected ROI = Historical data + Market factors + Developer track record
Annual Appreciation = Historical growth + Market trends + Location factors
5-Year Value = Initial Price × (1 + Appreciation%)^5
```

## 🔑 Key Functions

### In `projectService.js`
```javascript
getAllProjects()           // Fetch all projects
getProjectsByFilter()      // Filter by criteria
calculateROI()            // Calculate ROI
calculateAppreciation()   // Calculate appreciation
getRoiReasons()          // Get explanation
```

### In `context/ProjectContext.jsx`
```javascript
ProjectProvider    // Wraps app for global state
ProjectContext     // Access with useContext()
```

## 🚨 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Module not found" | `npm install` again |
| "Styles not loading" | Restart dev server |
| "Properties undefined" | Check ProjectContext |
| "Swipe not working" | Check touch events |

## 📝 Code Patterns

### Use Context
```javascript
import { useContext } from 'react'
import { ProjectContext } from '../context/ProjectContext'

function Component() {
  const { projects, loading } = useContext(ProjectContext)
}
```

### Filter Array
```javascript
const filtered = projects.filter(p => 
  p.price >= min && p.price <= max
)
```

### Toggle Selection
```javascript
const toggle = (item) => {
  if (selected.includes(item)) {
    setSelected(selected.filter(i => i !== item))
  } else {
    setSelected([...selected, item])
  }
}
```

## 🎯 Testing Checklist

- [ ] All filters update display
- [ ] Swipe works on mobile/desktop
- [ ] Selection works (up to 5)
- [ ] Comparison calculates correctly
- [ ] Content generates without errors
- [ ] Forms validate input
- [ ] Mobile view is responsive
- [ ] No console errors

## 📈 Performance Tips

1. **Optimize images:** Use WebP or optimized JPEG
2. **Lazy load:** Add `loading="lazy"` to images
3. **Memoize:** Wrap expensive components with `React.memo`
4. **Code split:** Use `React.lazy` for heavy components
5. **Debounce:** Debounce filter changes

## 🎓 Learning Path

1. **Basics:** Read README.md
2. **Setup:** Follow SETUP.md
3. **Features:** Check IMPLEMENTATION_GUIDE.md
4. **Deep Dive:** Review component code
5. **Advanced:** Check BACKEND_EXAMPLE.js

## 📞 Where to Get Help

| Question | File |
|----------|------|
| What does this do? | README.md |
| How do I set it up? | SETUP.md |
| How do I use it? | IMPLEMENTATION_GUIDE.md |
| How do I add APIs? | BACKEND_EXAMPLE.js |
| What's the structure? | COMPLETE_SETUP.md |

## 🚀 Deployment Checklist

- [ ] Update API keys in `.env`
- [ ] Build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Check Console for errors
- [ ] Test on mobile
- [ ] Deploy to Vercel/Netlify
- [ ] Setup custom domain
- [ ] Enable HTTPS
- [ ] Monitor analytics

---

**Keep this guide handy for quick reference! 📌**
