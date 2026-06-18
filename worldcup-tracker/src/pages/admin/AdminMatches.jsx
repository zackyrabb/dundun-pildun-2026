import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../../services/matchService";

const formatDate = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const getTeamLabel = (team) => {
  if (!team) {
    return "Unknown team";
  }

  return `${team.flag ?? ""} ${team.name ?? "Unknown team"}`.trim();
};

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setMessage("");

      const { data, error } = await getMatches();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMatches(data ?? []);
      setLoading(false);
    }

    loadMatches();
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading matches...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Manage Matches
          </h1>
          <p className="mt-2 text-slate-600">
            View all matches, final scores, and open the edit page.
          </p>
        </div>

        <Link
          to="/admin/matches/new"
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Add Match
        </Link>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-bold">Home Team</th>
              <th className="px-5 py-4 font-bold">Away Team</th>
              <th className="px-5 py-4 font-bold">Date</th>
              <th className="px-5 py-4 font-bold">Stage</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Score</th>
              <th className="px-5 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((match) => (
              <tr key={match.id} className="transition hover:bg-blue-50/60">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {getTeamLabel(match.home_team)}
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">
                  {getTeamLabel(match.away_team)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatDate(match.match_date)}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  {match.stage}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      match.status === "finished"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700",
                    ].join(" ")}
                  >
                    {match.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-black text-slate-900">
                  {match.status === "finished"
                    ? `${match.home_score} - ${match.away_score}`
                    : "-"}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/matches/${match.id}/edit`}
                    className="inline-flex rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {matches.map((match) => (
          <article
            key={match.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {match.stage}
              </span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-bold",
                  match.status === "finished"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700",
                ].join(" ")}
              >
                {match.status}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Home
                </p>
                <h2 className="mt-1 font-bold text-slate-950">
                  {getTeamLabel(match.home_team)}
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 px-5 py-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Score
                </p>
                <p className="text-2xl font-black text-blue-700">
                  {match.status === "finished"
                    ? `${match.home_score} - ${match.away_score}`
                    : "-"}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Away
                </p>
                <h2 className="mt-1 font-bold text-slate-950">
                  {getTeamLabel(match.away_team)}
                </h2>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                {formatDate(match.match_date)}
              </p>
              <Link
                to={`/admin/matches/${match.id}/edit`}
                className="inline-flex justify-center rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            No matches yet
          </h2>
          <p className="mt-2 text-slate-600">
            Add the first match to start managing the schedule.
          </p>
        </div>
      ) : null}
    </section>
  );
}
