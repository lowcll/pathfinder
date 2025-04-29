import React from "react";

const AboutUs = () => {
  return (
    <div style={{
      backgroundColor: "#e0f7ff",
      minHeight: "100vh",
      padding: "3rem 2rem",
      fontFamily: "system-ui, sans-serif",
      color: "#000",
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0, 123, 255, 0.2)",
      }}>
        <h1 style={{ color: "#00bfff", marginBottom: "1rem" }}>🌍 About Pathfinder</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          Pathfinder is your AI-powered vacation planner, built to remove the stress of travel
          planning. Whether you're traveling solo or with a group, Pathfinder helps you discover
          top attractions, book flights and hotels, and generate custom itineraries — all in one place.
        </p>

        <h2 style={{ color: "#0077cc", marginBottom: "0.75rem" }}>✨ Why We Built This</h2>
        <p style={{ marginBottom: "1.5rem" }}>
          We believe every traveler deserves a seamless, personalized experience. Most trip planners
          are either too generic or require juggling between apps — Pathfinder combines AI, real-time
          data, and smart design to create trips that just *work*.
        </p>

        <h2 style={{ color: "#0077cc", marginBottom: "0.75rem" }}>🧑‍💻 Meet the Team</h2>
        <p>
          We're a group of developers, designers, and travel enthusiasts from George Washington University,
          blending technology and passion to reinvent how people plan adventures.
        </p>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ fontStyle: "italic", color: "#555" }}>
            “Travel should be about exploring, not organizing.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
