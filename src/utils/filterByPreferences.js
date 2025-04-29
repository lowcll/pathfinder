// utils/filterByPreferences.js

// Mapping tiers to keywords
const budgetTiers = {
    Cheap: ["free", "low", "park", "walk", "tour", "museum", "beach"],
    Moderate: ["moderate", "zoo", "aquarium", "festival", "event", "game"],
    Luxury: ["broadway", "vip", "premium", "opera", "fine dining", "concert"],
  };
  
  const groupTypeKeywords = {
    "Just Me": ["museum", "art", "solo", "library", "historic"],
    Couple: ["romantic", "sunset", "dinner", "date", "wine", "scenic"],
    Friends: ["concert", "club", "nightlife", "bar", "comedy", "sports", "game"],
    Family: ["zoo", "aquarium", "kids", "park", "family", "circus", "interactive"],
  };
  
  // Helper to check if any keyword matches
  const containsKeyword = (text, keywordArray) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return keywordArray.some((kw) => lower.includes(kw));
  };
  
  export const filterByPreferences = (places, budget, groupType) => {
    return places.filter((place) => {
      const name = place.name || "";
      const budgetMatch = containsKeyword(name, budgetTiers[budget] || []);
      const groupMatch = containsKeyword(name, groupTypeKeywords[groupType] || []);
  
      // Flexible logic:
      // Show if either budget OR groupType matches (can change to && if stricter needed)
      return budgetMatch || groupMatch;
    });
  };
  