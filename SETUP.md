# Setup Guide - Dubai Properties Platform

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher)
- npm or yarn package manager
- A code editor (VS Code recommended)
- Git (optional)

## 🔧 Installation Steps

### 1. Install Node Dependencies

```bash
npm install

# Or if you prefer yarn
yarn install
```

### 2. Install Additional Required Packages

```bash
# Icons library
npm install lucide-react

# Gesture handling for swipe (optional, uses native events in current version)
npm install react-gesture-handler

# For animations (optional enhancement)
npm install framer-motion
```

### 3. Ensure Tailwind CSS is Set Up

If Tailwind CSS is not already configured:

```bash
npm install -D tailwindcss postcss autoprefixer

# Generate config files
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Verify Project Structure

Your project should have:

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── HeroSection.jsx
│   ├── FilterPanel.jsx
│   ├── ProjectShowcase.jsx
│   ├── PropertyComparison.jsx
│   ├── AIContentGenerator.jsx
│   └── GoogleSheetIntegration.jsx
├── context/
│   └── ProjectContext.jsx
├── services/
│   └── projectService.js
├── App.jsx
├── index.css
├── main.jsx
└── README.md
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at: `http://localhost:5173` (Vite)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 Package.json Dependencies

Your `package.json` should include:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "latest",
    "react-gesture-handler": "latest"
  },
  "devDependencies": {
    "tailwindcss": "latest",
    "postcss": "latest",
    "autoprefixer": "latest"
  }
}
```

## 🔌 Optional: Google Sheets Integration Setup

To enable Google Sheets export functionality:

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Web application)
5. Set authorized JavaScript origins: `http://localhost:5173`

### Step 2: Install Google Libraries

```bash
npm install @react-oauth/google googleapis
```

### Step 3: Update Environment Variables

Create `.env.local` file:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
```

### Step 4: Backend Setup (Optional)

For production, set up a Node.js backend:

```bash
npm install express cors dotenv
```

Create `backend/server.js`:

```js
import express from 'express'
import { google } from 'googleapis'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/export-to-sheets', async (req, res) => {
  // Implementation here
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

## 🎨 Customization Guide

### Change Color Scheme

Edit `src/index.css` to modify:
- Primary color: `cyan-500` / `cyan-400`
- Accent color: `blue-600`
- Background: `slate-900`

### Modify Property Data

Edit `src/services/projectService.js`:

```js
const DUBAI_PROJECTS = [
  {
    id: 1,
    name: "Your Property",
    price: 1000000,
    roi: 8.5,
    // ... other fields
  }
]
```

### Add New Filter Options

Edit `src/components/FilterPanel.jsx`:

```js
const areas = [
  'Downtown Dubai',
  'Your New Area',
  // ... more areas
]
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] All filters work correctly
- [ ] Swipe gestures work on mobile
- [ ] Comparison table displays correctly
- [ ] AI content generates without errors
- [ ] Forms validate properly
- [ ] Mobile responsiveness is smooth
- [ ] No console errors

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use
**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

### Issue: Module Not Found
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind Classes Not Loading
**Solution:**
- Verify `tailwind.config.js` content paths
- Rebuild the CSS: `npm run build`
- Restart dev server

### Issue: Google Sheets Integration Not Working
**Solution:**
- Check credentials in `.env.local`
- Verify CORS settings
- Check browser console for errors
- Ensure Google API is enabled

## 📊 Performance Tips

1. **Lazy Load Images**
   ```jsx
   <img loading="lazy" src={url} alt="property" />
   ```

2. **Memoize Components**
   ```jsx
   export default React.memo(ProjectCard)
   ```

3. **Use Code Splitting**
   ```jsx
   const ProjectShowcase = React.lazy(() => import('./ProjectShowcase'))
   ```

4. **Optimize Bundle**
   ```bash
   npm run build --report
   ```

## 📱 Testing on Mobile

### Using Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select mobile device preset

### Real Device Testing
```bash
# Get your local IP
ipconfig getifaddr en0  # macOS
hostname -I           # Linux
ipconfig             # Windows

# Access from mobile: http://YOUR_IP:5173
```

## 🔒 Security Considerations

1. **Protect API Keys**
   - Never commit `.env` files
   - Use `.env.local` for local development
   - Store secrets in environment variables

2. **Input Validation**
   - Validate email addresses
   - Sanitize user inputs
   - Check file uploads

3. **CORS Configuration**
   - Whitelist trusted domains
   - Use HTTPS in production

## 📈 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy the dist folder
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Google Sheets API](https://developers.google.com/sheets)

## ✅ Verification Checklist

After setup:

- [ ] Dependencies installed successfully
- [ ] Application runs without errors
- [ ] All components render correctly
- [ ] Filters work as expected
- [ ] Mobile view is responsive
- [ ] Animations are smooth
- [ ] Browser console has no errors
- [ ] Properties data loads correctly

---

**Need Help?** Check the README.md for more information about features and architecture.
