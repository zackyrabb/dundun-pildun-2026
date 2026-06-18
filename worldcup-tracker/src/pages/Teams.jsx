import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { getTeams } from "../services/teamService";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTeams() {
      const { data, error } = await getTeams();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setTeams(data ?? []);
      setLoading(false);
    }

    loadTeams();
  }, []);

  if (loading) {
    return <LoadingState text="Loading teams..." />;
  }

  return (
    <>
      <PageHeader
        title="Teams"
        description="All national teams synced from the World Cup 2026 data source."
      />

      <div className="mb-6">
        <ErrorAlert message={message} />
      </div>

      {teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Run the admin World Cup data sync to load teams."
        />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-4xl">
                    {team.flag || "🏳️"}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-slate-950 group-hover:text-blue-700">
                      {team.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {team.code || "N/A"}
                    </p>
                  </div>
                </div>
                {team.group_name ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    {team.group_name}
                  </span>
                ) : null}
              </div>

              <p className="mt-5 text-sm font-semibold text-blue-700">
                View schedule and results →
              </p>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}

export default Teams;
