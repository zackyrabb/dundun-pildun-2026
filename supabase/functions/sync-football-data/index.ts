import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ApiFootballTeam = {
  id: number;
  name: string;
  code?: string | null;
  country?: string | null;
};

type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
  };
  league: {
    round?: string | null;
  };
  teams: {
    home: ApiFootballTeam;
    away: ApiFootballTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

function mapStatus(apiStatus: string) {
  const status = apiStatus?.toUpperCase();

  if (["NS", "TBD"].includes(status)) return "scheduled";

  if (
    ["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(status)
  ) {
    return "live";
  }

  if (["FT", "AET", "PEN"].includes(status)) return "finished";

  if (["PST", "CANC", "ABD", "AWD", "WO"].includes(status)) {
    return "postponed";
  }

  return "scheduled";
}

function getTeamCode(team: ApiFootballTeam) {
  if (team.code) return team.code.toUpperCase();
  return team.name.slice(0, 3).toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("API_FOOTBALL_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

    if (!apiKey) throw new Error("Missing API_FOOTBALL_KEY.");
    if (!supabaseUrl) throw new Error("Missing SUPABASE_URL.");
    if (!serviceRoleKey) throw new Error("Missing service role key.");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const league = url.searchParams.get("league") || "1";
    const season = url.searchParams.get("season") || "2026";

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Football API request failed: ${response.status}`);
    }

    const json = await response.json();
    const fixtures: ApiFootballFixture[] = json.response || [];

    let teamsUpserted = 0;
    let matchesUpserted = 0;

    const teamExternalIdToLocalId = new Map<string, string>();

    for (const fixture of fixtures) {
      const apiTeams = [fixture.teams.home, fixture.teams.away];

      for (const apiTeam of apiTeams) {
        const externalId = String(apiTeam.id);

        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .upsert(
            {
              external_id: externalId,
              name: apiTeam.name,
              code: getTeamCode(apiTeam),
              group_name: fixture.league.round || null,
              flag: "🏳️",
            },
            {
              onConflict: "external_id",
            },
          )
          .select("id")
          .single();

        if (teamError) throw teamError;

        teamExternalIdToLocalId.set(externalId, teamData.id);
        teamsUpserted += 1;
      }
    }

    for (const fixture of fixtures) {
      const homeTeamId = teamExternalIdToLocalId.get(
        String(fixture.teams.home.id),
      );
      const awayTeamId = teamExternalIdToLocalId.get(
        String(fixture.teams.away.id),
      );

      if (!homeTeamId || !awayTeamId) continue;

      const status = mapStatus(fixture.fixture.status.short);

      const { error: matchError } = await supabase.from("matches").upsert(
        {
          external_id: String(fixture.fixture.id),
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          match_date: fixture.fixture.date,
          stage: fixture.league.round || "Group Stage",
          status,
          home_score:
            status === "finished" || status === "live"
              ? fixture.goals.home
              : null,
          away_score:
            status === "finished" || status === "live"
              ? fixture.goals.away
              : null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "external_id",
        },
      );

      if (matchError) throw matchError;

      matchesUpserted += 1;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        league,
        season,
        fixtures: fixtures.length,
        teamsUpserted,
        matchesUpserted,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});