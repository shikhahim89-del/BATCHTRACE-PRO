import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:5000/api/auth/profile", {
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
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-green-400">Profile Page</h1>

      <p className="mt-4 text-xl">
        Email: {user.email}
      </p>
    </div>
  );
}

export default Profile;