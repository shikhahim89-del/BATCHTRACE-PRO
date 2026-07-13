# 🔐 BatchTrace Pro (Auth + Dashboard)

## 📌 Project Description
BatchTrace Pro is a full-stack web application built using **React (Frontend)** and **Flask (Backend)**.

It includes a complete authentication system with JWT and Google OAuth, along with a dashboard to manage batch records.

---

## 🚀 Features

### 🔑 Authentication
- User Registration
- User Login
- Logout
- JWT-based Authentication
- Google OAuth Login
- Protected Routes (Frontend + Backend)
- Rate Limiting (5 requests/min)
- Input Validation

---

### 📦 Dashboard (Protected)
- Add Batch
- View Batches
- Delete Batch
- Update Batch Status

---

## 🌐 Deployed Link
https://batchtrace-pro.vercel.app

---

## 🧠 Tech Stack

### Frontend
- React.js

### Backend
- Flask (Python)
- Flask-JWT-Extended
- Flask-Limiter
- Authlib (Google OAuth)

### Database
- MongoDB Atlas

---

## ⚙️ Run Locally

### 🔹 Backend

```bash
cd backend
pip install -r requirements.txt
python app.py

MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret