// src/pages/ManageTrips.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import fallbackImage from "../assets/fallback.jpg";

const ManageTrips = () => {
  const [user] = useAuthState(auth);
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      try {
        const userTripsRef = collection(db, "users", user.uid, "itineraries");
        const snapshot = await getDocs(userTripsRef);
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

        setTrips(data);
      } catch (error) {
        console.error("Failed to fetch user's itineraries:", error);
      }
    };

    fetchTrips();
  }, [user]);

  const handleViewTrip = async (tripId) => {
    try {
      const tripRef = doc(db, "users", user.uid, "itineraries", tripId);
      const tripSnap = await getDoc(tripRef);
      const tripData = tripSnap.data();

      if (!tripData) {
        console.error("Trip data not found");
        return;
      }

      navigate("/view-trip", {
        state: {
          selectedCity: tripData.selectedCity,
          days: tripData.days,
          budget: tripData.budget,
          groupType: tripData.groupType,
          coordinates: tripData.coordinates,
          hotelBooking: tripData.hotelBooking || null,
          flightBooking: tripData.flightBooking || null,
          activities: tripData.activities || [],
        },
      });
    } catch (error) {
      console.error("Failed to load trip data:", error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this trip?");
    if (!confirmDelete) return;

    try {
      const tripRef = doc(db, "users", user.uid, "itineraries", tripId);
      await deleteDoc(tripRef);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
      alert("Trip deleted successfully!");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  const handleEditTrip = (trip) => {
    navigate(`/edit-itinerary/${trip.id}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "Unknown";
    const date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ padding: "2rem", color: "#000", background: "transparent", textAlign: "center" }}>
      <h2 style={{ marginBottom: "2rem", color: "#000000" }}>🧳 Your Saved Trips</h2>
      {trips.length === 0 ? (
        <p>No trips saved yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {trips.map((trip) => {
            const sampleActivities = trip.activities?.slice(0, 3) || [];

            return (
              <div
                key={trip.id}
                style={{
                  width: "320px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "1rem",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  color: "#000",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
              >
                {/* Action Buttons */}
                <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTrip(trip);
                    }}
                    style={buttonStyle("#3498db")}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                    style={buttonStyle("#e74c3c")}
                  >
                    🗑 Delete
                  </button>
                </div>

                {/* Image */}
                <img
                  src={trip.cityImage || trip.activities?.[0]?.photoUrl || fallbackImage}
                  alt={trip.selectedCity}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "1rem",
                  }}
                />

                {/* Info */}
                <h3 style={{ margin: "0 0 0.5rem" }}>{trip.selectedCity}</h3>
                <p>📅 {trip.days} days | 💸 {trip.budget} | 👥 {trip.groupType}</p>
                <p style={{ fontSize: "12px", color: "#888" }}>Saved: {formatDate(trip.createdAt)}</p>

                {/* Preview Activities */}
                {sampleActivities.length > 0 && (
                  <ul style={{ textAlign: "left", marginTop: "0.5rem", paddingLeft: "1.2rem", fontSize: "14px", color: "#333" }}>
                    {sampleActivities.map((act, i) => (
                      <li key={i}>{act.name} <span style={{ color: "#00bfff" }}>({act.category})</span></li>
                    ))}
                    {trip.activities?.length > 3 && (
                      <li style={{ color: "#888" }}>+ {trip.activities.length - 3} more</li>
                    )}
                  </ul>
                )}

                {/* View Button */}
                <button
                  onClick={() => handleViewTrip(trip.id)}
                  style={{
                    marginTop: "1rem",
                    backgroundColor: "#00b894",
                    color: "#fff",
                    padding: "10px",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                >
                  🔍 View Trip
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const buttonStyle = (bgColor) => ({
  backgroundColor: bgColor,
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.3s, transform 0.3s",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
});

export default ManageTrips;
