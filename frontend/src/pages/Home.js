import React from "react";
import bg from "../assets/image_a42607a4.png";

function Home() {
  return (
    <div>

      {/* HERO */}
      <div
        className="h-[70vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="bg-black bg-opacity-70 p-10 rounded text-center">
          <h1 className="text-5xl font-bold mb-4">BatchTrace Pro</h1>
          <p className="mb-4">Smart Batch Tracking System</p>
          <button className="bg-green-500 px-6 py-2 rounded">
            Get Started
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="py-16 bg-gray-900 text-center">
        <h2 className="text-3xl font-bold mb-10">Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">

          <div className="bg-gray-800 p-6 rounded">
            📊 Track batches in real-time
          </div>

          <div className="bg-gray-800 p-6 rounded">
            🎓 Generate certificates easily
          </div>

          <div className="bg-gray-800 p-6 rounded">
            📈 View analytics & reports
          </div>

          <div className="bg-gray-800 p-6 rounded">
            👥 Manage users
          </div>

          <div className="bg-gray-800 p-6 rounded">
            📁 Store batch records
          </div>

          <div className="bg-gray-800 p-6 rounded">
            🔐 Secure login system
          </div>

        </div>
      </div>

    </div>
  );
}

export default Home;