import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const splitIntoDays = (arr, numDays) => {
  const chunks = Array.from({ length: numDays }, () => []);
  arr.forEach((place, i) => chunks[i % numDays].push(place));
  return chunks;
};

const TripSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const {
    selectedCity,
    days,
    budget,
    groupType,
    coordinates,
    hotelBooking,
    selectedFlight,
    places = [],
  } = location.state || {};

  const [dailyActivities, setDailyActivities] = useState([]);

  useEffect(() => {
    if (places.length && days) {
      const grouped = splitIntoDays(places, parseInt(days));
      setDailyActivities(grouped);
    }
  }, [places, days]);

  const handleConfirmAndSave = async () => {
    if (!user) {
      alert("Please log in to save your trip.");
      return;
    }

    try {
      const itineraryRef = collection(db, "users", user.uid, "itineraries");

      const allActivities = [];
      dailyActivities.forEach((dayList, dayIndex) => {
        dayList.forEach((place) => {
          allActivities.push({
            name: place.name,
            day: dayIndex + 1,
            photoUrl: place.photoUrl || "",
            place_id: place.place_id || null,
            eventId: place.eventId || null,
            eventUrl: place.eventUrl || null,
            venue: place.venue || null,
            date: place.date || null,
            time: place.time || null,
            category: place.category || null,
            source: place.source || "google",
            price: place.price || "Varies",
            duration: place.duration || "1.5 hrs",
          });
        });
      });

      await addDoc(itineraryRef, {
        userId: user.uid,
        selectedCity,
        days,
        budget,
        groupType,
        coordinates,
        hotelBooking: hotelBooking || null,
        flightBooking: selectedFlight || null,
        activities: allActivities,
        createdAt: serverTimestamp(),
      });

      alert("✅ Trip saved successfully!");
      navigate("/manage-trips");
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip.");
    }
  };

  if (!selectedCity || !days || !places.length) {
    return <div style={{ padding: "2rem", color: "#000", backgroundColor: "#b3e5fc", minHeight: "100vh" }}>
Loading trip details...</div>;
  }

  const [saving, setSaving] = useState(false);
  
  const parseDurationToMinutes = (duration) => {
    if (!duration || typeof duration !== "string") {
      return 0; // If duration is missing, just assume 0 minutes
    }
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(match?.[1] || "0", 10);
    const minutes = parseInt(match?.[2] || "0", 10);
    return hours * 60 + minutes;
  };
  
  
  const handleConfirmAndFinish = async () => {
    if (!user) {
      alert("Please log in to save your trip.");
      return;
    }
  
    setSaving(true);
  
    const activitiesWithDays = [];
    if (places.length > 0 && days > 0) {
      const chunkSize = Math.ceil(places.length / days);
      for (let day = 1; day <= days; day++) {
        const dayActivities = places.slice((day - 1) * chunkSize, day * chunkSize);
        dayActivities.forEach((activity) => {
          activitiesWithDays.push({ ...activity, day });
        });
      }
    }
  
    let cleanFlightBooking = null;
  
    if (selectedFlight && selectedFlight.segments?.[0]?.legs?.[0]) {
      try {
        const firstSegment = selectedFlight.segments[0];
        const firstLeg = firstSegment.legs[0];
    
        console.log("🛫 First Segment:", firstSegment);
        console.log("🛫 First Leg:", firstLeg);
        console.log("🛫 Departure Airport inside leg:", firstLeg?.departureAirport);
        console.log("🛫 Arrival Airport inside leg:", firstLeg?.arrivalAirport);
    
        cleanFlightBooking = {
          airline: firstLeg?.carriersData?.[0]?.name || "Unknown Airline",
          price: `${selectedFlight.priceBreakdown?.total?.currencyCode || "USD"} ${selectedFlight.priceBreakdown?.total?.units || "Unknown Price"}`,
          from: firstLeg?.departureAirport?.code || "Unknown Departure",  // <-- FIXED
          to: firstLeg?.arrivalAirport?.code || "Unknown Arrival",        // <-- FIXED
          departureTime: firstLeg?.departureTime || "Unknown Time",
          arrivalTime: firstLeg?.arrivalTime || "Unknown Time",
          durationMinutes: parseDurationToMinutes(firstLeg?.duration),
        };
        
        console.log("✅ cleanFlightBooking ready to save:", cleanFlightBooking);
    
      } catch (err) {
        console.error("❌ Failed to parse selectedFlight:", err);
      }
    } else {
      console.warn("❗ selectedFlight is missing or invalid at save time:", selectedFlight);
    }
  
    try {
      const tripRef = collection(db, "users", user.uid, "itineraries");
  
      await addDoc(tripRef, {
        userId: user.uid,
        selectedCity,
        days,
        budget,
        groupType,
        coordinates,
        hotelBooking: hotelBooking || null,
        flightBooking: cleanFlightBooking || { note: "Flight info not available" },
        activities: activitiesWithDays,
        createdAt: serverTimestamp(),
      });
  
      alert("✅ Trip saved successfully!");
      navigate("/manage-trips");
    } catch (error) {
      console.error("❌ Full Save Error Details:", error);
      alert("❌ Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div style={{ padding: "2rem", color: "#000", background: "transparent" }}>


      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#555",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: "8px",
          marginBottom: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        ⬅️ Back
      </button>
      
      <h2>📋 Final Trip Summary</h2>

      {/* Trip Metadata */}
      <div style={sectionStyle}>
        <h3>Trip Details</h3>
        <p>📍 <strong>Destination:</strong> {selectedCity}</p>
        <p>🗓️ <strong>Trip Length:</strong> {days} days</p>
        <p>💰 <strong>Budget:</strong> {budget}</p>
        <p>👥 <strong>Group:</strong> {groupType}</p>
        {coordinates && (
          <p>🧭 <strong>Coordinates:</strong> {coordinates.lat.toFixed(2)}, {coordinates.lng.toFixed(2)}</p>
        )}
      </div>

      {/* Hotel Booking */}
      <div style={sectionStyle}>
        <h3>🏨 Hotel Booking</h3>
        {hotelBooking ? (
          <>
            <p><strong>{hotelBooking.name}</strong></p>
            <p>📍 {hotelBooking.address}</p>
            <p>⭐ {hotelBooking.rating || "N/A"}</p>
          </>
        ) : (
          <p>No hotel selected.</p>
        )}
      </div>

      <div style={sectionStyle}>
        <h3>✈️ Flight Booking</h3>
        {selectedFlight ? (
          (() => {
            const firstSegment = selectedFlight?.segments?.[0];
            const firstLeg = firstSegment?.legs?.[0];

            return (
              <>
                <p><strong>From:</strong> {firstLeg?.departureAirport?.name || "Unknown Departure"} → {firstLeg?.arrivalAirport?.name || "Unknown Arrival"}</p>
                <p><strong>Airline:</strong> {firstLeg?.carriersData?.[0]?.name || "Unknown Airline"}</p>
                <p><strong>Departure:</strong> {firstLeg?.departureTime ? new Date(firstLeg.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown Time"}</p>
                <p><strong>Arrival:</strong> {firstLeg?.arrivalTime ? new Date(firstLeg.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown Time"}</p>
                <p><strong>Price:</strong> {selectedFlight?.priceBreakdown?.total?.currencyCode + " " + selectedFlight?.priceBreakdown?.total?.units || "Unknown Price"}</p>
              </>
            );
          })()
        ) : (
          <p>No flight selected.</p>
        )}
      </div>


      {/* 🗓️ Daily Itinerary */}
      <div style={sectionStyle}>
        <h3>🗓️ Itinerary Breakdown:</h3>
        {dailyActivities.map((dayList, dayIndex) => (
          <div key={dayIndex} style={{ marginBottom: "2rem" }}>
            <h4 style={{ color: "gold", marginBottom: "1rem" }}>Day {dayIndex + 1}</h4>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "center",
              maxWidth: "1200px",
              margin: "0 auto",
            }}>
              {dayList.map((activity, idx) => (
                <div style={{
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "10px",
                  width: "280px",
                  boxShadow: "0 6px 18px rgba(0,123,255,0.15)",
                  textAlign: "center",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}>              
                  <a
                    href={
                      activity.source === "ticketmaster" && activity.eventUrl
                        ? activity.eventUrl
                        : `https://www.google.com/maps/place/?q=place_id:${activity.place_id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={
                        activity.photoUrl && activity.photoUrl !== ""
                          ? activity.photoUrl
                          : "/no-image.jpg"
                      }
                      alt={activity.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        marginBottom: "0.5rem",
                      }}
                    />
                  </a>

                  <h4 style={{ margin: "0.5rem 0" }}>{activity.name}</h4>

                  <p>🕒 <strong>Duration:</strong> {activity.duration || "1.5 hrs"}</p>
                  <p>💵 <strong>Cost:</strong> {activity.price || "Varies"}</p>

                  {activity.category && (
                    <p style={{ color: "#ffcc00", fontWeight: "bold", marginTop: "0.5rem" }}>
                      🏷️ {activity.category}
                    </p>
                  )}

                  <p style={{ fontSize: "12px", color: "#aaa", marginTop: "0.5rem" }}>
                    {activity.source === "ticketmaster" ? "🎫 Ticketmaster" : "📍 Google"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


      {/* Confirm Button */}
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <button
        onClick={handleConfirmAndFinish}
        style={{
          marginTop: "2rem",
          padding: "12px 24px",
          backgroundColor: "#00b894",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
      >
        {saving ? "Saving..." : "✅ Confirm and Finish"}
      </button>

      </div>
    </div>
  );
};

const sectionStyle = {
  marginTop: "2rem",
  padding: "1rem",
  backgroundColor: "#ffffff",
  color: "#000",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
};



const placeCardStyle = {
  backgroundColor: "#2c2c2c",
  marginTop: "0.5rem",
  padding: "0.75rem",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
};

export default TripSummaryPage;
