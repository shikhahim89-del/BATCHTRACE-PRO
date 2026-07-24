import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [product, setProduct] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/batches", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Failed to load batches ❌");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      alert("Login first ❌");
      window.location.href = "/login";
    } else {
      fetchBatches();
    }
  }, [token, fetchBatches]);

  const addBatch = async () => {
    if (!batchName.trim()) {
      setError("Enter batch name ⚠️");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          batch: batchName,
          product,
          expiry,
        }),
      });

      setBatchName("");
      setProduct("");
      setExpiry("");

      fetchBatches();
      setError("");
    } catch {
      setError("Add failed ❌");
    }
  };

  const analyzeBatch = async (id) => {
    setLoadingId(id);

    try {
      const res = await fetch(
        `http://localhost:5000/api/batches/analyze/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analyze failed");
      }

      setBatches((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                ai_result: data.result,
                status:
                  new Date(b.expiry) > new Date()
                    ? "Approved ✅"
                    : "Rejected ❌",
              }
            : b
        )
      );
    } catch (err) {
      setError(err.message || "Analyze failed ❌");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteBatch = async (id) => {
    if (!window.confirm("Delete this batch?")) return;

    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      setBatches((prev) => prev.filter((b) => b._id !== id));
      setError("");
    } catch {
      setError("Delete failed ❌");
    }
  };

  const updateBatch = async (id) => {
  const newName = prompt("Enter new batch name");

  if (!newName) return;

  try {
    await fetch(`http://localhost:5000/api/batches/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ batch: newName }),
    });

    // ✅ instant UI update
    setBatches((prev) =>
      prev.map((b) =>
        b._id === id ? { ...b, batch: newName } : b
      )
    );

  } catch {
    setError("Update failed ❌");
  }
};

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1 className="title">Dashboard 🚀</h1>

        <div className="dashboard-input-group">
          <input
            className="dashboard-input"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Batch Name"
          />

          <input
            className="dashboard-input"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product"
          />

          <input
            className="dashboard-input"
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />

          <button className="dashboard-button" onClick={addBatch}>
            Add
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p className="no-data">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="no-data">No batches yet 🚫 — Add your first batch</p>
        ) : (
          <table className="batch-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Certification</th>
                <th>Status</th>
                <th>AI Result</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((b) => (
                <tr key={b._id}>
                  <td>{b.batch}</td>

                  {/* ✅ Certification auto from expiry */}
                  <td>
                    {new Date(b.expiry) > new Date()
                      ? "Certified ✅"
                      : "Expired ❌"}
                  </td>

                  <td>{b.status}</td>

                  <td>
                    {loadingId === b._id
                      ? "🔍 Analyzing..."
                      : b.ai_result || "Not analyzed"}
                  </td>

                  <td>
                    <button
                      className="dashboard-button"
                      onClick={() => analyzeBatch(b._id)}
                      disabled={loadingId === b._id}
                    >
                      Analyze
                    </button>

                    <button
                      className="dashboard-button"
                      onClick={() => updateBatch(b._id)}
                    >
                      Update
                    </button>

                    <button
                      className="dashboard-button"
                      onClick={() => deleteBatch(b._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;