# 🍳 KitmaiOx — AI-Powered Recipe Kitchen

**KitmaiOx** (คิดไม่ออก) is a modern, AI-powered web application that helps you discover what to cook based on the ingredients you already have in your fridge. Built with a React frontend and a .NET 8 backend, it leverages Google's Gemini AI to instantly generate delicious recipe ideas, complete with steps and macros.


## 🚀 Features

- **Smart Ingredient Picker:** Choose from over 50+ ingredients across multiple categories.
- **Client-Side Flavor Graph:** Instantly recommends complimentary ingredients (e.g., pairs Garlic with Pork) without consuming API tokens!
- **Gemini AI Recipe Generation:** Sends your ingredients to Gemini 2.5 Flash to generate 3 custom, high-quality recipes with estimated calories, difficulty, and cooking time.
- **Search History & Favorites:** Tracks your search history and allows you to favorite recipes for later. Includes an instant search filter to find past results quickly.
- **Interactive Metrics Dashboard:** View your most used ingredients and cooking stats in a clean UI.

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS (Custom Color Palette & Typography)
- **Icons:** Lucide React
- **Build Tool:** Vite

### Backend
- **Framework:** ASP.NET Core 8 Web API
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Entity Framework Core
- **AI Integration:** Google Gemini 1.5/2.5 Flash API
- **Authentication:** JWT (JSON Web Tokens)

---

## 🛠️ Local Setup Guide

### 1. Supabase Database Setup
1. Create a free project on [Supabase](https://supabase.com/).
2. Go to **Settings > Database > Connection String** and copy the URI.
3. Replace the password placeholder in the URI.

### 2. Backend Setup (.NET 8)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create `appsettings.Development.json` (Do not commit this file):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=db.[project].supabase.co;Database=postgres;Username=postgres;Password=[password];SSL Mode=Require"
     },
     "Gemini": {
       "ApiKey": "YOUR_GEMINI_API_KEY",
       "Model": "gemini-2.5-flash"
     },
     "Cors": {
       "AllowedOrigins": ["http://localhost:5173"]
     }
   }
   ```
3. Run Database Migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the backend server:
   ```bash
   dotnet run
   ```

### 3. Frontend Setup (React/Vite)
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment Guide

### Deploying the Backend (Render)
Render natively supports Docker. We have included a `Dockerfile` in the `backend/` directory.
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. In the setup page, set **Language** to **Docker**.
4. Set the **Root Directory** to `backend`.
5. Add the following Environment Variables in Render:
   - `DATABASE_URL` : Your Supabase PostgreSQL connection string.
   - `GEMINI_API_KEY` : Your Google Gemini API Key.
   - `ALLOWED_ORIGINS` : The production URL of your frontend (e.g., `https://kitmaiox.vercel.app`).
   - `Jwt__Key` : A long, secure random string for signing JWT tokens.
6. Click **Deploy**.

### Deploying the Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com/).
2. Connect your GitHub repository.
3. Set the **Framework Preset** to **Vite**.
4. Set the **Root Directory** to `frontend`.
5. Add the following Environment Variable in Vercel:
   - `VITE_API_URL` : The URL of your deployed Render backend (e.g., `https://kitmaiox-backend.onrender.com/api`).
6. Click **Deploy**.

---

## 📄 License
This project is built as a portfolio piece to demonstrate full-stack development skills using modern C# LINQ, React, and AI integrations.
