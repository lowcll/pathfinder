// src/pages/LoadingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingPage.css";

function LoadingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading logic
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      navigate("/discover");
    }
  }, [loading, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-card">
        <div className="spinner"></div>
        <h2 className="loading-title">
          {loading ? "Hang tight! 🗺️" : "All set! Redirecting..."}
        </h2>
        <p className="loading-subtext">
          {loading
            ? "We’re finding the best places near you..."
            : "You've been redirected to the Discover page."}
        </p>
      </div>
    </div>
  );
}

export default LoadingPage;
