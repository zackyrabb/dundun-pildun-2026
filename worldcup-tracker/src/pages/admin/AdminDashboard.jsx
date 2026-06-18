import { useState } from "react";
import { Link } from "react-router-dom";
import { syncWorldCupData } from "../../services/adminSyncService";

export default function AdminDashboard() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  async function handleSyncWorldCupData() {
    const confirmed = window.confirm(
      "Sync World Cup 2026 fixtures and scores from football-data.org now?"
    );

    if (!confirmed || syncing) {
      return;
    }

    setSyncing(true);
    setMessage("");
    setMessageType("success");

    const { data, error } = await syncWorldCupData();

    setSyncing(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message || data?.error || "Sync failed.");
      return;
    }

    if (data?.ok === false) {
      setMessageType("error");
      setMessage(data.error || "Sync failed.");
      return;
    }

    setMessageType("success");
    setMessage(
      `Sync completed. Matches: ${data?.matchesUpserted ?? 0}, Teams: ${
        data?.teamsUpserted ?? 0
      }, Skipped: ${
        data?.skippedMatches ?? 0
      }`
    );
  }

  return (
    <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Manage Dundun Pildun 2026
          </h1>
          <p className="mt-2 text-slate-600">
            Manage match data, final results, and tournament data.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Sync World Cup Data
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Manually sync World Cup 2026 fixtures and scores from football-data.org.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncWorldCupData}
              disabled={syncing}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {syncing ? "Syncing..." : "Sync World Cup Data"}
            </button>
          </div>

          {message ? (
            <div
              className={[
                "mt-4 rounded-2xl px-4 py-3 text-sm font-semibold",
                messageType === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700",
              ].join(" ")}
            >
              {message}
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Link
            to="/admin/matches"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <h2 className="text-xl font-black text-slate-900">
              Manage Matches
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Add, edit, update status, and enter match results.
            </p>
          </Link>

          <Link
            to="/admin/teams"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-green-300 hover:bg-green-50"
          >
            <h2 className="text-xl font-black text-slate-900">
              Manage Teams
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Add, edit, and manage participating teams.
            </p>
          </Link>

          <Link
  to="/admin/users"
  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
>
  <h2 className="text-xl font-black text-slate-900">
    Manage Users
  </h2>

  <p className="mt-2 text-sm text-slate-600">
    View users, prediction statistics, and manage admin/user roles.
  </p>
</Link>
        </div>
    </section>
  );
}
