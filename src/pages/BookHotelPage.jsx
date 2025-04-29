import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BookHotelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedCity,
    days,
    budget,
    groupType,
    coordinates,
    places,
  } = location.state || {};
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null); // moved inside correctly

  useEffect(() => {
    if (!coordinates) return;

    const dummyMap = new window.google.maps.Map(document.createElement("div"));
    const service = new window.google.maps.places.PlacesService(dummyMap);

    const request = {
      location: new window.google.maps.LatLng(coordinates.lat, coordinates.lng),
      radius: 5000,
      type: "lodging",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const hotelData = results.slice(0, 6).map((place) => ({
          name: place.name,
          address: place.vicinity,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }) || "",
          rating: place.rating || "N/A",
        }));
        setHotels(hotelData);
      }
      setLoading(false);
    });
  }, [coordinates]);

  if (loading) {
    return (
      <div style={{
        padding: "2rem",
        background: "linear-gradient(to bottom, #e0f7ff, #b3e5fc, #81d4fa)",
        minHeight: "100vh",
        textAlign: "center",
        color: "#0b1c2c",
      }}>
        Loading hotels...
      </div>
    );
  }

  return (
    <div style={{
      padding: "2rem",
      background: "linear-gradient(to bottom, #e0f7ff, #b3e5fc, #81d4fa)",
      minHeight: "100vh",
      color: "#0b1c2c",
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#0077cc",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "1rem",
          transition: "background-color 0.3s ease",
        }}
      >
        ⬅️ Back
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#0077cc" }}>
        🏨 Choose a Hotel in {selectedCity}
      </h2>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: "center",
      }}>
        {hotels.map((hotel, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: "#ffffff",
              color: "#0b1c2c",
              width: "300px",
              padding: "1rem",
              borderRadius: "12px",
              boxShadow: hoveredCard === i
                ? "0 6px 20px rgba(0, 123, 255, 0.7)"
                : "0 4px 14px rgba(0, 123, 255, 0.4)",
              transform: hoveredCard === i ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {hotel.photoUrl && (
              <img
                src={hotel.photoUrl}
                alt={hotel.name}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
            )}
            <h3 style={{ marginBottom: "0.5rem" }}>{hotel.name}</h3>
            <p style={{ marginBottom: "0.5rem" }}>{hotel.address}</p>
            <p style={{ marginBottom: "1rem" }}>⭐ {hotel.rating}</p>
            <button
              onClick={() =>
                navigate("/book-flight", {
                  state: {
                    selectedCity,
                    days,
                    budget,
                    groupType,
                    coordinates,
                    hotelBooking: {
                      name: hotel.name,
                      address: hotel.address,
                      rating: hotel.rating,
                      photoUrl: hotel.photoUrl || "",
                      price: hotel.price || "N/A",
                    },
                    places,
                  },
                })
              }
              style={{
                backgroundColor: "#00bfff",
                color: "#fff",
                padding: "10px 20px",
                width: "100%",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
            >
              ✅ Select Hotel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookHotelPage;
