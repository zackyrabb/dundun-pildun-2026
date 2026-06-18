import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getUserById,
  getUserStats,
  updateUserRole,
} from "../../services/adminUserService";
import { getCurrentUser } from "../../services/authService";
import { calculatePredictionPoints } from "../../utils/calculatePredictionPoints";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setMessage("");

      const authUser = await getCurrentUser();
      setCurrentUser(authUser);

      const { data: userData, error: userError } = await getUserById(id);

      if (userError) {
        setMessage(userError.message);
        setLoading(false);
        return;
      }

      const { data: statsData, error: statsError } = await getUserStats(id);

      if (statsError) {
        setMessage(statsError.message);
        setLoading(false);
        return;
      }

      setProfile(userData);
      setRole(userData.role || "user");
      setFavoriteTeams(statsData.favoriteTeams || []);
      setPredictions(statsData.predictions || []);
      setLoading(false);
    }

    loadData();
  }, [id]);

  async function handleSaveRole() {
    setMessage("");
    setMessageType("error");

    if (saving) {
      return;
    }

    if (!profile) {
      return;
    }

    if (currentUser?.id === profile.id && role !== "admin") {
      setMessage("Admins cannot downgrade their own role.");
      return;
    }

    setSaving(true);

    const { data, error } = await updateUserRole(profile.id, role);

    setSaving(false);

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      return;
    }

    setProfile(data);
    setMessageType("success");
    setMessage("User role updated successfully.");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <p className="font-semibold text-slate-600">Loading user details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            User not found
          </h1>

          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const predictionDetails = predictions.map((prediction) => ({
    ...prediction,
    points: calculatePredictionPoints(prediction.match, prediction),
  }));

  const totalPoints = predictionDetails.reduce(
    (sum, prediction) => sum + prediction.points,
    0
  );

  const countedPredictions = predictionDetails.filter(
    (prediction) => prediction.match?.status === "finished"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="mb-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Manage Users
        </button>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-700 to-green-600 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url || "https://i.pravatar.cc/150?img=12"}
                alt={profile.full_name || "User"}
                className="h-20 w-20 rounded-full border-2 border-white object-cover"
              />

              <div>
                <h1 className="text-3xl font-black">
                  {profile.full_name || "Unnamed User"}
                </h1>
                <p className="text-blue-100">
                  @{profile.username || "username-not-set"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-black">{predictions.length}</p>
                <p className="text-xs font-semibold text-blue-100">
                  Predictions
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-black">
                  {countedPredictions.length}
                </p>
                <p className="text-xs font-semibold text-blue-100">
                  Counted
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-2xl font-black">{totalPoints}</p>
                <p className="text-xs font-semibold text-blue-100">
                  Points
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={[
              "mb-6 rounded-xl px-4 py-3 text-sm font-semibold",
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700",
            ].join(" ")}
          >
            {message}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            User Role
          </h2>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>

              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveRole}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Role"}
            </button>
          </div>

          {currentUser?.id === profile.id && (
            <p className="mt-3 text-sm font-semibold text-yellow-700">
              Note: you are viewing the currently signed-in admin account.
              Do not downgrade your own role.
            </p>
          )}
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            4 Favorite Teams
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteTeams.map((item) => {
              const team = item.teams;

              return (
                <div
                  key={item.team_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="text-4xl">{team?.flag}</div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    {team?.name}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {team?.code} · {team?.group_name}
                  </p>
                </div>
              );
            })}

            {favoriteTeams.length === 0 && (
              <p className="text-sm text-slate-500">
                This user has not selected favorite teams yet.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">
            User Predictions
          </h2>

          <div className="mt-5 grid gap-4">
            {predictionDetails.map((prediction) => {
              const match = prediction.match;

              return (
                <div
                  key={prediction.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {match?.stage}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            match?.status === "finished"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {match?.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-900">
                        {match?.home_team?.flag} {match?.home_team?.name} vs{" "}
                        {match?.away_team?.flag} {match?.away_team?.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {match?.match_date
                          ? new Date(match.match_date).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-sm font-semibold text-blue-700">
                          Prediction
                        </p>
                        <p className="text-lg font-black text-blue-900">
                          {prediction.predicted_home_score} -{" "}
                          {prediction.predicted_away_score}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-600">
                          Result
                        </p>
                        <p className="text-lg font-black text-slate-900">
                          {match?.status === "finished"
                            ? `${match.home_score} - ${match.away_score}`
                            : "Pending"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="text-sm font-semibold text-green-700">
                          Points
                        </p>
                        <p className="text-lg font-black text-green-800">
                          {match?.status === "finished"
                            ? prediction.points
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {predictionDetails.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-6 text-center">
                <h3 className="font-bold text-slate-900">
                  This user has not made any predictions
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Prediction data will appear after the user chooses match scores.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
