import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams } from "../../services/favoriteTeamService";
import { deleteTeam } from "../../services/adminTeamService";

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadTeams() {
    setLoading(true);
    setMessage("");

    const { data, error } = await getTeams();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTeams(data || []);
    setLoading(false);
  }

  useEffect(() => {
    async function loadInitialTeams() {
      setLoading(true);
      setMessage("");

      const { data, error } = await getTeams();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setTeams(data || []);
      setLoading(false);
    }

    loadInitialTeams();
  }, []);

  async function handleDelete(teamId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team? Do not delete it if it is already used in matches."
    );

    if (!confirmed) {
      return;
    }

    const { error } = await deleteTeam(teamId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadTeams();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <p className="font-semibold text-slate-600">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Manage Countries / Teams
            </h1>

            <p className="mt-2 text-slate-600">
              Add, edit, and manage participating countries.
            </p>
          </div>

          <Link
            to="/admin/teams/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Add Team
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                    {team.flag}
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {team.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {team.code} · {team.group_name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/admin/teams/${team.id}/edit`}
                    className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(team.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="p-8 text-center">
                <h2 className="text-lg font-bold text-slate-900">
                  No teams yet
                </h2>

                <p className="mt-2 text-slate-500">
                  Add the first team using the Add Team button.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
