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

const FLAG_BY_CODE: Record<string, string> = {
  ALG: "🇩🇿",
  ARG: "🇦🇷",
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BIH: "🇧🇦",
  BRA: "🇧🇷",
  CAN: "🇨🇦",
  CIV: "🇨🇮",
  COD: "🇨🇩",
  COL: "🇨🇴",
  CPV: "🇨🇻",
  CRO: "🇭🇷",
  CUW: "🇨🇼",
  CZE: "🇨🇿",
  ECU: "🇪🇨",
  EGY: "🇪🇬",
  ENG: "🏴",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  GHA: "🇬🇭",
  HAI: "🇭🇹",
  IRN: "🇮🇷",
  IRQ: "🇮🇶",
  JOR: "🇯🇴",
  JPN: "🇯🇵",
  KOR: "🇰🇷",
  KSA: "🇸🇦",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NED: "🇳🇱",
  NOR: "🇳🇴",
  NZL: "🇳🇿",
  PAN: "🇵🇦",
  PAR: "🇵🇾",
  POR: "🇵🇹",
  QAT: "🇶🇦",
  RSA: "🇿🇦",
  SCO: "🏴",
  SEN: "🇸🇳",
  SUI: "🇨🇭",
  SWE: "🇸🇪",
  TUN: "🇹🇳",
  TUR: "🇹🇷",
  URU: "🇺🇾",
  USA: "🇺🇸",
  UZB: "🇺🇿",
};

function normalizeCode(value: string | null | undefined) {
  if (!value) return "";
  return String(value).trim().toUpperCase();
}

function getTeamCode(team: FootballDataTeam) {
  const tla = normalizeCode(team.tla);
  if (tla) return tla;
  return normalizeCode(team.name?.slice(0, 3));
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

async function upsertTeam(supabase: any, team: FootballDataTeam, groupName: string | null) {
  const externalId = `football-data-team-${team.id}`;
  const code = getTeamCode(team);
  const payload = {
    external_id: externalId,
    name: team.name,
    code,
    flag: FLAG_BY_CODE[code] ?? "🏳️",
    group_name: groupName,
  };

  const { data: existingByExternalId, error: existingByExternalIdError } = await supabase
    .from("teams")
    .select("id")
    .eq("external_id", externalId)
    .maybeSingle();

  if (existingByExternalIdError) throw existingByExternalIdError;

  const { data: existingByCode, error: existingByCodeError } = await supabase
    .from("teams")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (existingByCodeError) throw existingByCodeError;

  if (existingByExternalId && existingByCode && existingByExternalId.id !== existingByCode.id) {
    const { error: homeTeamMergeError } = await supabase
      .from("matches")
      .update({ home_team_id: existingByCode.id })
      .eq("home_team_id", existingByExternalId.id);

    if (homeTeamMergeError) throw homeTeamMergeError;

    const { error: awayTeamMergeError } = await supabase
      .from("matches")
      .update({ away_team_id: existingByCode.id })
      .eq("away_team_id", existingByExternalId.id);

    if (awayTeamMergeError) throw awayTeamMergeError;

    const { error: favoriteTeamMergeError } = await supabase
      .from("user_favorite_teams")
      .update({ team_id: existingByCode.id })
      .eq("team_id", existingByExternalId.id);

    if (favoriteTeamMergeError && favoriteTeamMergeError.code !== "23505") {
      throw favoriteTeamMergeError;
    }

    if (favoriteTeamMergeError?.code === "23505") {
      const { error: favoriteTeamDeleteError } = await supabase
        .from("user_favorite_teams")
        .delete()
        .eq("team_id", existingByExternalId.id);

      if (favoriteTeamDeleteError) throw favoriteTeamDeleteError;
    }

    const { error: duplicateTeamDeleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", existingByExternalId.id);

    if (duplicateTeamDeleteError) throw duplicateTeamDeleteError;
  }

  const teamQuery = existingByCode
    ? supabase
        .from("teams")
        .update(payload)
        .eq("id", existingByCode.id)
    : supabase
        .from("teams")
        .upsert(payload, { onConflict: "external_id" });

  return teamQuery.select("id").single();
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
    const teamExternalIdToLocalId = new Map<string, string>();
    const validMatches = matches.filter((match) => {
      return isValidTeam(match.homeTeam) && isValidTeam(match.awayTeam);
    });
    const skippedMatches = matches.length - validMatches.length;

    let teamsUpserted = 0;
    let matchesUpserted = 0;
    let finishedMatches = 0;
    let scheduledMatches = 0;
    let liveMatches = 0;
    let skippedManualOverride = 0;

    for (const match of validMatches) {
      const groupName = match.group ? toReadableLabel(match.group) : null;
      const teams = [match.homeTeam, match.awayTeam] as FootballDataTeam[];

      for (const team of teams) {
        const externalId = `football-data-team-${team.id}`;

        if (teamExternalIdToLocalId.has(externalId)) continue;

        const { data: teamData, error: teamError } = await upsertTeam(
          supabase,
          team,
          groupName,
        );

        if (teamError) throw teamError;

        teamExternalIdToLocalId.set(externalId, teamData.id);
        teamsUpserted += 1;
      }
    }

    for (const match of validMatches) {
      const homeTeamId = teamExternalIdToLocalId.get(
        `football-data-team-${match.homeTeam?.id}`,
      );
      const awayTeamId = teamExternalIdToLocalId.get(
        `football-data-team-${match.awayTeam?.id}`,
      );

      if (!homeTeamId || !awayTeamId) continue;

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
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
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
        skippedManualOverride,
        teamsUpserted,
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
