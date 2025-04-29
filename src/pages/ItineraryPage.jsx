import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const splitIntoDays = (arr, numDays) => {
  const chunks = Array.from({ length: numDays }, () => []);
  arr.forEach((place, i) => chunks[i % numDays].push(place));
  return chunks;
};

const capitalizeCategory = (cat) => {
  if (!cat) return "";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const ItineraryPage = () => {

  const [hoveredCard, setHoveredCard] = useState(null); // <-- move here!

  const location = useLocation();
  const {
    selectedCity,
    days,
    budget,
    groupType,
    coordinates,
    places = [],
  } = location.state || {};

  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [cityImage, setCityImage] = useState("");
  const [savedPlaceIds, setSavedPlaceIds] = useState([]);

  useEffect(() => {
    const fetchCityImage = async () => {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            selectedCity
          )}&client_id=JpOcrJiLQNTx83KrMnou-pI67Sn0GpYRnQoQX50gC5E&orientation=landscape&per_page=1`
        );
        const data = await response.json();
        const imageUrl = data.results?.[0]?.urls?.regular;
        if (imageUrl) setCityImage(imageUrl);
      } catch (error) {
        console.error("Unsplash image fetch failed:", error);
      }
    };

    if (selectedCity) fetchCityImage();
  }, [selectedCity]);

  useEffect(() => {
    if (!user) return;
    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().placeId);
      setSavedPlaceIds(ids);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (place) => {
    if (!user) return alert("Please log in to save favorites.");
    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const q = query(favoritesRef, where("placeId", "==", place.place_id));
    const existing = await getDocs(q);

    if (!existing.empty) {
      existing.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "users", user.uid, "favorites", docSnap.id));
      });
    } else {
      await addDoc(favoritesRef, {
        name: place.name,
        placeId: place.place_id,
        photo: place.photoUrl || "",
        category: "itinerary",
        createdAt: serverTimestamp(),
      });
    }
  };

  const dailyItinerary = splitIntoDays(places, parseInt(days));
  const bannerImage =
    cityImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";

    const saveItinerary = async () => {
      if (!user) {
        alert("Please log in to save your itinerary.");
        return;
      }
    
      try {
        const itineraryRef = collection(db, "users", user.uid, "itineraries");
    
        const allActivities = [];
        dailyItinerary.forEach((dayList, dayIndex) => {
          dayList.forEach((place) => {
            allActivities.push({
              name: place.name,
              photoUrl: place.photoUrl || "",
              day: dayIndex + 1,
              place_id: place.place_id || null,
              eventId: place.eventId || null,
              eventUrl: place.eventUrl || null,
              venue: place.venue || null,
              date: place.date || null,
              time: place.time || null,
              category: place.category || null,
              source: place.eventId ? "ticketmaster" : "google",
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
          cityImage: bannerImage,
          createdAt: serverTimestamp(),
          activities: allActivities, // ✅ This field must be used
        });
    
        alert("✅ Itinerary saved successfully!");
      } catch (err) {
        console.error("Error saving itinerary:", err);
        alert("Failed to save itinerary.");
      }
    };
    

  return (
      <div style={{
        padding: "2rem",
        color: "#0b1c2c",
        background: "linear-gradient(to bottom, #e0f7ff, #b3e5fc, #81d4fa)", // light soft blue gradient
        minHeight: "100vh",
        transition: "background 0.8s ease", // smoother fade
      }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
        <img
          src={bannerImage}
          alt={`${selectedCity} Travel Banner`}
          style={{
            width: "100%",
            maxWidth: "1200px",
            height: "260px",
            objectFit: "cover",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0, 123, 255, 0.5)",
          }}
        />
      </div>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center",
        margin: "1.5rem auto 2.5rem", maxWidth: "1100px"
      }}>
        <div style={bubbleStyle}>📍 <strong>Destination:</strong> {selectedCity}</div>
        <div style={bubbleStyle}>🗓️ <strong>Trip Length:</strong> {days} days</div>
        <div style={bubbleStyle}>💰 <strong>Budget:</strong> {budget}</div>
        <div style={bubbleStyle}>🥂 <strong>Group:</strong> {groupType}</div>
        {coordinates?.lat && coordinates?.lng && (
          <div style={bubbleStyle}>
            🧭 <strong>Coords:</strong> {coordinates.lat.toFixed(2)}, {coordinates.lng.toFixed(2)}
          </div>
        )}
      </div>

      <h3 style={{ color: "#00bfff", textAlign: "center", marginBottom: "1.5rem" }}>Your Personalized Itinerary</h3>

      {dailyItinerary.length > 0 ? dailyItinerary.map((day, dayIndex) => (
        <div key={dayIndex} style={{ marginBottom: "3rem" }}>
          <h3 style={{ color: "#000000", textAlign: "center", marginBottom: "1.5rem" }}>Day {dayIndex + 1}</h3>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "1.5rem",
            justifyContent: "center", maxWidth: "1800px", margin: "0 auto"
          }}>
            {day.map((place) => {
              const isTicketmaster = !!place.eventId;
              const id = place.place_id || place.eventId;
              const sourceLabel = isTicketmaster ? "🎫 Ticketmaster" : "📍 Google";

              return (
                <div
                  key={id}
                  onMouseEnter={() => setHoveredCard(id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: "#132743",
                    padding: "1rem",
                    borderRadius: "12px",
                    width: "280px",
                    boxShadow: hoveredCard === id
                      ? "0 6px 20px rgba(0, 123, 255, 0.7)"
                      : "0 4px 14px rgba(0, 123, 255, 0.5)",
                    transform: hoveredCard === id ? "scale(1.04)" : "scale(1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    color: "#fff",
                  }}
                >
                  <a href={
                    isTicketmaster
                      ? place.eventUrl
                      : `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
                  } target="_blank" rel="noopener noreferrer">
                    <img
                      src={
                        place.photoUrl && place.photoUrl !== ""
                          ? place.photoUrl
                          : place.photoReference
                          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
                          : "/no-image.jpg"
                      }
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "0.75rem",
                      }}
                    />
                  </a>
                  <h4 style={{ margin: "0 0 0.5rem", color: "#e0f2ff" }}>{place.name}</h4>

                  {isTicketmaster ? (
                    <>
                      {place.venue && <p>🏟️ <strong>{place.venue}</strong></p>}
                      {(place.date || place.time) && (
                        <p>🗓️ {place.date || "TBA"} {place.time && `at ${place.time}`}</p>
                      )}
                      <p>💸 {place.price || "Varies"}</p>
                    </>
                  ) : (
                    <>
                      <p>🕒 Duration: <strong>{place.duration}</strong></p>
                      <p>💸 Cost: <strong>{place.price}</strong></p>
                      {place.category && (
                        <p style={{ color: "#00bfff", fontWeight: "bold" }}>
                          🏷️ {capitalizeCategory(place.category)}
                        </p>
                      )}
                      <p style={{ color: place.price === "Free" ? "#4CAF50" : "#00bfff", fontWeight: "bold" }}>
                        {place.price === "Free" ? "🆓 Free" : place.price}
                      </p>
                    </>
                  )}

                  <p style={{ fontSize: "12px", color: "#90caf9" }}>{sourceLabel}</p>

                  <button onClick={() => toggleFavorite(place)} style={{
                    backgroundColor: "#0077cc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    marginTop: "0.75rem",
                    width: "100%",
                    fontWeight: "bold",
                    transition: "background-color 0.3s",
                  }}>
                    {savedPlaceIds.includes(id)
                      ? "💔 Remove from Favorites"
                      : "❤️ Save to Favorites"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )) : (
        <p style={{ textAlign: "center" }}>We’ll generate activities and events based on your preferences in the next step.</p>
      )}

      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button
          onClick={() =>
            navigate("/book-hotel", {
              state: {
                selectedCity,
                days,
                budget,
                groupType,
                coordinates,
                places,
              },
            })
          }
          style={{
            backgroundColor: "#00bfff",
            color: "#fff",
            fontSize: "1.2rem",
            fontWeight: "bold",
            padding: "14px 30px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0, 191, 255, 0.4)",
            transition: "background-color 0.3s ease",
          }}
        >
          🏨 Continue to Booking
        </button>
      </div>
    </div>
  );
};

const bubbleStyle = {
  background: "linear-gradient(135deg, #0077cc, #00bfff)",
  padding: "10px 20px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 500,
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 6px 12px rgba(0, 123, 255, 0.3)",
  backdropFilter: "blur(6px)",
};


export default ItineraryPage;
