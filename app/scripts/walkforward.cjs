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

  return (data.matches || [])
    .map((match) => ({
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
    }))
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
}

function actualOutcome(match) {
  if (match.score.home > match.score.away) return "home";
  if (match.score.home < match.score.away) return "away";
  return "draw";
}

function calibrateProbability(p, strength) {
  if (p <= 0 || p >= 1) return p;

  return 1 / (
    1 +
    Math.pow((1 - p) / p, strength)
  );
}

function calibratePrediction(prediction, strength) {
  const home = calibrateProbability(
    prediction.homeWin / 100,
    strength
  );

  const draw = calibrateProbability(
    prediction.draw / 100,
    strength
  );

  const away = calibrateProbability(
    prediction.awayWin / 100,
    strength
  );

  const total = home + draw + away;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total
  };
}

function brier(probs, actual) {
  const homeActual = actual === "home" ? 1 : 0;
  const drawActual = actual === "draw" ? 1 : 0;
  const awayActual = actual === "away" ? 1 : 0;

  return (
    Math.pow(probs.home - homeActual, 2) +
    Math.pow(probs.draw - drawActual, 2) +
    Math.pow(probs.away - awayActual, 2)
  );
}

function getPrediction(
  historical,
  match,
  calculateLeagueAverages,
  calculateTeamStats,
  calculatePrediction
) {
  const league = calculateLeagueAverages(historical);

  const homeStats = calculateTeamStats(
    historical,
    match.homeTeam
  );

  const awayStats = calculateTeamStats(
    historical,
    match.awayTeam
  );

  return calculatePrediction(
    homeStats,
    awayStats,
    league
  );
}

function evaluateSeason(
  matches,
  strength,
  engine
) {
  let total = 0;
  let rawBrier = 0;
  let calibratedBrier = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const historical = matches.slice(0, i);

    if (historical.length < 20) continue;

    const prediction = getPrediction(
      historical,
      match,
      engine.calculateLeagueAverages,
      engine.calculateTeamStats,
      engine.calculatePrediction
    );

    const raw = {
      home: prediction.homeWin / 100,
      draw: prediction.draw / 100,
      away: prediction.awayWin / 100
    };

    const calibrated =
      calibratePrediction(prediction, strength);

    const actual = actualOutcome(match);

    rawBrier += brier(raw, actual);
    calibratedBrier += brier(calibrated, actual);

    total++;
  }

  return {
    total,
    rawBrier: rawBrier / total,
    calibratedBrier: calibratedBrier / total
  };
}

async function main() {
  const engine = loadEngine();

  const seasons = ["2023", "2024", "2025"];

  const data = {};

  for (const season of seasons) {
    console.log(
      `Loading ${season}/${Number(season) + 1}...`
    );

    data[season] = await getSeason(season);

    console.log(
      `Finished matches: ${data[season].length}`
    );
  }

  const strengths = [0.70, 0.80, 0.90, 1.00];

  console.log("");
  console.log(
    "========== WALK-FORWARD CALIBRATION =========="
  );

  for (let v = 1; v < seasons.length; v++) {
    const validationSeason = seasons[v];
    const trainingSeasons = seasons.slice(0, v);

    let bestStrength = null;
    let bestBrier = Infinity;

    for (const strength of strengths) {
      let total = 0;
      let score = 0;

      for (const season of trainingSeasons) {
        const result = evaluateSeason(
          data[season],
          strength,
          engine
        );

        score += result.calibratedBrier * result.total;
        total += result.total;
      }

      const average = score / total;

      if (average < bestBrier) {
        bestBrier = average;
        bestStrength = strength;
      }
    }

    const validation = evaluateSeason(
      data[validationSeason],
      bestStrength,
      engine
    );

    console.log("");
    console.log(
      `Validation season: ${validationSeason}/${Number(validationSeason) + 1}`
    );
    console.log(
      `Training seasons: ${trainingSeasons.join(", ")}`
    );
    console.log(
      `Selected strength: ${bestStrength.toFixed(2)}`
    );
    console.log(
      `Matches tested: ${validation.total}`
    );
    console.log(
      `Uncalibrated Brier: ${validation.rawBrier.toFixed(4)}`
    );
    console.log(
      `Calibrated Brier: ${validation.calibratedBrier.toFixed(4)}`
    );
    console.log(
      `Brier change: ${(validation.calibratedBrier - validation.rawBrier).toFixed(4)}`
    );
  }

  console.log("");
  console.log(
    "=============================================="
  );
}

main().catch((error) => {
  console.error(
    "Walk-forward failed:",
    error.message
  );
  process.exit(1);
});
