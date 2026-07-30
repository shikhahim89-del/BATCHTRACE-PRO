import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// ✅ ADD THIS
const API = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login Successful ✅");
        navigate("/dashboard");
      } else {
        alert(data.msg || "Login Failed ❌");
      }
    } catch {
      alert("Server error ❌");
    }
  };

  const handleGoogleLogin = () => {
    localStorage.removeItem("token");

    // ✅ IMPORTANT FIX
    window.location.href = `${API}/api/auth/google`;
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-box">
        <h2 className="auth-title">Login</h2>

        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button className="auth-button" type="submit">
          Login
        </button>

        <p className="divider">OR</p>

        <button
          type="button"
          className="auth-button google-btn"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </button>

        <p className="switch-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </form>
    </div>
  );
}

export default Login;