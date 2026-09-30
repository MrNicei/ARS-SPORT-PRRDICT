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
    throw new Error(`Football data request failed: ${response.status}`);
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

function outcomeFromProbabilities(home, draw, away) {
  if (home >= draw && home >= away) return "home";
  if (draw >= away) return "draw";
  return "away";
}

async function main() {
  const {
    calculateLeagueAverages,
    calculateTeamStats,
    calculatePrediction
  } = loadEngine();

  const season = process.argv[2] || "2025";

  console.log(
    `Loading Premier League ${season}/${Number(season) + 1}...`
  );

  const matches = await getSeason(season);

  const finished = matches
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        m.score?.home != null &&
        m.score?.away != null
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(`Finished matches found: ${finished.length}`);

  let arsCorrect = 0;
  let baselineCorrect = 0;

  let arsBrier = 0;
  let baselineBrier = 0;

  let total = 0;

  for (let i = 0; i < finished.length; i++) {
    const match = finished[i];
    const historical = finished.slice(0, i);

    if (historical.length < 20) continue;

    const league = calculateLeagueAverages(historical);

    // ARS SPORT model
    const homeStats = calculateTeamStats(
      historical,
      match.homeTeam
    );

    const awayStats = calculateTeamStats(
      historical,
      match.awayTeam
    );

    const prediction = calculatePrediction(
      homeStats,
      awayStats,
      league
    );

    const actual = actualOutcome(match);

    const arsPredicted = outcomeFromProbabilities(
      prediction.homeWin,
      prediction.draw,
      prediction.awayWin
    );

    if (arsPredicted === actual) {
      arsCorrect++;
    }

    const arsHome = prediction.homeWin / 100;
    const arsDraw = prediction.draw / 100;
    const arsAway = prediction.awayWin / 100;

    // Historical baseline
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;

    historical.forEach((m) => {
      if (m.score.home > m.score.away) homeWins++;
      else if (m.score.home < m.score.away) awayWins++;
      else draws++;
    });

    const historicalTotal = homeWins + draws + awayWins;

    const baseHome = homeWins / historicalTotal;
    const baseDraw = draws / historicalTotal;
    const baseAway = awayWins / historicalTotal;

    const baselinePredicted = outcomeFromProbabilities(
      baseHome,
      baseDraw,
      baseAway
    );

    if (baselinePredicted === actual) {
      baselineCorrect++;
    }

    const homeActual = actual === "home" ? 1 : 0;
    const drawActual = actual === "draw" ? 1 : 0;
    const awayActual = actual === "away" ? 1 : 0;

    arsBrier +=
      Math.pow(arsHome - homeActual, 2) +
      Math.pow(arsDraw - drawActual, 2) +
      Math.pow(arsAway - awayActual, 2);

    baselineBrier +=
      Math.pow(baseHome - homeActual, 2) +
      Math.pow(baseDraw - drawActual, 2) +
      Math.pow(baseAway - awayActual, 2);

    total++;
  }

  if (!total) {
    console.log("No matches were eligible for backtesting.");
    return;
  }

  const arsAccuracy = (arsCorrect / total) * 100;
  const baselineAccuracy = (baselineCorrect / total) * 100;

  const arsBrierScore = arsBrier / total;
  const baselineBrierScore = baselineBrier / total;

  console.log("");
  console.log("========== ARS SPORT PREDICT vs BASELINE ==========");
  console.log(`Season: ${season}/${Number(season) + 1}`);
  console.log(`Matches tested: ${total}`);
  console.log("");
  console.log("ARS SPORT PREDICT");
  console.log(`Correct: ${arsCorrect}`);
  console.log(`Accuracy: ${arsAccuracy.toFixed(2)}%`);
  console.log(`Brier score: ${arsBrierScore.toFixed(4)}`);
  console.log("");
  console.log("HISTORICAL BASELINE");
  console.log(`Correct: ${baselineCorrect}`);
  console.log(`Accuracy: ${baselineAccuracy.toFixed(2)}%`);
  console.log(`Brier score: ${baselineBrierScore.toFixed(4)}`);
  console.log("");
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Backtest failed:", error.message);
  process.exit(1);
});
