import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FOOTBALL_DATA_MATCHES_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";

type AnyRecord = Record<string, any>;

type FootballDataTeam = {
  id: number | null;
  name: string | null;
  tla?: string | null;
  shortName?: string | null;
};

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage?: string | null;
  group?: string | null;
  homeTeam?: FootballDataTeam | null;
  awayTeam?: FootballDataTeam | null;
  score?: {
    fullTime?: {
      home?: number | null;
      away?: number | null;
    } | null;
  } | null;
};

type LocalTeam = {
  id: string | number;
  external_id: string | null;
  code: string | null;
  name: string | null;
};

function normalizeCode(value: string | null | undefined) {
  if (!value) return "";
  return String(value).trim().toUpperCase();
}

function normalizeName(value: string | null | undefined) {
  if (!value) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toReadableLabel(value: string | null | undefined) {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStage(match: FootballDataMatch) {
  if (match.group) return toReadableLabel(match.group);
  return toReadableLabel(match.stage) || "Group Stage";
}

function hasCompleteScore(match: FootballDataMatch) {
  const homeScore = match.score?.fullTime?.home;
  const awayScore = match.score?.fullTime?.away;

  return homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined;
}

function getStatus(match: FootballDataMatch) {
  const status = String(match.status ?? "").toUpperCase();
  const completeScore = hasCompleteScore(match);

  if (["SCHEDULED", "TIMED"].includes(status)) return "scheduled";
  if (["IN_PLAY", "PAUSED"].includes(status)) return "live";
  if (status === "FINISHED") return completeScore ? "finished" : "scheduled";
  if (["POSTPONED", "SUSPENDED", "CANCELLED"].includes(status)) return "postponed";

  return "scheduled";
}

function getScores(match: FootballDataMatch) {
  if (!hasCompleteScore(match)) {
    return { homeScore: null, awayScore: null };
  }

  return {
    homeScore: Number(match.score?.fullTime?.home),
    awayScore: Number(match.score?.fullTime?.away),
  };
}

function isValidTeam(team: FootballDataTeam | null | undefined) {
  return Boolean(team?.id && team?.name);
}

function buildLocalTeamLookups(teams: LocalTeam[]) {
  const byExternalId = new Map<string, LocalTeam>();
  const byCode = new Map<string, LocalTeam>();
  const byName = new Map<string, LocalTeam>();

  for (const team of teams) {
    if (team.external_id) {
      byExternalId.set(team.external_id, team);
    }

    const code = normalizeCode(team.code);
    if (code && !byCode.has(code)) {
      byCode.set(code, team);
    }

    const name = normalizeName(team.name);
    if (name && !byName.has(name)) {
      byName.set(name, team);
    }
  }

  return { byExternalId, byCode, byName };
}

function resolveLocalTeam(
  team: FootballDataTeam,
  lookups: ReturnType<typeof buildLocalTeamLookups>,
) {
  const externalId = `football-data-team-${team.id}`;
  const code = normalizeCode(team.tla);
  const name = normalizeName(team.name);

  return lookups.byExternalId.get(externalId) ??
    (code ? lookups.byCode.get(code) : undefined) ??
    (name ? lookups.byName.get(name) : undefined) ??
    null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get("FOOTBALL_DATA_API_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

    if (!apiToken) throw new Error("Missing FOOTBALL_DATA_API_TOKEN.");
    if (!supabaseUrl) throw new Error("Missing SUPABASE_URL.");
    if (!serviceRoleKey) throw new Error("Missing service role key.");

    const response = await fetch(FOOTBALL_DATA_MATCHES_URL, {
      headers: {
        "X-Auth-Token": apiToken,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `football-data.org request failed: ${response.status} ${errorBody}`,
      );
    }

    const json: AnyRecord = await response.json();
    const matches: FootballDataMatch[] = json.matches;

    if (!Array.isArray(matches) || matches.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "No football-data.org matches found." }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: localTeams, error: localTeamsError } = await supabase
      .from("teams")
      .select("id, external_id, code, name");

    if (localTeamsError) throw localTeamsError;

    const teams = (localTeams ?? []) as LocalTeam[];
    const teamLookups = buildLocalTeamLookups(teams);
    const validMatches = matches.filter((match) => {
      return isValidTeam(match.homeTeam) && isValidTeam(match.awayTeam);
    });
    const skippedMatches = matches.length - validMatches.length;

    let matchesUpserted = 0;
    let finishedMatches = 0;
    let scheduledMatches = 0;
    let liveMatches = 0;
    let skippedMissingTeams = 0;
    let skippedManualOverride = 0;

    for (const match of validMatches) {
      const homeTeam = resolveLocalTeam(match.homeTeam as FootballDataTeam, teamLookups);
      const awayTeam = resolveLocalTeam(match.awayTeam as FootballDataTeam, teamLookups);

      if (!homeTeam || !awayTeam) {
        console.log("Skipping match because local team is missing", {
          matchId: match.id,
          homeTeam: match.homeTeam?.name,
          awayTeam: match.awayTeam?.name,
        });
        skippedMissingTeams += 1;
        continue;
      }

      const status = getStatus(match);
      const { homeScore, awayScore } = getScores(match);

      if (status === "finished") finishedMatches += 1;
      if (status === "scheduled") scheduledMatches += 1;
      if (status === "live") liveMatches += 1;

      const matchExternalId = `football-data-match-${match.id}`;
      const { data: existingMatch, error: existingMatchError } = await supabase
        .from("matches")
        .select("id, is_manual_override")
        .eq("external_id", matchExternalId)
        .maybeSingle();

      if (existingMatchError) throw existingMatchError;

      if (existingMatch?.is_manual_override) {
        console.log("Skipping manual override match", matchExternalId);
        skippedManualOverride += 1;
        continue;
      }

      const { error: matchError } = await supabase
        .from("matches")
        .upsert(
          {
            external_id: matchExternalId,
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            match_date: match.utcDate,
            stage: getStage(match),
            status,
            home_score: homeScore,
            away_score: awayScore,
            is_manual_override: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "external_id" },
        );

      if (matchError) throw matchError;

      matchesUpserted += 1;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        source: "football-data.org",
        resultCount: json.resultSet?.count ?? matches.length,
        validMatches: validMatches.length,
        skippedMatches,
        skippedMissingTeams,
        skippedManualOverride,
        teamsRead: teams.length,
        teamsModified: 0,
        matchesUpserted,
        finishedMatches,
        scheduledMatches,
        liveMatches,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("SYNC_FOOTBALL_DATA_WC_2026_ERROR", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        rawError: error,
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
