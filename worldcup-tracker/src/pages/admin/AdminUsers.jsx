import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../services/adminUserService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setMessage("");

      const { data, error } = await getAllUsers();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    }

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchText = `${user.full_name || ""} ${user.username || ""} ${user.role || ""}`.toLowerCase();
    return searchText.includes(keyword.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <p className="font-semibold text-slate-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            Manage Users
          </h1>

          <p className="mt-2 text-slate-600">
            View users, roles, and prediction activity.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search name, username, or role..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                to={`/admin/users/${user.id}`}
                className="flex flex-col gap-4 p-5 transition hover:bg-blue-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar_url || "https://i.pravatar.cc/150?img=12"}
                    alt={user.full_name || "User"}
                    className="h-14 w-14 rounded-full object-cover"
                  />

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {user.full_name || "Unnamed User"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      @{user.username || "username-not-set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role || "user"}
                  </span>

                  <span className="text-sm font-semibold text-blue-700">
                    Details
                  </span>
                </div>
              </Link>
            ))}

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center">
                <h2 className="text-lg font-bold text-slate-900">
                  User not found
                </h2>

                <p className="mt-2 text-slate-500">
                  Try a different keyword.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
