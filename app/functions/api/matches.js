
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

export async function onRequestGet(context) {
  try {
    const token = context.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return Response.json(
        { error: "FOOTBALL_DATA_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const url = new URL(context.request.url);
    const league = (
      url.searchParams.get("league") || "PL"
    ).toUpperCase();

    if (!Object.prototype.hasOwnProperty.call(LEAGUES, league)) {
      return Response.json(
        {
          error: "Unsupported league",
          supportedLeagues: LEAGUES
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${league}/matches`,
      {
        headers: { "X-Auth-Token": token }
      }
    );

    if (!response.ok) {
      const details = await response.text();

      return Response.json(
        {
          error: "Football data request failed",
          competition: LEAGUES[league],
          status: response.status,
          details
        },
        { status: response.status }
      );
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

    return Response.json({
      competition: data.competition?.name || LEAGUES[league],
      league,
      matches
    });
  } catch (error) {
    return Response.json(
      {
        error: "Server error",
        details: error.message
      },
      { status: 500 }
    );
  }
        }
