export async function onRequestGet(context) {
  try {
    const token = context.env.FOOTBALL_DATA_TOKEN;

    if (!token) {
      return Response.json({ error: "FOOTBALL_DATA_TOKEN is not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.football-data.org/v4/competitions/PL/matches", {
      headers: { "X-Auth-Token": token }
    });

    if (!response.ok) {
      const details = await response.text();
      return Response.json({
        error: "Football data request failed",
        status: response.status,
        details
      }, { status: response.status });
    }

    const data = await response.json();

    const matches = (data.matches || []).map(match => ({
      id: match.id,
      date: match.utcDate,
      status: match.status,
      homeTeam: match.homeTeam?.name || "Unknown",
      awayTeam: match.awayTeam?.name || "Unknown",
      score: match.score?.fullTime ? {
        home: match.score.fullTime.home,
        away: match.score.fullTime.away
      } : null
    }));

    return Response.json({
      competition: "Premier League",
      matches
    });
  } catch (error) {
    return Response.json({
      error: "Server error",
      details: error.message
    }, { status: 500 });
  }
}
