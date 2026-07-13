import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");

  // ✅ HANDLE TOKEN + GOOGLE LOGIN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");

    let finalToken = localStorage.getItem("token");

    // Save Google token if present
    if (googleToken) {
      localStorage.setItem("token", googleToken);
      finalToken = googleToken;

      // clean URL
      window.history.replaceState({}, document.title, "/dashboard");
    }

    if (!finalToken) {
      alert("Login first ❌");
      window.location.href = "/";
      return;
    }

    fetchBatches(finalToken);
  }, []);

  // ✅ FETCH
  const fetchBatches = async (tokenParam) => {
    const token = tokenParam || localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setBatches(data);
      } else {
        setBatches([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ ADD
  const addBatch = async () => {
    if (!batchName) return;

    try {
      await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ batch: batchName }),
      });

      setBatchName("");
      fetchBatches();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ DELETE
  const deleteBatch = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchBatches();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ UPDATE
  const updateStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "Pending" ? "Approved" : "Pending";

    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchBatches();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">

        {/* HEADER */}
        <div className="dashboard-header">
          <h2>📦 Batch + Certification Dashboard</h2>
          <button
            className="dashboard-button logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* INPUT */}
        <div className="dashboard-input-group">
          <input
            type="text"
            placeholder="Enter batch name"
            className="dashboard-input"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <button
            className="dashboard-button"
            onClick={addBatch}
          >
            Add
          </button>
        </div>

        {/* LIST */}
        {batches.length > 0 ? (
          <ul>
            {batches.map((b) => (
              <li key={b._id}>
                <b>{b.batch}</b> — {b.status}

                <button onClick={() => updateStatus(b._id, b.status)}>
                  Toggle
                </button>

                <button onClick={() => deleteBatch(b._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No batches found</p>
        )}

      </div>
    </div>
  );
}

export default Dashboard;