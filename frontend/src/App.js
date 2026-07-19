import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";


import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-10 py-4 bg-gray-800">
          <h1 className="text-2xl font-bold text-green-400">
            BatchTrace Pro
          </h1>

          <div className="space-x-6">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            {localStorage.getItem("token") ? (
  <>
    <Link to="/dashboard">Dashboard</Link>
    <Link to="/profile">Profile</Link>
  </>
) : (
  <>
    <Link to="/login">Login</Link>
    <Link to="/signup">Sign Up</Link>
  </>
)}
          </div>
        </nav>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* ✅ PROTECTED ROUTES */}
          <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

      </div>
    </Router>
  );
}



export default App;