// src/firebase/favorites.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const saveToFavorites = async (user, place) => {
  if (!user) {
    alert("You must be logged in to save favorites.");
    return;
  }

  const placeRef = doc(db, "users", user.uid, "favorites", place.place_id);

  const favoriteData = {
    name: place.name,
    vicinity: place.vicinity,
    rating: place.rating || null,
    photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 300 }) || "",
    place_id: place.place_id,
    description: place.description || "", // optional, for future use
    timestamp: new Date(),
  };

  try {
    await setDoc(placeRef, favoriteData);
    alert("Saved to favorites!");
  } catch (error) {
    console.error("Error saving favorite:", error);
    alert("Failed to save. Try again.");
  }
};
