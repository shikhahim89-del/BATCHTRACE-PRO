import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API = "https://batchtrace-pro.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);

      alert("Login Successful ✅");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleLogin} className="auth-box">
        <h2 className="auth-title">Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          className="auth-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          className="auth-input"
          required
        />

        <button type="submit" className="auth-button">
          Login
        </button>

        <p className="switch-text">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;