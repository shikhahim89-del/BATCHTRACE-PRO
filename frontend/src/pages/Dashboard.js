import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [aiResults, setAiResults] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load ❌");
    }
  };

  const addBatch = async () => {
    if (!batchName.trim()) return;

    try {
      await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          batch: batchName,
          product: "Milk",
          expiry: "2026-12-01"
        }),
      });

      setBatchName("");
      fetchBatches();
    } catch {
      setError("Add failed ❌");
    }
  };

  const deleteBatch = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      fetchBatches();
    } catch {
      setError("Delete failed ❌");
    }
  };

  const analyzeBatch = async (batch) => {
    setLoadingId(batch._id);

    try {
      const res = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Batch ${batch.batch}, product ${batch.product}, expiry ${batch.expiry}`
        }),
      });

      const data = await res.json();

      setAiResults(prev => ({
        ...prev,
        [batch._id]: data.analysis || "No result"
      }));

    } catch {
      setAiResults(prev => ({
        ...prev,
        [batch._id]: "Error ❌"
      }));
    }

    setLoadingId(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">

        <h2>Batch Dashboard</h2>

        <div className="dashboard-input-group">
          <input
            type="text"
            placeholder="Enter batch name"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            className="dashboard-input"
          />
          <button onClick={addBatch}>Add</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {batches.length > 0 ? (
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Status</th>
                <th>AI Result</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((b) => (
                <tr key={b._id}>
                  <td>{b.batch}</td>
                  <td>{b.status}</td>

                  <td>
                    {loadingId === b._id
                      ? "Loading..."
                      : aiResults[b._id] || "—"}
                  </td>

                  <td>
                    <button onClick={() => analyzeBatch(b)}>
                      Analyze
                    </button>

                    <button onClick={() => deleteBatch(b._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No batches found</p>
        )}

      </div>
    </div>
  );
}

export default Dashboard;