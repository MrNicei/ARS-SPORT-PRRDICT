const fs = require("fs");

function loadEngine() {
  const source = fs.readFileSync("./app/src/engine/predict.js", "utf8");

  const transformed = source
    .replace(/export function/g, "function")
    .replace(/export const/g, "const");

  const module = { exports: {} };

  const fn = new Function(
    "module",
    "exports",
    transformed +
      "module.exports = { calculateLeagueAverages, calculateTeamStats, calculatePrediction };"
  );

  fn(module, module.exports);

  return module.exports;
}

async function getSeason(season) {
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    throw new Error("FOOTBALL_DATA_TOKEN is not configured");
  }

  const response = await fetch(
    `https://api.football-data.org/v4/competitions/PL/matches?season=${season}`,
    {
      headers: {
        "X-Auth-Token": token
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Football data request failed: ${response.status}`);
  }

  const data = await response.json();

  return (data.matches || []).map((match) => ({
    date: match.utcDate,
    status: match.status,
    homeTeam: match.homeTeam?.name || "Unknown",
    awayTeam: match.awayTeam?.name || "Unknown",
    score: match.score?.fullTime
      ? {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away
        }
      : null
  }));
}

function actualOutcome(match) {
  if (match.score.home > match.score.away) return "home";
  if (match.score.home < match.score.away) return "away";
  return "draw";
}

function calculateBrier(home, draw, away, actual) {
  const h = actual === "home" ? 1 : 0;
  const d = actual === "draw" ? 1 : 0;
  const a = actual === "away" ? 1 : 0;

  return (
    Math.pow(home - h, 2) +
    Math.pow(draw - d, 2) +
    Math.pow(away - a, 2)
  );
}

function calibrate(probability, strength) {
  return 1 / (
    1 +
    Math.pow(
      (1 - probability) / probability,
      strength
    )
  );
}

function normalize(home, draw, away) {
  const total = home + draw + away;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total
  };
}

async function main() {
  const {
    calculateLeagueAverages,
    calculateTeamStats,
    calculatePrediction
  } = loadEngine();

  const seasons = ["2023", "2024", "2025"];  const seasonData = {};  for (const season of seasons) {    console.log(`Loading season ${season}/${Number(season) + 1}...`);    seasonData[season] = await getSeason(season);  }

  const strengths = [0.70, 0.80, 0.90, 1.00];

  for (const strength of strengths) {
    let total = 0;
    let brier = 0;
    let correct = 0;

    for (const season of seasons) {
      const matches = seasonData[season];

      const finished = matches
        .filter(
          (m) =>
            m.status === "FINISHED" &&
            m.score?.home != null &&
            m.score?.away != null
        )
        .sort(
          (a, b) =>
            new Date(a.date) - new Date(b.date)
        );

      for (let i = 0; i < finished.length; i++) {
        const match = finished[i];
        const historical = finished.slice(0, i);

        if (historical.length < 20) continue;

        const league =
          calculateLeagueAverages(historical);

        const homeStats =
          calculateTeamStats(
            historical,
            match.homeTeam
          );

        const awayStats =
          calculateTeamStats(
            historical,
            match.awayTeam
          );

        const prediction =
          calculatePrediction(
            homeStats,
            awayStats,
            league
          );

        const raw = normalize(
          prediction.homeWin / 100,
          prediction.draw / 100,
          prediction.awayWin / 100
        );

        const calibrated = normalize(
          calibrate(raw.home, strength),
          calibrate(raw.draw, strength),
          calibrate(raw.away, strength)
        );

        const actual = actualOutcome(match);

        const predicted =
          calibrated.home >= calibrated.draw &&
          calibrated.home >= calibrated.away
            ? "home"
            : calibrated.draw >= calibrated.away
            ? "draw"
            : "away";

        if (predicted === actual) {
          correct++;
        }

        brier += calculateBrier(
          calibrated.home,
          calibrated.draw,
          calibrated.away,
          actual
        );

        total++;
      }
    }

    console.log(
      `Strength ${strength.toFixed(2)} | ` +
      `Accuracy ${(correct / total * 100).toFixed(2)}% | ` +
      `Brier ${(brier / total).toFixed(4)}`
    );
  }
}

main().catch((error) => {
  console.error("Calibration failed:", error.message);
  process.exit(1);
});
