// useLoadGoogleMaps.js
import { useState, useEffect } from "react";

const useLoadGoogleMaps = (apiKey, libraries = []) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If already loaded, skip
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    // Prevent duplicate loading
    if (document.getElementById("google-maps-script")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error("❌ Failed to load Google Maps script");
    document.body.appendChild(script);
  }, [apiKey, libraries]);

  return loaded;
};

export default useLoadGoogleMaps;
