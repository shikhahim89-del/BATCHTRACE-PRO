import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

const API = "https://batchtrace-pro.onrender.com"; // ✅ FIXED

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState("");
  const [product, setProduct] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // ✅ FIXED
  };

  // ✅ FETCH
  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/batches`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBatches(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load ❌");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      alert("Login first ❌");
      window.location.href = "/login"; // ✅ FIXED
    } else {
      fetchBatches();
    }
  }, [token, fetchBatches]);

  // ✅ ADD
  const addBatch = async () => {
    if (!batch || !product || !expiry) {
      setError("All fields required ⚠️");
      return;
    }

    try {
      const res = await fetch(`${API}/api/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ batch, product, expiry }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");

      setBatch("");
      setProduct("");
      setExpiry("");
      setError("");

      fetchBatches();
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
      if (!res.ok) throw new Error(data.error);

      setBatches((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                ai_result: data.result,
                status:
                  data.result === "SAFE" ? "Approved" : "Expired",
              }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Analyze failed ❌");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/batches/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed ❌");
        return;
      }

      setBatches((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };

  // ✅ EXPIRY STATUS
  const getExpiryStatus = (date) => {
    const today = new Date();
    const exp = new Date(date);

    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { text: "Expired", class: "red" };
    if (diff <= 3) return { text: `${diff} days left`, class: "red" };
    if (diff <= 7) return { text: `${diff} days left`, class: "yellow" };
    return { text: `${diff} days left`, class: "green" };
  };

  return (
    <div className="container">
      <h1>🚀 Batch Dashboard</h1>

      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout 🚪
      </button>

      {/* FORM */}
      <div className="card form-card">
        <h2>➕ Add Batch</h2>

        <input
          type="text"
          placeholder="Batch ID"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />

        <button onClick={addBatch}>Add Batch</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th>Certification</th>
                <th>AI Result</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {batches.map((b) => (
                <tr key={b._id}>
                  <td>{b.batchId || b.batch}</td>
                  <td>{b.productName || b.product}</td>

                  <td>
                    {!b.ai_result ? (
                      <span className="badge gray">Pending ⏳</span>
                    ) : b.status === "Approved" ? (
                      <span className="badge green">
                        Certified ✅
                      </span>
                    ) : (
                      <span className="badge red">Expired ❌</span>
                    )}
                  </td>

                  <td>
                    {loadingId === b._id
                      ? "Analyzing..."
                      : b.ai_result || "Not analyzed"}
                  </td>

                  <td>
                    {(() => {
                      const exp = b.expiryDate || b.expiry;
                      const status = getExpiryStatus(exp);

                      return (
                        <>
                          {new Date(exp).toLocaleDateString(
                            "en-GB"
                          )}
                          <br />
                          <span
                            className={`badge ${status.class}`}
                          >
                            {status.text}
                          </span>
                        </>
                      );
                    })()}
                  </td>

                  <td>
                    <button
                      onClick={() => analyzeBatch(b._id)}
                    >
                      Analyze
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                    >
                      🗑 Delete
                    </button>

                    <button
                      onClick={() =>
                        alert(
                          `Certificate Verified ✅\n\nProduct: ${
                            b.productName || b.product
                          }\nBatch: ${
                            b.batchId || b.batch
                          }`
                        )
                      }
                    >
                      Certificate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;