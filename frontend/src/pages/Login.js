import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("CLICKED LOGIN");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log(data);

      alert("Login working ✅");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white bg-opacity-10 p-8 rounded w-80">
        <h2 className="text-2xl mb-4 text-center">Login</h2>

        <form onSubmit={handleLogin}>
          <input
            className="w-full p-2 mb-3 rounded bg-gray-800"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-2 mb-3 rounded bg-gray-800"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="w-full bg-green-500 p-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;