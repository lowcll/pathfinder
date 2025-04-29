// components/ItineraryCard.jsx
import React from "react";

const ItineraryCard = ({ place }) => {
  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
        padding: "1rem",
        width: "300px",
      }}
    >
      {place.photoUrl && (
        <img
          src={place.photoUrl}
          alt={place.name}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderRadius: "6px",
            marginBottom: "0.5rem",
          }}
        />
      )}
      <h4>{place.name}</h4>
      <p>🕒 Duration: {place.duration}</p>
      <p>💵 Cost: {place.price}</p>
      <p>📍 Category: {place.category}</p>
      <p style={{ fontSize: "12px", color: "#aaa" }}>
        {place.source === "ticketmaster" ? "🎫 Ticketmaster" : "📍 Google"}
      </p>
    </div>
  );
};

export default ItineraryCard;
