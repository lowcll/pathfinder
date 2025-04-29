import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TripForm.css";
import { useTrip } from "../context/TripContext";
import { useNavigate } from "react-router-dom";


function TripForm() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [groupType, setGroupType] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [suggestions, setSuggestions] = useState([]);
  const { setTripData } = useTrip();
  const navigate = useNavigate();


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/cities", {
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
        params: {
          namePrefix: searchTerm,
          sort: "-population",
          limit: 5,
        },
      })
      .then((res) => {
        setSuggestions(res.data.data);
      })
      .catch(console.error);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

const handleSubmit = (e) => {
  e.preventDefault();
  navigate("/trip-loading", {
    state: {
      selectedCity,
      days,
      budget,
      groupType,
    },
  });
};
  

  return (
    <div className="trip-form-wrapper">
      <div className="trip-form-container">
        <div className="trip-form-header-card">
          <h2>Tell us your travel preferences 🏕️🌴</h2>
          <p>
            Just provide some basic information, and our trip planner will generate
            a customized itinerary based on your preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="trip-form">
          <div className="trip-form-group">
            <label>What is destination of choice?</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Type a city..."
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  if (val.trim() === "") {
                    setSuggestions([]);
                  }
                }}
                className="autocomplete-input"
              />
              {searchTerm && suggestions.length > 0 && (
                <ul className="autocomplete-suggestions">
                  {suggestions.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => {
                        const fullName = `${city.name}, ${city.region}, ${city.country}`;
                        setSelectedCity(fullName);
                        setSearchTerm(fullName);
                        setSuggestions([]);
                      }}                                        
                    >
                      {city.name}, {city.region}, {city.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="trip-form-group">
            <label>How many days are you planning your trip?</label>
            <input
              type="text"
              placeholder="Ex. 3"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div className="trip-form-group">
            <label>What is Your Budget?</label>
            <div className="budget-options">
              {[
                { label: "Cheap", emoji: "💸", desc: "Stay conscious of costs" },
                { label: "Moderate", emoji: "💰", desc: "Keep cost on the average side" },
                { label: "Luxury", emoji: "💸💸", desc: "Don’t worry about cost" },
              ].map(({ label, emoji, desc }) => (
                <div
                  key={label}
                  onClick={() => setBudget(label)}
                  className={`option-card ${budget === label ? "selected" : ""}`}
                >
                  <span>{emoji} {label}</span>
                  <small>{desc}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="trip-form-group">
            <label>Who do you plan on traveling with on your next adventure?</label>
            <div className="group-options">
              {[
                { label: "Just Me", emoji: "✈️", desc: "A sole traveler in exploration" },
                { label: "A Couple", emoji: "🥂", desc: "Two travelers in tandem" },
                { label: "Family", emoji: "🏡", desc: "A group of fun loving adventure" },
                { label: "Friends", emoji: "⛵", desc: "A bunch of thrill-seekers" },
              ].map(({ label, emoji, desc }) => (
                <div
                  key={label}
                  onClick={() => setGroupType(label)}
                  className={`option-card ${groupType === label ? "selected" : ""}`}
                >
                  <span>{emoji} {label}</span>
                  <small>{desc}</small>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="generate-button">Generate Trip</button>
        </form>
      </div>
    </div>
  );
}

export default TripForm;
