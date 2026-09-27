require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ name: "ARS SPORT API", status: "running" });
});

app.get("/api/matches", async (req, res) => {
  try {
    if (!process.env.FOOTBALL_DATA_TOKEN) {
      return res.status(500).json({ error: "FOOTBALL_DATA_TOKEN is not configured" });
    }

    const response = await fetch("https://api.football-data.org/v4/competitions/PL/matches", {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_TOKEN }
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({
        error: "Football data request failed",
        details
      });
    }

    const data = await response.json();

    const matches = data.matches.map(match => ({
      id: match.id,
      date: match.utcDate,
      status: match.status,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: match.score?.fullTime
        ? {
            home: match.score.fullTime.home,
            away: match.score.fullTime.away
          }
        : null
    }));

    res.json({
      competition: "Premier League",
      matches
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ARS SPORT API running on port ${PORT}`);
});
