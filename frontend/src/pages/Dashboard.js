import React from "react";
import bg from "../assets/image_a42607a4.png";

function Dashboard() {

  const addBatch = () => {
    console.log("BUTTON CLICKED");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-black bg-opacity-70 min-h-screen p-6 rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          <button
            onClick={addBatch}
            className="bg-green-500 px-4 py-2 rounded"
          >
            + Add Batch
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 p-6 rounded">24 Batches</div>
          <div className="bg-white bg-opacity-10 p-6 rounded">120 Students</div>
          <div className="bg-white bg-opacity-10 p-6 rounded">45 Certificates</div>
          <div className="bg-white bg-opacity-10 p-6 rounded">8 Reports</div>
        </div>

        {/* TABLE */}
        <h2 className="text-xl mb-4">Recent Batches</h2>

        <div className="bg-white bg-opacity-10 p-4 rounded">
          <table className="w-full">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>B001</td>
                <td>React</td>
                <td>Active</td>
              </tr>
              <tr>
                <td>B002</td>
                <td>Node</td>
                <td>Pending</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;