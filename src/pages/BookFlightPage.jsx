import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

const BookFlightPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCity, days, budget, groupType, coordinates, hotelBooking, places } = location.state || {};

  const [originInput, setOriginInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [originPlaceId, setOriginPlaceId] = useState("");

  const [destinationInput, setDestinationInput] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationPlaceId, setDestinationPlaceId] = useState("");

  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [selectedFlight, setSelectedFlight] = useState(null);

  // fetch airport suggestions
  const fetchAirportSuggestions = async (query, setSuggestions) => {
    try {
      const res = await fetch(`https://booking-com18.p.rapidapi.com/flights/v2/auto-complete?query=${query}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com18.p.rapidapi.com"
        }
      });

      const data = await res.json();

      if (data.data && Array.isArray(data.data)) {
        const airportOnly = data.data
          .filter(item => item.type === "AIRPORT")
          .map(item => ({
            name: item.name || "unknown airport",
            iata: item.code || "",
            city: item.city || "",
            country: item.countryName || "",
          }));

        setSuggestions(airportOnly);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("fetch airports error", err);
      setSuggestions([]);
    }
  };

  // handle input changes
  const handleOriginInputChange = (e) => {
    const value = e.target.value;
    setOriginInput(value);
    if (value.length > 2) {
      fetchAirportSuggestions(value, setOriginSuggestions);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationInputChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);
    if (value.length > 2) {
      fetchAirportSuggestions(value, setDestinationSuggestions);
    } else {
      setDestinationSuggestions([]);
    }
  };

  // select airport
  const handleSelectOrigin = (airport) => {
    setOriginInput(`${airport.name} (${airport.iata})`);
    setOriginPlaceId(airport.iata);
    setOriginSuggestions([]);
  };

  const handleSelectDestination = (airport) => {
    setDestinationInput(`${airport.name} (${airport.iata})`);
    setDestinationPlaceId(airport.iata);
    setDestinationSuggestions([]);
  };

  // search flights
  const handleSearchFlights = async () => {
    if (!originPlaceId || !destinationPlaceId || !departureDate || !returnDate) {
      alert("please select an origin, destination, and dates");
      return;
    }

    setLoading(true);
    setSearching(true);
    setError("");
    setFlights([]);

    const flightSearchUrl = `https://booking-com18.p.rapidapi.com/flights/v2/search-roundtrip?departId=${originPlaceId}&arrivalId=${destinationPlaceId}&departDate=${departureDate}&returnDate=${returnDate}`;

    try {
      const res = await fetch(flightSearchUrl, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "booking-com18.p.rapidapi.com"
        }
      });

      const data = await res.json();

      if (data.data?.flightOffers?.length > 0) {
        setFlights(data.data.flightOffers);
      } else {
        setFlights([]);
        setError("no flights found for selected route");
      }
    } catch (err) {
      console.error("error fetching flights", err);
      setError("could not fetch flights");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // select flight and move to trip summary
  const handleSelectFlight = (flight) => {
    navigate("/trip-summary", {
      state: { selectedCity, coordinates, selectedFlight: flight }
    });
  };

  // auto suggest based on selected city
  useEffect(() => {
    if (selectedCity) {
      const cityName = selectedCity.split(",")[0];
      fetchAirportSuggestions(cityName, setDestinationSuggestions);
    }
  }, [selectedCity]);

  return (
    <div style={{
      padding: "2rem",
      background: "linear-gradient(to bottom, #e0f7ff, #b3e5fc, #81d4fa)",
      minHeight: "100vh",
      color: "#0b1c2c",
    }}>    
      {/* Origin Input */}

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

      <div style={{ marginBottom: "1rem" }}>
        <label>Enter Your Departure Airport:</label>
        <input
          type="text"
          value={originInput}
          onChange={handleOriginInputChange}
          placeholder="Type airport name or code..."
          style={{
            width: "100%",
            padding: "1.5rem",
            marginTop: "0.5rem",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "#0b1c2c",
            border: "1px solid #00bfff",
          }}
        />
        {originSuggestions.length > 0 && (
          <ul style={{
            background: "#ffffff",
            padding: "1.5rem",
            borderRadius: "10px",
            marginTop: "0.5rem",
            boxShadow: "0 6px 12px rgba(0, 191, 255, 0.4)",
            listStyle: "none",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {originSuggestions.map((airport, index) => (
              <li
                key={index}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: index !== originSuggestions.length - 1 ? "1px solid #444" : "none",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  borderRadius: "8px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                onClick={() => handleSelectOrigin(airport)}
              >
                <span style={{ fontSize: "1rem", fontWeight: "500" }}>{airport.name}</span>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>Code: {airport.iata}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Destination Input */}
      <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
        <label>Pick a Destination Airport:</label>
        <input
          type="text"
          value={destinationInput}
          onChange={handleDestinationInputChange}
          placeholder="Type airport name or code..."
          style={{
            width: "100%",
            padding: "1.5rem",
            marginTop: "0.5rem",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            color: "#0b1c2c",
            border: "1px solid #00bfff",

          }}
        />
        {destinationSuggestions.length > 0 && (
          <ul style={{
            background: "#ffffff",
            padding: "1.5rem",
            borderRadius: "10px",
            marginTop: "0.5rem",
            boxShadow: "0 6px 12px rgba(0, 191, 255, 0.4)",
            listStyle: "none",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {destinationSuggestions.map((airport, index) => (
              <li
                key={index}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: index !== destinationSuggestions.length - 1 ? "1px solid #444" : "none",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  borderRadius: "8px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                onClick={() => handleSelectDestination(airport)}
              >
                <span style={{ fontSize: "1rem", fontWeight: "500" }}>{airport.name}</span>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>Code: {airport.iata}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Departure Date */}
      <div 
      style={{
        width: "100%",
        padding: "0.5rem",
        marginTop: "0.5rem",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#0b1c2c",
        border: "1px solid #00bfff",
      }}
      >
        <label>Select Departure Date:</label>
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        />
      </div>

      {/* Return Date */}
      <div style={{
        width: "100%",
        padding: "0.5rem",
        marginTop: "0.5rem",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "#0b1c2c",
        border: "1px solid #00bfff",
      }}>
        <label>Select Return Date:</label>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        />
      </div>

      {/* Search Flights Button */}
      <button
        onClick={handleSearchFlights}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#00b894",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "2rem"
        }}
      >
        {loading ? "Searching Flights..." : "Search Flights"}
      </button>

      {/* Available Flights */}
      <h3>Available Flights:</h3>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {flights.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          {flights.slice(0, 10).map((flight, index) => {
            const price = flight.priceBreakdown?.total?.units || "";
            const currency = flight.priceBreakdown?.total?.currencyCode || "";
            const firstSegment = flight.segments?.[0];
            const firstLeg = firstSegment?.legs?.[0];

            const airline = firstLeg?.carriersData?.[0]?.name || "Unknown Airline";
            const airlineLogo = firstLeg?.carriersData?.[0]?.logo || "";

            const departureAirport = firstLeg?.departureAirport?.name || "Unknown Departure";
            const arrivalAirport = firstLeg?.arrivalAirport?.name || "Unknown Arrival";

            const departureTime = firstLeg?.departureTime ? new Date(firstLeg.departureTime) : null;
            const arrivalTime = firstLeg?.arrivalTime ? new Date(firstLeg.arrivalTime) : null;
            const durationMinutes = Math.round(firstLeg?.totalTime || 0);

            return (
              <div
                key={index}
                style={{
                  background: selectedFlight === flight ? "#d0f0ff" : "#ffffff",
                  color: "#0b1c2c",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  boxShadow: selectedFlight === flight
                    ? "0 6px 20px rgba(0, 191, 255, 0.7)"
                    : "0 4px 14px rgba(0, 191, 255, 0.4)",
                  transform: selectedFlight === flight ? "scale(1.04)" : "scale(1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  border: "1px solid #00bfff",
                  cursor: "pointer",
                }}                
                onClick={() => setSelectedFlight(flight)}
              >
                <p><strong>Price:</strong> {currency} {price}</p>
                <p><strong>Airline:</strong> {airline}</p>
                {airlineLogo && <img src={airlineLogo} alt="Airline Logo" style={{ width: "80px", margin: "0.5rem 0" }} />}
                <p><strong>From:</strong> {departureAirport} → {arrivalAirport}</p>
                {departureTime && <p><strong>Departure Time:</strong> {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                {arrivalTime && <p><strong>Arrival Time:</strong> {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                <p><strong>Duration:</strong> {durationMinutes} minutes</p>
              </div>
            );
          })}
        </div>
      )}

      {selectedFlight && (
        <button
          onClick={() => navigate("/trip-summary", {
            state: {
              selectedCity,
              days,
              budget,
              groupType,
              coordinates,
              hotelBooking,
              selectedFlight,
              places,
            },
          })}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#00cec9",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Continue to Trip Summary
        </button>
      )}



    </div>
  );
};

export default BookFlightPage;
