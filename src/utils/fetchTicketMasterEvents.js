// src/utils/fetchTicketmasterEvents.js

import axios from "axios";

const TICKETMASTER_API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;

export const fetchTicketmasterEvents = async (city, startDate, numDays) => {
  try {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + numDays);

    const start = new Date(startDate).toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&city=${encodeURIComponent(
      city
    )}&startDateTime=${start}T00:00:00Z&endDateTime=${end}T23:59:59Z&size=30`;

    const response = await axios.get(url);

    const events = response?.data?._embedded?.events || [];

    // Transform each event to match our itinerary format
    return events.map((event) => ({
      name: event.name,
      place_id: event.id, // Use Ticketmaster ID
      photoUrl:
        event.images?.[0]?.url ||
        "https://via.placeholder.com/300x200?text=No+Image",
      day: 0, // We'll assign actual day later via splitIntoDays()
      isEvent: true, // Helpful for styling or filtering later
    }));
  } catch (error) {
    console.error("Ticketmaster fetch failed:", error);
    return [];
  }
};
