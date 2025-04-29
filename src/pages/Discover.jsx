import { GoogleMap, LoadScriptNext } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

function Discover() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
        >
          {/* map children */}
        </GoogleMap>
      </LoadScriptNext>
    </div>
  );
}

export default Discover;
