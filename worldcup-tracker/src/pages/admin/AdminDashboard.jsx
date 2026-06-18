import { Link } from "react-router-dom";

export default function AdminDashboard() {
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
