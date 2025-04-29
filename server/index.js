import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:5177",
    credentials: true,
  }));
  

const PORT = 5000;
 
app.get("/ticketmaster", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
      params: {
        apikey: process.env.TICKETMASTER_API_KEY,
        latlong: `${lat},${lng}`,
        radius: 25,
        unit: "miles",
        size: 50,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Ticketmaster fetch failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Ticketmaster fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
