import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// ✅ FINAL FIXED API
const API =
  import.meta.env.VITE_API_URL || "https://your-backend.onrender.com";

console.log("🚀 API URL (Signup):", API);

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup Successful ✅");
        navigate("/");
      } else {
        alert(data.msg || "Signup Failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSignup} className="auth-box">
        <h2 className="auth-title">Signup</h2>

        <input
          className="auth-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-button" type="submit">
          Signup
        </button>

        <p className="switch-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;