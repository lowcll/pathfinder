// src/pages/LoadingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LoadingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Track if loading is still ongoing

  useEffect(() => {
    // Simulate data loading state (map + places API)
    const loadData = async () => {
      try {
        // Here, add your logic to load map data and places API
        // Example: await fetchPlacesData();

        // Simulate loading completion with a delay (simulate network delay)
        setTimeout(() => {
          setLoading(false); // Set loading to false when data is loaded
        }, 3000); // Adjust time to match how long it takes to load data

      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!loading) {
      navigate("/discover"); // Redirect once loading is done
    }
  }, [loading, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {loading ? (
        <>
          <h2>Please wait as the map loads...</h2>
          <p>We are fetching nearby places for you.</p>
        </>
      ) : (
        <>
          <h2>All set! Redirecting...</h2>
          <p>You've been redirected to your discovery page.</p>
        </>
      )}
    </div>
  );
}

export default LoadingPage;
