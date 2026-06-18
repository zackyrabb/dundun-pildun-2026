import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getUserFavoriteTeams } from "../services/favoriteTeamService";
import { getMatches } from "../services/matchService";
import { canPredictMatch } from "../utils/matchStatusUtils";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [favoriteTeamIds, setFavoriteTeamIds] = useState([]);
  const [filter, setFilter] = useState("scheduled");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setMessage("");

      const user = await getCurrentUser();

      if (!user) {
        setMessage("User is not logged in.");
        setLoading(false);
        return;
      }

      const { data: matchData, error: matchError } = await getMatches();

      if (matchError) {
        setMessage(matchError.message);
        setLoading(false);
        return;
      }

      const { data: favoriteData, error: favoriteError } =
        await getUserFavoriteTeams(user.id);

      if (favoriteError) {
        setMessage(favoriteError.message);
        setLoading(false);
        return;
      }

      setMatches(matchData || []);
      setFavoriteTeamIds((favoriteData || []).map((item) => item.team_id));
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    if (filter === "scheduled") {
      result = result.filter((match) => match.status === "scheduled");
    }

    if (filter === "finished") {
      result = result.filter((match) => match.status === "finished");
    }

    if (filter === "favorites") {
      result = result.filter(
        (match) =>
          favoriteTeamIds.includes(match.home_team_id) ||
          favoriteTeamIds.includes(match.away_team_id)
      );
    }

    return result;
  }, [matches, filter, favoriteTeamIds]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading matches...</p>
      </section>
    );
  }

  return (
    <>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Dundun Pildun 2026
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            All Matches
          </h1>
          <p className="mt-2 text-slate-600">
            View schedules, match results, and make score predictions.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          {[
            ["scheduled", "Upcoming"],
            ["finished", "Finished"],
            ["favorites", "My Favorites"],
            ["all", "All"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredMatches.map((match) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {match.stage}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        match.status === "finished"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {match.status === "finished" ? "Finished" : "Upcoming"}
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {match.home_team?.flag} {match.home_team?.name} vs{" "}
                    {match.away_team?.flag} {match.away_team?.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {new Date(match.match_date).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  {match.status === "finished" ? (
                    <>
                      <p className="text-sm font-medium text-slate-500">
                        Final Score
                      </p>
                      <p className="mt-1 text-3xl font-black text-slate-900">
                        {match.home_score} - {match.away_score}
                      </p>
                    </>
                  ) : canPredictMatch(match) ? (
                    <span className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                      Make Prediction
                    </span>
                  ) : match.status === "scheduled" ? (
                    <span className="inline-block rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                      Prediction Locked
                    </span>
                  ) : (
                    <span className="inline-block rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                      {match.status}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
    </>
  );
}
