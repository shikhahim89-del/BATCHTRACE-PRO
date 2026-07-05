import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-gray-900 p-10 text-center">

      <h1 className="text-4xl mb-6">About</h1>

      <p className="mb-8">
        BatchTrace Pro helps manage batches, users, and certificates efficiently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded">🚀 Mission</div>
        <div className="bg-gray-800 p-6 rounded">🌍 Vision</div>
        <div className="bg-gray-800 p-6 rounded">🔒 Security</div>
      </div>

    </div>
  );
}

export default About;