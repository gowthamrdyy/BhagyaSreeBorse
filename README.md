<div align="center">

<img src="public/bhagyasree.png" alt="BhagyaSreeBorse" width="96" height="96" style="border-radius:50%"/>

# BhagyaSreeBorse

**A fast, modern academic portal for SRM University students.**  
Beautiful UI · Attendance tracking · Timetable download · Absence predictor · Marks overview

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)](https://github.com)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Dashboard** | At-a-glance overview of attendance, marks, today's schedule |
| 📅 **Timetable** | Full 5-day schedule with downloadable 1920×1080 image |
| ✅ **Attendance** | Per-subject attendance with color-coded status |
| 🔮 **Absence Predictor** | Select date range → see exact attendance impact before skipping |
| 📊 **Marks** | Subject-wise marks with SGPA estimator |
| ��️ **Academic Calendar** | Month-wise calendar with holidays and class days |
| 👤 **Profile** | ID card layout with stats, avatar picker |
| 🌗 **Dark / Light mode** | System-aware theme |
| 📱 **PWA ready** | Install as an app on any device — no app store needed |

---

## 🛠️ Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Edge Runtime)
- **Language** — TypeScript 5
- **Styling** — Tailwind CSS 4
- **Data fetching** — TanStack Query v5 with localStorage persistence
- **Animation** — Framer Motion
- **API** — [`reddy-api-srm`](https://www.npmjs.com/package/reddy-api-srm) (SRM academia API)
- **Download** — `dom-to-image-more` for timetable image export
- **Icons** — Lucide React
- **State** — Zustand

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or bun / pnpm)
- An **SRM University student account** (the app authenticates against SRM's servers)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/bhagyasreeborse.git
cd bhagyasreeborse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.  
Log in with your SRM student credentials (same as SRM Academia portal).

> **Note:** No `.env` file is required for local development. The app connects directly to SRM's servers via `reddy-api-srm`.

---

## 🌐 Deploying to Vercel (Recommended — Free)

Vercel is the fastest way to get this live for everyone to use.

### Step 1 — Create a Vercel account

Go to [vercel.com](https://vercel.com) → **Sign up** (free) using GitHub, GitLab, or email.

### Step 2 — Push your code to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bhagyasreeborse.git
git push -u origin main
```

### Step 3 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `bhagyasreeborse` repo
4. Vercel auto-detects Next.js — leave all settings as default
5. Click **Deploy** 🚀

Your app will be live at `https://your-repo-name.vercel.app` in ~2 minutes.

### Step 4 — (Optional) Add a custom domain

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain (e.g. `bhagyasreeborse.in`)
3. Update your domain's DNS with the A/CNAME records Vercel provides
4. SSL is automatic — your site is HTTPS instantly

---

## 🐳 Deploying with Docker (Self-hosted)

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Then run:

```bash
docker build -t bhagyasreeborse .
docker run -p 3000:3000 bhagyasreeborse
```

---

## ☁️ Deploying to Other Platforms

### Netlify

1. Push code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Deploy

### Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Select your repo
3. Railway auto-detects Next.js and deploys

---

## 📱 Installing as a PWA (No App Store Needed)

Share the deployed URL — users can install it as a native-like app for free.

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap **⋮ menu** → **"Add to Home screen"**
3. Tap **Add** — appears as an app icon on the home screen

**iOS (Safari):**
1. Open the URL in Safari
2. Tap the **Share button** (box with arrow icon)
3. Tap **"Add to Home Screen"**
4. Tap **Add**

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 8080 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint all source files |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run clean` | Remove `.next` build cache |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── app/                   # Authenticated app pages
│   │   ├── dashboard/         # Home dashboard
│   │   ├── timetable/         # Timetable + image download
│   │   ├── attendance/        # Per-subject attendance
│   │   ├── marks/             # Marks + SGPA predictor
│   │   ├── calendar/          # Academic calendar
│   │   ├── profile/           # User profile & stats
│   │   └── components/        # Shared app components
│   │       ├── AbsencePredictor.tsx
│   │       ├── MobileNav.tsx
│   │       ├── provider.tsx
│   │       ├── sidebar.tsx
│   │       └── ...
│   ├── auth/                  # Login / logout flows
│   ├── components/            # Root-level components
│   └── layout.tsx             # Root layout + metadata + PWA
├── components/ui/             # Reusable UI primitives (button, dialog, etc.)
├── data/                      # Static academic calendar & day-order data
├── hooks/                     # TanStack Query hooks + Zustand stores
├── lib/                       # API wrapper, utilities
├── types/                     # TypeScript type definitions
├── utils/                     # Helper functions
└── middleware.ts              # Auth guard (redirects unauthenticated users)
```

---

## 🔐 Authentication

This app uses **cookie-based authentication** via `reddy-api-srm`.

- Login calls SRM's authentication endpoint
- A session token is stored in a cookie
- `middleware.ts` protects all `/app/*` routes — unauthenticated users are redirected to `/auth/login`
- No passwords are stored anywhere in this app

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, new feature, UI improvement, or documentation — all PRs are appreciated.

### How to contribute

1. **Fork** this repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Verify nothing is broken:
   ```bash
   npm run type-check && npm run lint
   ```
5. Commit with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. Push to your fork and open a **Pull Request** against `main`

### Commit message convention

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `ui:` | Visual / style change |
| `refactor:` | Code restructuring, no behaviour change |
| `docs:` | Documentation only |
| `chore:` | Maintenance, dependency updates |

### What makes a good PR

- Focused — one thing per PR
- TypeScript errors: 0
- Tested on both mobile and desktop
- Screenshot attached if it's a UI change

---

## 🐛 Reporting Issues

Found a bug? [Open an issue](../../issues/new) with:

- A clear title
- Steps to reproduce
- Expected vs actual behaviour
- Device / browser / OS
- Screenshots or screen recording if possible

---

## 📋 Code of Conduct

### Our Pledge

We are committed to making participation in this project a welcoming experience for everyone, regardless of age, background, experience level, or identity.

### Our Standards

**Encouraged behaviour:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive feedback
- Focusing on what is best for the community

**Unacceptable behaviour:**
- Harassment, insults, or personal attacks
- Trolling or deliberately disruptive comments
- Publishing others' private information without consent
- Any other conduct that could reasonably be considered inappropriate

### Enforcement

Violations can be reported by opening an issue or contacting the maintainer directly. All reports will be reviewed and investigated. Maintainers have the right to remove, edit, or reject contributions that do not align with this Code of Conduct.

---

## 📜 License

```
MIT License

Copyright (c) 2026 Gowtham Sree Charan Reddy (gowthamrdyy)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## ⚠️ Disclaimer

This project is **not affiliated with, endorsed by, or officially connected to SRM Institute of Science and Technology** in any way. It is an independent, open-source tool built by students for students.  

All academic data is fetched directly from SRM's own servers using your credentials. Your login details are never stored by this application.

---

## 🙌 Acknowledgements

- [`reddy-api-srm`](https://www.npmjs.com/package/reddy-api-srm) — the SRM academia API that powers all data fetching
- [Next.js](https://nextjs.org) — React framework
- [Vercel](https://vercel.com) — hosting platform
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Lucide](https://lucide.dev) — icon library
- [TanStack Query](https://tanstack.com/query) — data fetching & caching
- [Framer Motion](https://www.framer.com/motion/) — animations

---

<div align="center">

Crafted with ❤️ by **[gowthamrdyy](https://github.com/gowthamrdyy)**

*For SRM students, by an SRM student.*

⭐ Star this repo if it helped you!

</div>
