import {
  calculateLeagueAverages,
  calculateTeamStats,
  getTopCorrectScores
} from "../../../src/engine/predict.js";

const LEAGUES = {
  PL: "Premier League",
  PD: "La Liga",
  SA: "Serie A",
  BL1: "Bundesliga",
  FL1: "Ligue 1",
  CL: "UEFA Champions League",
  PPL: "Primeira Liga",
  DED: "Eredivisie"
};

export async function onRequestPost({ request, env }) {
  try {
    const { code } = await request.json();

    if (!env.PREMIUM_ACCESS_CODE ||
        code !== env.PREMIUM_ACCESS_CODE) {
      return Response.json(
        { success: false, message: "Invalid access code." },
        { status: 401 }
      );
    }

    if (!env.FOOTBALL_DATA_TOKEN) {
      return Response.json(
        { success: false, message: "Football API token is missing." },
        { status: 500 }
      );
    }

    const now = new Date();

    const results = await Promise.all(
      Object.entries(LEAGUES).map(async ([leagueCode, leagueName]) => {
        try {
          const response = await fetch(
            `https://api.football-data.org/v4/competitions/${leagueCode}/matches`,
            {
              headers: {
                "X-Auth-Token": env.FOOTBALL_DATA_TOKEN
              }
            }
          );

          if (!response.ok) {
            return { leagueCode, leagueName, matches: [], error: true };
          }

          const data = await response.json();

          const matches = (data.matches || []).map(match => ({
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

          return { leagueCode, leagueName, matches };
        } catch {
          return { leagueCode, leagueName, matches: [], error: true };
        }
      })
    );

    const predictions = [];

    for (const result of results) {
      if (result.error) continue;

      const matches = result.matches;
      const league = calculateLeagueAverages(matches);

      const upcoming = matches
        .filter(match =>
          ["SCHEDULED", "TIMED"].includes(match.status) &&
          new Date(match.date) > now
        )
        .sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

      for (const match of upcoming) {
        const homeStats = calculateTeamStats(
          matches,
          match.homeTeam
        );

        const awayStats = calculateTeamStats(
          matches,
          match.awayTeam
        );

        const topScores = getTopCorrectScores(
          homeStats,
          awayStats,
          league,
          1
        );

        if (!topScores.length) continue;

        const best = topScores[0];

        predictions.push({
          matchId: match.id,
          league: result.leagueName,
          leagueCode: result.leagueCode,
          date: match.date,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          predictedScore: `${best.homeGoals}-${best.awayGoals}`,
          probability: best.probability
        });
      }
    }

    predictions.sort(
      (a, b) => b.probability - a.probability
    );

    return Response.json({
      success: true,
      predictions: predictions.slice(0, 6),
      leaguesChecked: results.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Unable to generate premium predictions.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
