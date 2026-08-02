import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";

const API = "https://batchtrace-pro.onrender.com";

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batch, setBatch] = useState("");
  const [product, setProduct] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

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
      window.location.href = "/login";
    } else {
      fetchBatches();
    }
  }, [token, fetchBatches]);

  // ✅ ✅ ADD FIX (IMPORTANT CHANGE HERE)
  
 const addBatch = async () => {
  if (!batch || !product || !expiry) {
    setError("All fields required ⚠️");
    return;
  }

  try {
    console.log("VALUES:", batch, product, expiry); // ✅ debug

    const res = await fetch("https://batchtrace-pro.onrender.com/api/batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        batch: batch,   // 🔥 THIS IS THE MAIN FIX
        product: product,
        expiry: expiry,
      }),
    });

    const data = await res.json();
    console.log("SERVER RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data.error || "Add failed");
    }

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
  const analyzeBatch = (id) => {
    setLoadingId(id);

    setTimeout(() => {
      setBatches((prev) =>
        prev.map((b) => {
          if (b._id !== id) return b;

          const today = new Date();
          const exp = new Date(b.expiryDate || b.expiry);

          const approved = exp >= today;

          return {
            ...b,
            status: approved ? "Approved" : "Expired",
            ai_result: approved ? "SAFE" : "EXPIRED",
          };
        })
      );

      setLoadingId(null);
    }, 500);
  };

  // ✅ DELETE
 const deleteBatch = async (id) => {
  const token = localStorage.getItem("token"); // 🔥 get token

  console.log("DELETE ID:", id);
  console.log("TOKEN:", token);

  try {
    const res = await fetch(`https://batchtrace-pro.onrender.com/api/batches/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,   // 🔥 THIS LINE FIXES IT
      },
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      throw new Error(data.error || "Delete failed");
    }

    fetchBatches();

  } catch (err) {
    console.error(err);
    setError("Delete failed ❌");
  }
};
  return (
    <div className="dashboard-container">
      <h1>Dashboard 🚀</h1>

      {/* FORM */}
      <div className="form">
        <input
  type="text"
  placeholder="Batch"
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
        <button onClick={addBatch}>Add</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
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

                <td>{b.status || "Pending"}</td>

                <td>
                  {loadingId === b._id
                    ? "Analyzing..."
                    : b.ai_result || "Not analyzed"}
                </td>

                <td>
                  {new Date(b.expiryDate || b.expiry).toLocaleDateString("en-GB")}
                </td>

                <td>
                  <button onClick={() => analyzeBatch(b._id)}>
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
      )}
    </div>
  );
}

export default Dashboard;