// src/pages/ViewSavedTrip.jsx
import React from "react";
import { useLocation } from "react-router-dom";

const ViewSavedTrip = () => {
  const location = useLocation();
  const {
    selectedCity,
    days,
    budget,
    groupType,
    coordinates,
    hotelBooking,
    flightBooking,
    activities = [],
  } = location.state || {};

  const activitiesByDay = {};

  activities.forEach((activity) => {
    if (!activitiesByDay[activity.day]) {
      activitiesByDay[activity.day] = [];
    }
    activitiesByDay[activity.day].push(activity);
  });

  const renderFlightInfo = () => {
    if (!flightBooking) {
      return <p>No flight selected.</p>;
    }

    return (
      <>
        <p><strong>✈️ From:</strong> {flightBooking.from} ➔ {flightBooking.to}</p>
        <p><strong>🛫 Airline:</strong> {flightBooking.airline}</p>
        <p><strong>🕒 Departure:</strong> {flightBooking.departureTime}</p>
        <p><strong>🕒 Arrival:</strong> {flightBooking.arrivalTime}</p>
        <p><strong>💵 Price:</strong> {flightBooking.price}</p>
      </>
    );
  };

  const renderHotelInfo = () => {
    if (!hotelBooking) {
      return <p>No hotel booking selected.</p>;
    }

    return (
      <>
        <p><strong>🏨 Hotel:</strong> {hotelBooking.name}</p>
        <p><strong>📍 Address:</strong> {hotelBooking.address}</p>
        <p><strong>⭐ Rating:</strong> {hotelBooking.rating}</p>
        <p><strong>💵 Price:</strong> {hotelBooking.price}</p>
      </>
    );
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "#e0f7ff", minHeight: "100vh", color: "#000" }}>
      <h2 style={{ textAlign: "center", color: "#00bfff", marginBottom: "2rem" }}>📋 Trip Overview</h2>

      <div style={sectionStyle}>
        <p><strong>📍 Destination:</strong> {selectedCity}</p>
        <p><strong>🗓️ Trip Length:</strong> {days} days</p>
        <p><strong>💰 Budget:</strong> {budget}</p>
        <p><strong>👥 Group:</strong> {groupType}</p>
        {coordinates?.lat && coordinates?.lng && (
          <p><strong>🧭 Coordinates:</strong> {coordinates.lat.toFixed(2)}, {coordinates.lng.toFixed(2)}</p>
        )}
      </div>

      <h3 style={{ color: "#00bfff" }}>🏨 Hotel Booking</h3>
      <div style={sectionStyle}>
        {renderHotelInfo()}
      </div>

      <h3 style={{ color: "#00bfff" }}>✈️ Flight Booking</h3>
      <div style={sectionStyle}>
        {renderFlightInfo()}
      </div>

      <h3 style={{ color: "#00bfff" }}>🗺️ Itinerary Breakdown</h3>
      {Array.from({ length: days }, (_, dayIndex) => (
        <div key={dayIndex} style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "gold", textAlign: "center", marginBottom: "1rem" }}>Day {dayIndex + 1}</h4>
          {activitiesByDay[dayIndex + 1] ? (
            <div style={cardsWrapperStyle}>
              {activitiesByDay[dayIndex + 1].map((activity, idx) => (
                <div key={idx} style={placeCardStyle}>
                  {activity.photoUrl ? (
                    <img
                      src={activity.photoUrl}
                      alt={activity.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "0.75rem",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "180px",
                        background: "#ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        marginBottom: "0.75rem",
                        color: "#666",
                      }}
                    >
                      No Image
                    </div>
                  )}

                  <h4 style={{ marginBottom: "0.5rem" }}>{activity.name}</h4>
                  <p>⏳ <strong>Duration:</strong> {activity.duration}</p>
                  <p>💵 <strong>Cost:</strong> {activity.price}</p>

                  {activity.category && (
                    <p style={{ color: "#00bfff", fontWeight: "bold", marginTop: "0.5rem" }}>
                      🏷️ {activity.category}
                    </p>
                  )}

                  <p style={{ fontSize: "12px", color: "#666", marginTop: "0.5rem" }}>
                    {activity.source === "ticketmaster" ? "🎫 Ticketmaster" : "📍 Google"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center" }}>No activities saved for this day.</p>
          )}
        </div>
      ))}
    </div>
  );
};

const sectionStyle = {
  backgroundColor: "#ffffff",
  padding: "1.5rem",
  borderRadius: "16px",
  marginBottom: "2rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const cardsWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem",
  justifyContent: "center",
  marginTop: "1rem",
};

const placeCardStyle = {
  width: "280px",
  backgroundColor: "#ffffff",
  padding: "1rem",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  textAlign: "center",
  color: "#000",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

export default ViewSavedTrip;
