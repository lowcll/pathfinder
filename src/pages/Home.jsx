import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion here
import logo from "../assets/PathFinderLogo.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.body}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={styles.container}
      >
        <h1>Welcome to PathFinder</h1>
        <div style={styles.logoWrapper}>
          <img src={logo} alt="PathFinder Logo" style={styles.logo} />
        </div>
        <p style={styles.description}>
          Are you looking to plan the best vacation but are not sure where to stay, what to do, or which areas to explore? 
          Try PathFinder — an AI-powered web app that helps create the perfect travel itinerary with integrated booking tools based on your preferences.
        </p>
        <div style={styles.buttons}>
          <button style={styles.button} onClick={() => navigate("/plan-trip")}>
            Get Your Trip Started!
          </button>
          <button style={styles.button} onClick={() => navigate("/loading")}>
            Explore the Area Near You!
          </button>
        </div>
      </motion.div>

      <div style={styles.reviewsSection}>
        <h2>What Our Users Say</h2>
        <div style={styles.reviewGrid}>
          <div style={styles.reviewCard}>
            <span style={styles.reviewer}>Ethan Parker ⭐⭐⭐⭐☆</span>
            <p>“A very easy to use website. Booking my trip was fast and smooth!”</p>
          </div>
          <div style={styles.reviewCard}>
            <span style={styles.reviewer}>Olivia Hayes ⭐⭐⭐⭐⭐</span>
            <p>“Fantastic recommendations! I discovered places I would've never found on my own.”</p>
          </div>
          <div style={styles.reviewCard}>
            <span style={styles.reviewer}>Lucas Johnson ⭐⭐⭐⭐⭐</span>
            <p>“I had such a great experience! The itinerary PathFinder created was spot on.”</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#e3f2fd",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    textAlign: "center",
    color: "#333",
  },
  container: {
    padding: "40px 20px",
  },
  logoWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "20px auto",
  },
  logo: {
    width: "250px",
    maxWidth: "90%",
    height: "auto",
  },
  description: {
    fontSize: "1.1rem",
    maxWidth: "600px",
    margin: "0 auto 30px",
    color: "#333",
    lineHeight: "1.6",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  button: {
    backgroundColor: "#01579b",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    margin: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  buttonHover: {
    backgroundColor: "#0277bd",
    boxShadow: "0 0 15px rgba(2, 119, 189, 0.7)",
  },
  reviewsSection: {
    backgroundColor: "#ffffff",
    padding: "60px 20px",
    textAlign: "center",
    marginTop: "60px",
  },
  reviewGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "30px",
    marginTop: "30px",
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: "280px",
    textAlign: "left",
  },
  reviewer: {
    fontWeight: "bold",
    color: "#0277bd",
    marginBottom: "8px",
    display: "inline-block",
  },
};

export default Home;
