import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import "./DiscoverPage.css";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const categories = [
  { label: "Restaurants", value: "restaurant" },
  { label: "Attractions", value: "tourist_attraction" },
  { label: "Cafes", value: "cafe" },
  { label: "Museums", value: "museum" },
  { label: "Parks", value: "park" },
];

function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState("restaurant");
  const [places, setPlaces] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapInstance = useRef(null);
  const cardRefs = useRef({});
  const [user] = useAuthState(auth);
  const [savedPlaceIds, setSavedPlaceIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
        },
        () => {
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Fetch places when user location or map changes
  useEffect(() => {
    if (userLocation && mapRef && window.google?.maps) {
      fetchPlaces(mapRef, selectedCategory);
    }
  }, [userLocation, mapRef, selectedCategory]);

  // Listen for changes to favorites in Firestore
  useEffect(() => {
    if (!user) return;
    const favoritesRef = collection(db, "users", user.uid, "favorites");

    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().placeId);
      setSavedPlaceIds(ids);
    });

    return () => unsubscribe();
  }, [user]);

  const fetchPlaces = (map, category) => {
    setLoading(true);

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: userLocation || defaultCenter,
      radius: 5000,
      type: category,
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
      } else {
        setPlaces([]);
      }
      setLoading(false);
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleMarkerClick = (place) => {
    setSelectedPlaceId(place.place_id);
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    mapInstance.current?.panTo({ lat, lng });
    mapInstance.current?.setZoom(16);

    const card = cardRefs.current[place.place_id];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleToggleFavorite = async (place) => {
    if (!user) return alert("Please log in to use this feature.");

    const favoritesRef = collection(db, "users", user.uid, "favorites");
    const placeDocQuery = query(favoritesRef, where("placeId", "==", place.place_id));
    const existing = await getDocs(placeDocQuery);

    if (!existing.empty) {
      existing.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "users", user.uid, "favorites", docSnap.id));
      });
    } else {
      const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 300 }) || "";
      await addDoc(favoritesRef, {
        name: place.name,
        address: place.vicinity,
        rating: place.rating || null,
        category: selectedCategory,
        photo: photoUrl,
        createdAt: serverTimestamp(),
        placeId: place.place_id,
      });
    }
  };

  return (
    <div className="discover-container">
      <div className="sidebar">
        <div className="filter-section">
          <label className="selected-category-label">
            <strong>
              {
                categories.find((cat) => cat.value === selectedCategory)?.label ||
                "Categories"
              }
            </strong>{" "}
            around you:
          </label>
          <select
            className="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cards-container">
          {loading ? (
            <p style={{ padding: "1rem" }}>Loading...</p>
          ) : places.length === 0 ? (
            <p style={{ padding: "1rem" }}>No places found.</p>
          ) : (
            places.map((place) => (
              <div
                key={place.place_id}
                ref={(el) => (cardRefs.current[place.place_id] = el)}
                className={`place-card ${
                  selectedPlaceId === place.place_id ? "highlighted" : ""
                }`}
              >
                {place.photos ? (
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={place.photos[0].getUrl({ maxWidth: 300 })}
                      alt={place.name}
                      className="place-image"
                    />
                  </a>
                ) : (
                  <div
                    className="place-image"
                    style={{
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#eee",
                      fontSize: "0.9rem",
                      color: "#888",
                    }}
                  >
                    No Image
                  </div>
                )}
                <h3>{place.name}</h3>
                <p>
                  Rating:{" "}
                  {"★".repeat(Math.round(place.rating || 0)) +
                    "☆".repeat(5 - Math.round(place.rating || 0))}
                </p>
                <p>{place.vicinity}</p>
                <button
                  className="save-button"
                  onClick={() => handleToggleFavorite(place)}
                  style={{
                    backgroundColor: savedPlaceIds.includes(place.place_id)
                      ? "#000"
                      : "#000",
                    color: "#fff",
                  }}
                >
                  {savedPlaceIds.includes(place.place_id)
                    ? "💔 Remove from Favorites"
                    : "❤️ Save to Favorites"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="map-wrapper">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={13}
          onLoad={(map) => {
            setMapRef(map);
            mapInstance.current = map;
          }}
        >
          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              onClick={() => handleMarkerClick(place)}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}

export default DiscoverPage;
