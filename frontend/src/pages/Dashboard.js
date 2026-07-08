import React, { useState, useEffect } from "react";

function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  // ✅ FETCH
  const fetchBatches = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/batches");
      const data = await res.json();
      setBatches(data);
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
      });

      fetchBatches();
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ UPDATE (Pending ↔ Approved)
  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Approved" : "Pending";

    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      fetchBatches();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Batch + Certification Dashboard</h2>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Enter batch name"
        value={batchName}
        onChange={(e) => setBatchName(e.target.value)}
        style={{
          padding: "10px",
          marginRight: "10px",
          border: "1px solid black",
          color: "black",
        }}
      />

      <button onClick={addBatch}>Add</button>

      {/* LIST */}
      <ul>
        {batches.map((b) => (
          <li key={b._id}>
            <b>{b.batch}</b> — {b.status}

            {/* UPDATE BUTTON */}
            <button
              onClick={() => updateStatus(b._id, b.status)}
              style={{
                marginLeft: "10px",
                backgroundColor: "green",
                color: "white",
                border: "none",
                padding: "5px",
                cursor: "pointer",
              }}
            >
              Toggle Status
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={() => deleteBatch(b._id)}
              style={{
                marginLeft: "10px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;