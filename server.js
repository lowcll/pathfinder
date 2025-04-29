// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// ✅ Allow CORS for your React app
app.use(cors({
  origin: "http://localhost:5175",
}));

// ✅ Your SerpAPI Key
const SERPAPI_KEY = "837f97c83aed8515fe3d676a57b52539996bb380ac8bef1e1828488b1025b990";

// ✅ Flight search route
app.get("/api/flights", async (req, res) => {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "Missing required query parameters." });
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${destination}&departure_date=${date}&api_key=${SERPAPI_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("✅ SerpAPI Flight Search Data:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching flights from SerpAPI:", error);
    res.status(500).json({ error: "Failed to fetch flights." });
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
