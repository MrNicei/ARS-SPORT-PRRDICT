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
      "\nmodule.exports = { calculateLeagueAverages, calculateTeamStats, calculatePrediction };"
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
    throw new Error(
      `Football data request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return (data.matches || []).map((match) => ({
    id: match.id,
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

function brier(prediction, actual) {
  const homeActual = actual === "home" ? 1 : 0;
  const drawActual = actual === "draw" ? 1 : 0;
  const awayActual = actual === "away" ? 1 : 0;

  const homeProb = prediction.homeWin / 100;
  const drawProb = prediction.draw / 100;
  const awayProb = prediction.awayWin / 100;

  return (
    Math.pow(homeProb - homeActual, 2) +
    Math.pow(drawProb - drawActual, 2) +
    Math.pow(awayProb - awayActual, 2)
  );
}

async function main() {
  const {
    calculateLeagueAverages,
    calculateTeamStats,
    calculatePrediction
  } = loadEngine();

  const seasons = ["2023", "2024", "2025"];

  let modelCorrect = 0;
  let baselineCorrect = 0;
  let total = 0;

  let modelBrier = 0;
  let baselineBrier = 0;

  for (const season of seasons) {
    console.log(`Loading ${season}/${Number(season) + 1}...`);

    const matches = await getSeason(season);

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

      const actual = actualOutcome(match);

      const predicted =
        prediction.homeWin >= prediction.draw &&
        prediction.homeWin >= prediction.awayWin
          ? "home"
          : prediction.draw >= prediction.awayWin
          ? "draw"
          : "away";

      const historicalHomeWins =
        historical.filter(
          (m) => m.score.home > m.score.away
        ).length;

      const historicalDraws =
        historical.filter(
          (m) => m.score.home === m.score.away
        ).length;

      const historicalAwayWins =
        historical.filter(
          (m) => m.score.home < m.score.away
        ).length;

      const historicalTotal = historical.length;

      const baselineHome =
        historicalHomeWins / historicalTotal;

      const baselineDraw =
        historicalDraws / historicalTotal;

      const baselineAway =
        historicalAwayWins / historicalTotal;

      const baseline =
        baselineHome >= baselineDraw &&
        baselineHome >= baselineAway
          ? "home"
          : baselineDraw >= baselineAway
          ? "draw"
          : "away";

      if (predicted === actual) {
        modelCorrect++;
      }

      if (baseline === actual) {
        baselineCorrect++;
      }

      modelBrier += brier(prediction, actual);

      const baselinePrediction = {
        homeWin: baselineHome * 100,
        draw: baselineDraw * 100,
        awayWin: baselineAway * 100
      };

      baselineBrier +=
        brier(baselinePrediction, actual);

      total++;
    }
  }

  console.log("");
  console.log(
    "========== ARS SPORT 1X2 MODEL VS BASELINE =========="
  );
  console.log(`Matches tested: ${total}`);
  console.log("");
  console.log(
    `Model accuracy: ${(modelCorrect / total * 100).toFixed(2)}%`
  );
  console.log(
    `Baseline accuracy: ${(baselineCorrect / total * 100).toFixed(2)}%`
  );
  console.log("");
  console.log(
    `Model Brier: ${(modelBrier / total).toFixed(4)}`
  );
  console.log(
    `Baseline Brier: ${(baselineBrier / total).toFixed(4)}`
  );
  console.log(
    "====================================================="
  );
}

main().catch((error) => {
  console.error(
    "Baseline test failed:",
    error.message
  );
  process.exit(1);
});
