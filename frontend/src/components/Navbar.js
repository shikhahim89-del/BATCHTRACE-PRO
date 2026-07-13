import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-10 py-4 bg-gray-900 text-white sticky top-0">

      <h1 className="text-xl font-bold text-green-500">
        Batch Trace Pro 🚀
      </h1>

      <div className="flex gap-6">

        <NavLink to="/" className={({isActive}) => isActive ? "text-green-400" : "hover:text-green-400"}>
          Home
        </NavLink>

        <NavLink to="/about" className={({isActive}) => isActive ? "text-green-400" : "hover:text-green-400"}>
          About
        </NavLink>

        <NavLink to="/dashboard" className={({isActive}) => isActive ? "text-green-400" : "hover:text-green-400"}>
          Dashboard
        </NavLink>

        <NavLink to="/login" className={({isActive}) => isActive ? "text-green-400" : "hover:text-green-400"}>
          Login
        </NavLink>

        <NavLink to="/signup" className={({isActive}) => isActive ? "text-green-400" : "hover:text-green-400"}>
          Signup
        </NavLink>
        <Link to="/about">About</Link>

      </div>
    </div>
  );
};

export default Navbar;