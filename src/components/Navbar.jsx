import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/PathFinderLogo.png" alt="logo" className="navbar-logo" />
      </div>
      <div className="navbar-right">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Manage Trips</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>
        <Link to="/about-us" className="nav-link">About Us</Link>
        {user ? (
          <button className="welcome-button">
            Welcome, {user.displayName.split(" ")[0]}!
          </button>
        ) : (
          <Link to="/login" className="login-button">Log In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
