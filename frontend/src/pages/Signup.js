import React, { useState } from "react";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup Successful ✅");
      } else {
        alert(data.error || "Signup Failed ❌");
      }

    } catch (err) {
      alert("Server error ❌");
    }
  };


  return (
    <div>
      <h2>Signup</h2>

      <form onSubmit={handleSignup}>

        <input
  placeholder="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{ color: "black", backgroundColor: "white" }}
/>

<input
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{ color: "black", backgroundColor: "white" }}
/>

<input
  placeholder="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{ color: "black", backgroundColor: "white" }}
/>

        <button type="submit">
          Signup
        </button>

      </form>

    </div>
  );
}

export default Signup;