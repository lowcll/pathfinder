import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { filterByPreferences } from "../utils/filterByPreferences";
import "../pages/TripLoadingPage.css";


const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const TICKETMASTER_API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;


const TripLoadingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCity, days, budget, groupType } = location.state || {};

  useEffect(() => {
    console.log(import.meta.env);
    const fetchData = async () => {
      try {
        // Step 1: Get coordinates
        const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(selectedCity)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const geoData = await geoRes.json();

        const firstResult = geoData.results?.[0];
        const coords = firstResult?.geometry?.location;

        // Double-check locality/state (to avoid "Washington" state instead of DC)
        const addressComponents = firstResult?.address_components || [];
        const isWashingtonDC = addressComponents.some((comp) =>
          comp.long_name === "District of Columbia"
        );

        if (!coords || (selectedCity.includes("District of Columbia") && !isWashingtonDC)) {
          throw new Error("Location mismatch: expected Washington DC but got something else");
        }

        // Step 2: Google Places - Tourist Attractions
        const dummyMap = new window.google.maps.Map(document.createElement("div"));
        const placesService = new window.google.maps.places.PlacesService(dummyMap);
        const placeResults = await new Promise((resolve, reject) => {
          const request = {
            query: `top attractions in ${selectedCity}`,
            location: new window.google.maps.LatLng(coords.lat, coords.lng),
            radius: 15000,
          };
          placesService.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              reject("Google Places text search failed: " + status);
            }
          });
        });


        const getPlaceDetails = (placeId) => {
          return new Promise((resolve) => {
            const service = new window.google.maps.places.PlacesService(dummyMap);
            service.getDetails(
              {
                placeId,
                fields: ["name", "photos", "geometry", "price_level", "types"],
              },
              (placeDetails) => {
                resolve(placeDetails);
              }
            );
          });
        };
        
        const googlePlaces = await Promise.all(
          placeResults.slice(0, 15).map(async (basicPlace) => {
            const details = await getPlaceDetails(basicPlace.place_id);
        
            const types = details.types || [];
            let category = "sightseeing";
            if (types.includes("museum")) category = "museum";
            else if (types.includes("park")) category = "nature";
            else if (types.includes("shopping_mall")) category = "shopping";
            else if (types.includes("night_club")) category = "nightlife";
        
            const durationMap = {
              museum: "2 hrs",
              nature: "1.5 hrs",
              shopping: "1 hr",
              nightlife: "3 hrs",
              sightseeing: "1.5 hrs",
            };
            const duration = durationMap[category] || "1.5 hrs";
        
            const priceLevelMap = {
              0: "Free",
              1: "$",
              2: "$$",
              3: "$$$",
              4: "$$$$",
            };
            const price =
              typeof details.price_level === "number"
                ? priceLevelMap[details.price_level]
                : "Free";
        
            const photoRef = details.photos?.[0]?.getUrl
              ? details.photos[0].getUrl({ maxWidth: 400 })
              : "";
        
            return {
              name: details.name || basicPlace.name,
              place_id: basicPlace.place_id,
              photoUrl: photoRef,
              photoReference: details.photos?.[0]?.photo_reference || null,
              source: "google",
              category,
              price,
              duration,
            };
          })
        );
        
        
        
        
        

        // Step 3: Fetch Ticketmaster events
        let ticketmasterEvents = []; // initialize empty in case fetch fails
        try {
          const ticketmasterRes = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=gKZiaHYoaqHXGTDu4v1UXztvb854b343&latlong=${coords.lat},${coords.lng}&radius=25&unit=miles&size=50`
          );
          const tmData = await ticketmasterRes.json();
          const rawEvents = tmData._embedded?.events || [];

          // Step 3.1: Filter based on budget
          const filteredEvents = filterTicketmasterEventsByPreferences(rawEvents, budget);

          const ALLOWED_SEGMENTS = ["Music", "Sports", "Arts & Theatre"];
          const today = new Date();
          const tripEnd = new Date();
          tripEnd.setDate(today.getDate() + parseInt(days));

          const withinTripWindow = (event) => {
            const dateStr = event.dates?.start?.localDate;
            if (!dateStr) return false;
            const eventDate = new Date(dateStr);
            return eventDate >= today && eventDate <= tripEnd;
          };

          const uniqueEvents =
            tmData._embedded?.events?.filter((event) => {
              const segmentName = event.classifications?.[0]?.segment?.name;
              return ALLOWED_SEGMENTS.includes(segmentName) && withinTripWindow(event);
            }) || [];

          ticketmasterEvents = uniqueEvents.map((event) => ({
            name: event.name,
            place_id: event.id,
            eventId: event.id,
            eventUrl: event.url,
            photoUrl: event.images?.[0]?.url || "",
            source: "ticketmaster",
            venue: event._embedded?.venues?.[0]?.name || "Unknown Venue",
            date: event.dates?.start?.localDate || null,
            time: event.dates?.start?.localTime || null,
            category: "event",
          }));

        } catch (error) {
          console.warn("Ticketmaster fetch failed:", error.message);
          ticketmasterEvents = []; // continue gracefully
        }

        
        

        // Step 4: Merge & Deduplicate
        const allPlaces = [...googlePlaces];
        ticketmasterEvents.forEach((event) => {
          const isDuplicate = googlePlaces.some((place) => place.name === event.name);
          if (!isDuplicate) {
            allPlaces.push(event);
          }
        });

        const allUniquePlaces = [
          ...googlePlaces,
          ...ticketmasterEvents.filter(
            (event) => !googlePlaces.some((p) => p.name === event.name)
          ),
        ];
        
        // ✅ Step: Filter by budget + groupType
        let filteredPlaces = filterByPreferences(allUniquePlaces, budget, groupType);

        // ✅ Step: Fallback – if too few, mix in some generic events
        if (filteredPlaces.length < 10) {
          const filler = allUniquePlaces.filter(
            (place) =>
              !filteredPlaces.find((p) => p.name === place.name) // avoid duplicates
          );
          filteredPlaces = [...filteredPlaces, ...filler.slice(0, 10 - filteredPlaces.length)];
        }

        // Step 5: Navigate to itinerary with full data
        setTimeout(() => {
          console.log("Generated places:", allPlaces.slice(0, 5)); // just sample 5 places

          navigate("/itinerary", {
            state: {
              selectedCity,
              days,
              budget,
              groupType,
              coordinates: coords,
              places: allPlaces,
            },
          });
        }, 2000);
      } catch (error) {
        console.error("❌ Error loading trip:", error);
      }
    };

    // Maps user budget to a max price value
    const getMaxPriceFromBudget = (budget) => {
      switch (budget.toLowerCase()) {
        case "cheap":
          return 25;
        case "moderate":
          return 75;
        case "expensive":
          return 9999; // No upper limit
        default:
          return 9999;
      }
    };

    const getPhotoUrl = (place) => {
      // Try getUrl() first
      if (place.photos?.[0]?.getUrl) {
        return place.photos[0].getUrl({ maxWidth: 400 });
      }
    
      // Fallback to using photo_reference with the Places API
      const photoRef = place.photos?.[0]?.photo_reference;
      if (photoRef) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
      }
    
      return ""; // No image available
    };
    

    // Filters Ticketmaster events by max price
    const filterTicketmasterEventsByPreferences = (events, budget) => {
      const maxPrice = getMaxPriceFromBudget(budget);

      return events.filter((event) => {
        const priceRange = event.priceRanges?.[0];
        if (!priceRange || isNaN(priceRange.min)) return true; // keep if no price data

        return priceRange.min <= maxPrice;
      });
    };

    fetchData();
  }, [selectedCity, days, budget, groupType, navigate]);

  return (
    <div className="trip-loading-page">
      <h1>✈️ Generating Your Trip Itinerary...</h1>
      <p>This may take a few seconds while we fetch the best attractions and events.</p>
      <div className="trip-spinner" />
    </div>
  );
  
};

export default TripLoadingPage;
