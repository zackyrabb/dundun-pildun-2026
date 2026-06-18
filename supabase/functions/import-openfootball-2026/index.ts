import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

type AnyRecord = Record<string, any>;

const CODE_BY_TEAM_NAME: Record<string, string> = {
  "algeria": "ALG",
  "argentina": "ARG",
  "australia": "AUS",
  "austria": "AUT",
  "belgium": "BEL",
  "bosnia & herzegovina": "BIH",
  "brazil": "BRA",
  "canada": "CAN",
  "cape verde": "CPV",
  "colombia": "COL",
  "croatia": "CRO",
  "curaçao": "CUW",
  "curacao": "CUW",
  "czech republic": "CZE",
  "dr congo": "COD",
  "ecuador": "ECU",
  "egypt": "EGY",
  "england": "ENG",
  "france": "FRA",
  "germany": "GER",
  "ghana": "GHA",
  "haiti": "HAI",
  "iran": "IRN",
  "iraq": "IRQ",
  "ivory coast": "CIV",
  "japan": "JPN",
  "jordan": "JOR",
  "mexico": "MEX",
  "morocco": "MAR",
  "netherlands": "NED",
  "new zealand": "NZL",
  "norway": "NOR",
  "panama": "PAN",
  "paraguay": "PAR",
  "portugal": "POR",
  "qatar": "QAT",
  "saudi arabia": "KSA",
  "scotland": "SCO",
  "senegal": "SEN",
  "south africa": "RSA",
  "south korea": "KOR",
  "spain": "ESP",
  "sweden": "SWE",
  "switzerland": "SUI",
  "tunisia": "TUN",
  "turkey": "TUR",
  "uruguay": "URU",
  "usa": "USA",
  "uzbekistan": "UZB",
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
  CZE: "🇨🇿",
  CUW: "🇨🇼",
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

function normalizeNameKey(value: string) {
  return normalizeTeamName(value).toLowerCase();
}

function normalizeCode(value: string | null | undefined) {
  if (!value) return "";
  return String(value).trim().toUpperCase();
}

function normalizeTeamName(value: string | null | undefined) {
  if (!value) return "";
  return String(value).trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function isPlaceholderTeamName(name: string | null | undefined) {
  const normalizedName = normalizeTeamName(name);

  if (!normalizedName) return true;

  const placeholderPatterns = [
    /winner/i,
    /runner[-\s]?up/i,
    /third place/i,
    /\btbd\b/i,
    /to be determined/i,
    /\bmatch\b/i,
    /\bgroup\b/i,
    /play[-\s]?off/i,
    /placeholder/i,
    /^[123][A-L](?:\/[A-L])*$/i,
    /^[WL]\d+$/i,
  ];

  return placeholderPatterns.some((pattern) => pattern.test(normalizedName));
}

function getTeamCodeFromName(name: string) {
  const mappedCode = CODE_BY_TEAM_NAME[normalizeNameKey(name)];
  return mappedCode ?? normalizeCode(name.slice(0, 3));
}

function getTeamFromSide(side: any) {
  if (!side) return null;

  if (typeof side === "string") {
    const name = normalizeTeamName(side);

    return {
      name,
      code: getTeamCodeFromName(name),
    };
  }

  const name =
    side.name ||
    side.team ||
    side.title ||
    side.country ||
    side.long_name ||
    side.key ||
    "";

  const code = side.code || side.fifa || "";

  return {
    name: normalizeTeamName(name),
    code: normalizeCode(code || getTeamCodeFromName(String(name))),
  };
}

function getRoundName(round: AnyRecord, index: number) {
  return (
    round.name ||
    round.title ||
    round.stage ||
    round.group ||
    round.key ||
    `Round ${index + 1}`
  );
}

function getStatus(match: AnyRecord) {
  if (match.status) {
    const status = String(match.status).toLowerCase();

    if (["scheduled", "live", "finished", "postponed"].includes(status)) {
      return status;
    }
  }

  const score1 = match.score1 ?? match.home_score ?? match.goals1;
  const score2 = match.score2 ?? match.away_score ?? match.goals2;

  if (score1 !== undefined && score1 !== null && score2 !== undefined && score2 !== null) {
    return "finished";
  }

  return "scheduled";
}

function getScore(value: any) {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function extractRounds(data: AnyRecord) {
  if (Array.isArray(data.rounds)) return data.rounds;
  if (Array.isArray(data.matches)) return [{ name: "World Cup 2026", matches: data.matches }];
  if (Array.isArray(data.games)) return [{ name: "World Cup 2026", matches: data.games }];
  return [];
}

function extractMatchesFromRound(round: AnyRecord) {
  if (Array.isArray(round.matches)) return round.matches;
  if (Array.isArray(round.games)) return round.games;
  return [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl) throw new Error("Missing SUPABASE_URL.");
    if (!serviceRoleKey) throw new Error("Missing service role key.");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const response = await fetch(OPENFOOTBALL_URL);

    if (!response.ok) {
      throw new Error(`OpenFootball request failed: ${response.status}`);
    }

    const data = await response.json();
    const rounds = extractRounds(data);

    const teamsByCode = new Map<string, {
      external_id: string;
      name: string;
      code: string;
      flag: string;
      group_name: string | null;
    }>();

    const fixtures: Array<{
      external_id: string;
      home_code: string;
      away_code: string;
      match_date: string;
      stage: string;
      status: string;
      home_score: number | null;
      away_score: number | null;
    }> = [];

    let skippedPlaceholderFixtures = 0;

    rounds.forEach((round: AnyRecord, roundIndex: number) => {
      const roundName = getRoundName(round, roundIndex);
      const matches = extractMatchesFromRound(round);

      matches.forEach((match: AnyRecord, matchIndex: number) => {
        const stageName = match.group || match.round || roundName;
        const home =
          getTeamFromSide(match.team1) ||
          getTeamFromSide(match.home_team) ||
          getTeamFromSide(match.home);

        const away =
          getTeamFromSide(match.team2) ||
          getTeamFromSide(match.away_team) ||
          getTeamFromSide(match.away);

        if (!home?.name || !away?.name) {
          skippedPlaceholderFixtures += 1;
          return;
        }

        if (isPlaceholderTeamName(home.name) || isPlaceholderTeamName(away.name)) {
          skippedPlaceholderFixtures += 1;
          return;
        }

        const homeCode = normalizeCode(home.code || getTeamCodeFromName(home.name));
        const awayCode = normalizeCode(away.code || getTeamCodeFromName(away.name));

        teamsByCode.set(homeCode, {
          external_id: `openfootball-team-${slugify(home.name)}`,
          name: home.name,
          code: homeCode,
          flag: FLAG_BY_CODE[homeCode] ?? "🏳️",
          group_name: String(stageName).includes("Group") ? stageName : null,
        });

        teamsByCode.set(awayCode, {
          external_id: `openfootball-team-${slugify(away.name)}`,
          name: away.name,
          code: awayCode,
          flag: FLAG_BY_CODE[awayCode] ?? "🏳️",
          group_name: String(stageName).includes("Group") ? stageName : null,
        });

        const dateValue =
          match.date ||
          match.datetime ||
          match.match_date ||
          match.time ||
          null;

        if (!dateValue) return;

        const matchDate = new Date(dateValue).toISOString();

        const homeScore = getScore(match.score1 ?? match.home_score ?? match.goals1);
        const awayScore = getScore(match.score2 ?? match.away_score ?? match.goals2);

        fixtures.push({
          external_id:
            match.id ||
            match.num ||
            `openfootball-2026-${roundIndex + 1}-${matchIndex + 1}-${homeCode}-${awayCode}`,
          home_code: homeCode,
          away_code: awayCode,
          match_date: matchDate,
          stage: stageName,
          status: getStatus(match),
          home_score: homeScore,
          away_score: awayScore,
        });
      });
    });

    const teams = Array.from(teamsByCode.values());
    const fixtureExternalIds = new Set(
      fixtures.map((fixture) => String(fixture.external_id)),
    );

    let teamsUpserted = 0;
    let matchesUpserted = 0;

    const { data: existingImportedMatches, error: existingImportedMatchesError } =
      await supabase
        .from("matches")
        .select("id, external_id")
        .like("external_id", "openfootball-2026-%");

    if (existingImportedMatchesError) throw existingImportedMatchesError;

    const staleMatchIds = (existingImportedMatches ?? [])
      .filter((match) => !fixtureExternalIds.has(String(match.external_id)))
      .map((match) => match.id);

    for (const staleMatchIdChunk of chunkArray(staleMatchIds, 100)) {
      const { error: stalePredictionDeleteError } = await supabase
        .from("predictions")
        .delete()
        .in("match_id", staleMatchIdChunk);

      if (stalePredictionDeleteError) throw stalePredictionDeleteError;

      const { error: staleMatchDeleteError } = await supabase
        .from("matches")
        .delete()
        .in("id", staleMatchIdChunk);

      if (staleMatchDeleteError) throw staleMatchDeleteError;
    }

    const { data: existingImportedTeams, error: existingImportedTeamsError } =
      await supabase
        .from("teams")
        .select("id, name, code, external_id")
        .like("external_id", "openfootball-team-%");

    if (existingImportedTeamsError) throw existingImportedTeamsError;

    const placeholderTeamIds = (existingImportedTeams ?? [])
      .filter((team) => isPlaceholderTeamName(team.name) || isPlaceholderTeamName(team.code))
      .map((team) => team.id);

    for (const placeholderTeamIdChunk of chunkArray(placeholderTeamIds, 100)) {
      const { data: placeholderHomeMatches, error: placeholderHomeMatchesError } = await supabase
        .from("matches")
        .select("id")
        .in("home_team_id", placeholderTeamIdChunk);

      if (placeholderHomeMatchesError) throw placeholderHomeMatchesError;

      const { data: placeholderAwayMatches, error: placeholderAwayMatchesError } = await supabase
        .from("matches")
        .select("id")
        .in("away_team_id", placeholderTeamIdChunk);

      if (placeholderAwayMatchesError) throw placeholderAwayMatchesError;

      const placeholderMatchIds = Array.from(
        new Set([
          ...(placeholderHomeMatches ?? []).map((match) => match.id),
          ...(placeholderAwayMatches ?? []).map((match) => match.id),
        ]),
      );

      for (const placeholderMatchIdChunk of chunkArray(placeholderMatchIds, 100)) {
        const { error: placeholderPredictionDeleteError } = await supabase
          .from("predictions")
          .delete()
          .in("match_id", placeholderMatchIdChunk);

        if (placeholderPredictionDeleteError) throw placeholderPredictionDeleteError;

        const { error: placeholderMatchDeleteError } = await supabase
          .from("matches")
          .delete()
          .in("id", placeholderMatchIdChunk);

        if (placeholderMatchDeleteError) throw placeholderMatchDeleteError;
      }

      const { error: placeholderTeamDeleteError } = await supabase
        .from("teams")
        .delete()
        .in("id", placeholderTeamIdChunk);

      if (placeholderTeamDeleteError) throw placeholderTeamDeleteError;
    }

    const teamCodeToLocalId = new Map<string, string>();

    for (const team of teams) {
      const { data: existingTeamByCode, error: existingTeamByCodeError } = await supabase
        .from("teams")
        .select("id")
        .eq("code", team.code)
        .maybeSingle();

      if (existingTeamByCodeError) throw existingTeamByCodeError;

      const { data: existingTeamByExternalId, error: existingTeamByExternalIdError } = await supabase
        .from("teams")
        .select("id")
        .eq("external_id", team.external_id)
        .maybeSingle();

      if (existingTeamByExternalIdError) throw existingTeamByExternalIdError;

      const teamPayload = {
        external_id: team.external_id,
        name: team.name,
        code: team.code,
        flag: team.flag,
        group_name: team.group_name,
      };

      if (
        existingTeamByCode &&
        existingTeamByExternalId &&
        existingTeamByCode.id !== existingTeamByExternalId.id
      ) {
        const { error: homeTeamMergeError } = await supabase
          .from("matches")
          .update({ home_team_id: existingTeamByCode.id })
          .eq("home_team_id", existingTeamByExternalId.id);

        if (homeTeamMergeError) throw homeTeamMergeError;

        const { error: awayTeamMergeError } = await supabase
          .from("matches")
          .update({ away_team_id: existingTeamByCode.id })
          .eq("away_team_id", existingTeamByExternalId.id);

        if (awayTeamMergeError) throw awayTeamMergeError;

        const { error: favoriteTeamMergeError } = await supabase
          .from("user_favorite_teams")
          .update({ team_id: existingTeamByCode.id })
          .eq("team_id", existingTeamByExternalId.id);

        if (favoriteTeamMergeError && favoriteTeamMergeError.code !== "23505") {
          throw favoriteTeamMergeError;
        }

        if (favoriteTeamMergeError?.code === "23505") {
          const { error: favoriteTeamDeleteError } = await supabase
            .from("user_favorite_teams")
            .delete()
            .eq("team_id", existingTeamByExternalId.id);

          if (favoriteTeamDeleteError) throw favoriteTeamDeleteError;
        }

        const { error: duplicateTeamDeleteError } = await supabase
          .from("teams")
          .delete()
          .eq("id", existingTeamByExternalId.id);

        if (duplicateTeamDeleteError) throw duplicateTeamDeleteError;
      }

      const teamQuery = existingTeamByCode
        ? supabase
            .from("teams")
            .update(teamPayload)
            .eq("id", existingTeamByCode.id)
        : supabase
        .from("teams")
        .upsert(
          teamPayload,
          { onConflict: "external_id" },
        );

      const { data: teamData, error: teamError } = await teamQuery
        .select("id, code")
        .single();

      if (teamError) throw teamError;

      teamCodeToLocalId.set(teamData.code, teamData.id);
      teamsUpserted += 1;
    }

    for (const fixture of fixtures) {
      const homeTeamId = teamCodeToLocalId.get(fixture.home_code);
      const awayTeamId = teamCodeToLocalId.get(fixture.away_code);

      if (!homeTeamId || !awayTeamId) continue;

      const { error: matchError } = await supabase
        .from("matches")
        .upsert(
          {
            external_id: String(fixture.external_id),
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            match_date: fixture.match_date,
            stage: fixture.stage,
            status: fixture.status,
            home_score: fixture.home_score,
            away_score: fixture.away_score,
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
        source: "OpenFootball",
        rounds: rounds.length,
        teamsFound: teams.length,
        fixturesFound: fixtures.length,
        teamsUpserted,
        matchesUpserted,
        skippedPlaceholderFixtures,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
  console.error("IMPORT_OPENFOOTBALL_ERROR", error);

  return new Response(
    JSON.stringify({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : JSON.stringify(error, null, 2),
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
