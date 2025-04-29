// src/context/TripContext.jsx
import { createContext, useContext, useState } from "react";

export const TripContext = createContext();

export function TripProvider({ children }) {
  const [tripData, setTripData] = useState({
    selectedCity: "",
    days: "",
    budget: "",
    groupType: "",
  });

  return (
    <TripContext.Provider value={{ tripData, setTripData }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
