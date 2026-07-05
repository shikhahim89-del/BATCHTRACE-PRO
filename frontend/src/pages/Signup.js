import React from "react";

function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">

      <div className="bg-white bg-opacity-10 p-8 rounded w-80">
        <h2 className="text-2xl mb-4 text-center">Sign Up</h2>

        <input className="w-full p-2 mb-3 rounded bg-gray-800" placeholder="Name" />
        <input className="w-full p-2 mb-3 rounded bg-gray-800" placeholder="Email" />
        <input className="w-full p-2 mb-3 rounded bg-gray-800" placeholder="Password" />

        <button className="w-full bg-green-500 p-2 rounded">
          Sign Up
        </button>
      </div>

    </div>
  );
}

export default Signup;