import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-10 py-4 bg-gray-800 text-white">

      <h1 className="text-xl font-bold text-green-400">
        BatchTrace Pro 🚀
      </h1>

      <div className="flex gap-6">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/signup">Signup</NavLink>
      </div>

    </div>
  );
};

        

            

export default Navbar;