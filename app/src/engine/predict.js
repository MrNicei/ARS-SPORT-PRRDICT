const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const factorial = (n) => {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const poisson = (goals, lambda) =>
  Math.exp(-lambda) * Math.pow(lambda, goals) / factorial(goals);

const weightedAverage = (values) => {
  if (!values.length) return null;

  let weightedSum = 0;
  let weightTotal = 0;

  values.forEach((value, index) => {
    const weight = Math.pow(0.85, values.length - 1 - index);
    weightedSum += value * weight;
    weightTotal += weight;
  });

  return weightedSum / weightTotal;
};

export function calculateLeagueAverages(matches) {
  const finished = matches.filter(
    (m) =>
      m.status === "FINISHED" &&
      m.score?.home != null &&
      m.score?.away != null
  );

  if (!finished.length) {
    return {
      homeGoals: 1.5,
      awayGoals: 1.2
    };
  }

  const homeGoals =
    finished.reduce((sum, m) => sum + m.score.home, 0) /
    finished.length;

  const awayGoals =
    finished.reduce((sum, m) => sum + m.score.away, 0) /
    finished.length;

  return {
    homeGoals: clamp(homeGoals, 0.8, 2.5),
    awayGoals: clamp(awayGoals, 0.6, 2.2)
  };
}

export function calculateTeamStats(
  matches,
  teamName,
  recentLimit = 10
) {
  const finished = matches
    .filter(
      (m) =>
        m.status === "FINISHED" &&
        m.score?.home != null &&
        m.score?.away != null &&
        (m.homeTeam === teamName || m.awayTeam === teamName)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-recentLimit);

  if (!finished.length) {
    return {
      matches: 0,
      homeMatches: 0,
      awayMatches: 0,
      goalsFor: 1.4,
      goalsAgainst: 1.3,
      homeGoalsFor: 1.4,
      homeGoalsAgainst: 1.2,
      awayGoalsFor: 1.2,
      awayGoalsAgainst: 1.4,
      formPoints: 1.3
    };
  }

  const goalsFor = [];
  const goalsAgainst = [];
  const homeFor = [];
  const homeAgainst = [];
  const awayFor = [];
  const awayAgainst = [];
  const points = [];

  finished.forEach((match) => {
    const home = match.score.home;
    const away = match.score.away;

    if (match.homeTeam === teamName) {
      goalsFor.push(home);
      goalsAgainst.push(away);
      homeFor.push(home);
      homeAgainst.push(away);

      if (home > away) points.push(3);
      else if (home === away) points.push(1);
      else points.push(0);
    } else {
      goalsFor.push(away);
      goalsAgainst.push(home);
      awayFor.push(away);
      awayAgainst.push(home);

      if (away > home) points.push(3);
      else if (away === home) points.push(1);
      else points.push(0);
    }
  });

  const average = (arr, fallback) =>
    arr.length ? weightedAverage(arr) : fallback;

  return {
    matches: finished.length,
    homeMatches: homeFor.length,
    awayMatches: awayFor.length,

    goalsFor: average(goalsFor, 1.4),
    goalsAgainst: average(goalsAgainst, 1.3),

    homeGoalsFor: average(homeFor, 1.5),
    homeGoalsAgainst: average(homeAgainst, 1.2),

    awayGoalsFor: average(awayFor, 1.2),
    awayGoalsAgainst: average(awayAgainst, 1.4),

    formPoints: average(points, 1.3)
  };
}

export function calculatePrediction(
  homeStats,
  awayStats,
  league = {
    homeGoals: 1.5,
    awayGoals: 1.2
  }
) {
  const homeSample = Math.min(homeStats.matches, 10);
  const awaySample = Math.min(awayStats.matches, 10);

  const homeReliability = homeSample / 10;
  const awayReliability = awaySample / 10;

  const homeAttack =
    homeStats.homeGoalsFor / league.homeGoals;

  const homeDefense =
    homeStats.homeGoalsAgainst / league.awayGoals;

  const awayAttack =
    awayStats.awayGoalsFor / league.awayGoals;

  const awayDefense =
    awayStats.awayGoalsAgainst / league.homeGoals;

  const homeFormBoost =
    0.90 + (homeStats.formPoints / 3) * 0.20;

  const awayFormBoost =
    0.90 + (awayStats.formPoints / 3) * 0.20;

  let expectedHomeGoals =
    league.homeGoals *
    homeAttack *
    awayDefense *
    homeFormBoost;

  let expectedAwayGoals =
    league.awayGoals *
    awayAttack *
    homeDefense *
    awayFormBoost;

  expectedHomeGoals =
    expectedHomeGoals * (0.55 + homeReliability * 0.45) +
    league.homeGoals * (0.45 - homeReliability * 0.45);

  expectedAwayGoals =
    expectedAwayGoals * (0.55 + awayReliability * 0.45) +
    league.awayGoals * (0.45 - awayReliability * 0.45);

  expectedHomeGoals = clamp(expectedHomeGoals, 0.35, 3.2);
  expectedAwayGoals = clamp(expectedAwayGoals, 0.25, 2.8);

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  let btts = 0;
  let over25 = 0;

  const scoreCandidates = [];

  for (let homeGoals = 0; homeGoals <= 6; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 6; awayGoals++) {
      const probability =
        poisson(homeGoals, expectedHomeGoals) *
        poisson(awayGoals, expectedAwayGoals);

      if (homeGoals > awayGoals) homeWin += probability;
      else if (homeGoals === awayGoals) draw += probability;
      else awayWin += probability;

      if (homeGoals > 0 && awayGoals > 0) {
        btts += probability;
      }

      if (homeGoals + awayGoals >= 3) {
        over25 += probability;
      }

      scoreCandidates.push({
        homeGoals,
        awayGoals,
        probability
      });
    }
  }

  const total = homeWin + draw + awayWin;

  homeWin /= total;
  draw /= total;
  awayWin /= total;

  scoreCandidates.sort(
    (a, b) => b.probability - a.probability
  );

  const bestScore = scoreCandidates[0];

  const homePercent = Math.round(homeWin * 100);
  const drawPercent = Math.round(draw * 100);
  const awayPercent = 100 - homePercent - drawPercent;

  return {
    homeWin: homePercent,
    draw: drawPercent,
    awayWin: awayPercent,

    expectedHomeGoals: Number(
      expectedHomeGoals.toFixed(2)
    ),

    expectedAwayGoals: Number(
      expectedAwayGoals.toFixed(2)
    ),

    predictedHomeGoals: bestScore.homeGoals,
    predictedAwayGoals: bestScore.awayGoals,

    btts: Math.round(btts * 100),
    over25: Math.round(over25 * 100),

    confidence: Math.round(
      Math.max(homeWin, draw, awayWin) * 100
    ),

    sampleSize: Math.min(
      homeStats.matches + awayStats.matches,
      20
    )
  };
}
