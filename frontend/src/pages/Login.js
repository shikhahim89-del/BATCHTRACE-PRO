import React, { useEffect, useState } from "react";

const API = "https://batchtrace-pro.onrender.com";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("PROFILE:", data);
        setUser(data);
      })
      .catch(err => console.log(err));
  }, []);

  if (!user) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px", color: "white" }}>
      <h1 style={{ fontSize: "30px", color: "#4ade80" }}>Profile Page</h1>

      <div style={{
        marginTop: "20px",
        padding: "20px",
        background: "#1f2937",
        display: "inline-block",
        borderRadius: "10px"
      }}>
        
        {/* Avatar */}
        <img
          src={`https://ui-avatars.com/api/?name=${user.name}`}
          alt="avatar"
          style={{
            borderRadius: "50%",
            marginBottom: "15px"
          }}
        />

        <p style={{ fontSize: "20px" }}>
          <strong>Name:</strong> {user.name}
        </p>

        <p style={{ fontSize: "20px", marginTop: "10px" }}>
          <strong>Email:</strong> {user.email}
        </p>

        <p style={{ fontSize: "14px", marginTop: "10px", color: "gray" }}>
          User ID: {user.user_id}
        </p>
      </div>
    </div>
  );
}

export default Profile;