import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

// ✅ FIXED API HANDLING (fallback added)
const API = "https://batchtrace-pro.onrender.com";

console.log("🚀 API URL:", API);

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [product, setProduct] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ FETCH
  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/batches`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load batches ❌");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ LOAD
  useEffect(() => {
    if (!token) {
      alert("Login first ❌");
      window.location.href = "/login";
    } else {
      fetchBatches();
    }
  }, [token, fetchBatches]);

  // ✅ ADD
  const addBatch = async () => {
  if (!batchName.trim() || !product.trim() || !expiry) {
    setError("All fields required ⚠️");
    return;
  }

  try {
    console.log("TOKEN:", token);

    const res = await fetch(`${API}/api/batches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        batchName: batchName,   // ✅ FIXED KEY
        product: product,
        expiry: expiry,
      }),
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data.error || "Add failed");
    }

    // ✅ CLEAR INPUTS
    setBatchName("");
    setProduct("");
    setExpiry("");

    // ✅ REFRESH LIST
    fetchBatches();

    setError("");
  } catch (err) {
    console.error(err);
    setError(err.message || "Add failed ❌");
  }
};
  // ✅ ANALYZE
  const analyzeBatch = async (id) => {
    setLoadingId(id);

    try {
      const res = await fetch(`${API}/api/batches/analyze/${id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

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
      console.error(err);
      setError(err.message || "Analyze failed ❌");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ DELETE
  const deleteBatch = async (id) => {
    if (!window.confirm("Delete this batch?")) return;

    try {
      const res = await fetch(`${API}/api/batches/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setBatches((prev) => prev.filter((b) => b._id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Delete failed ❌");
    }
  };

  // ✅ UPDATE
  const updateBatch = async (id) => {
    const newName = prompt("Enter new batch name");

    if (!newName) return;

    try {
      const res = await fetch(`${API}/api/batches/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ batch: newName }),
      });

      if (!res.ok) throw new Error("Update failed");

      setBatches((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, batch: newName } : b
        )
      );
    } catch (err) {
      console.error(err);
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
          <p className="no-data">
            No batches yet 🚫 — Add your first batch
          </p>
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