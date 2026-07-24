📦 BatchTrace Pro 🚀
📌 Project Description

BatchTrace Pro is a full-stack web application built using React (Frontend) and Flask (Backend).

It provides authentication, batch tracking, and AI-based analysis with a protected dashboard.

🚀 Features
🔑 Authentication
User Registration
User Login
Logout
JWT-based Authentication
Google OAuth Login
Protected Routes (Frontend + Backend)
Rate Limiting (5 requests/min)
Input Validation
📊 Dashboard (Protected)
➕ Create Batch
📖 Read/View Batches
✏️ Update Batch
❌ Delete Batch

👉 (Full CRUD functionality)

🤖 AI Feature
Analyze batch data
Loading state handling
Output display
Error handling
🌐 Live Demo

👉 https://batchtrace-pro.vercel.app

🧠 Tech Stack
Frontend
React.js
Backend
Flask (Python)
Flask-JWT-Extended
Flask-Limiter
Authlib (Google OAuth)
Database
MongoDB Atlas
⚙️ Run Locally
🔹 Backend
cd backend
pip install -r requirements.txt
python app.py
🔹 Environment Variables
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
🔹 Frontend
cd frontend
npm install
npm start
📌 Notes
No hardcoded data is used — all data comes from API
Fully responsive design (mobile, tablet, desktop)
Authenticated dashboard access only
