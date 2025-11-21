Kanji Quest - Deployment GuideFollow these steps to package your app for GitHub Pages.1. Directory StructureCreate a new folder on your computer and set it up like this:kanji-quest/
├── public/
│   └── (empty or favicon.ico)
├── src/
│   ├── App.jsx        <-- (Paste the latest App.jsx code here)
│   ├── main.jsx       <-- (Create this, see code below)
│   └── index.css      <-- (Create this, see code below)
├── index.html         <-- (Create this, see code below)
├── package.json       <-- (Use the file provided above)
├── vite.config.js     <-- (Use the file provided above)
├── postcss.config.js  <-- (Create this, see code below)
└── tailwind.config.js <-- (Create this, see code below)

2. Create Missing Files

index.html (Root folder)
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Kanji Quest</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


src/main.jsx 
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f8fafc; /* slate-50 */
}


tailwind.config.js (Root folder)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


postcss.config.js (Root folder)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

3. Install & Run Locally
Open your terminal in the project folder.Run npm install to download dependencies.Run npm run dev to start the local server.4. Deploy to GitHub PagesCreate a new repository on GitHub named kanji-quest.Initialize git in your folder:git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [https://github.com/](https://github.com/)soy-oka/kanji-quest.git
Important: Open vite.config.js and ensure the base property matches your repo name (/kanji-quest/).Run the deploy script:
npm run deploy
Push your source code (optional but recommended):git push -u origin main
Your app will be live at https:/.github.io/kanji-quest/ in a few minutes!