import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createMatch, updateMatch } from "../../services/adminMatchService";
import { getTeams } from "../../services/favoriteTeamService";
import { getMatchById } from "../../services/matchService";

const statusOptions = ["scheduled", "live", "finished", "postponed"];
const stageOptions = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter Final",
  "Semi Final",
  "Final",
];

const initialForm = {
  homeTeamId: "",
  awayTeamId: "",
  matchDate: "",
  stage: "",
  status: "scheduled",
  homeScore: "",
  awayScore: "",
};

function toDateTimeLocalValue(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const timezoneOffset = parsedDate.getTimezoneOffset() * 60000;
  return new Date(parsedDate.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

function getTeamOptionLabel(team) {
  return `${team.flag ?? ""} ${team.name ?? "Unknown team"}`.trim();
}

function resolveTeamId(teams, selectedTeamId) {
  const selectedTeam = teams.find((team) => String(team.id) === String(selectedTeamId));
  return selectedTeam?.id ?? selectedTeamId;
}

function buildScoreValue(score, status) {
  if (status !== "finished" || score === "") {
    return null;
  }

  return Number(score);
}

export default function AdminMatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const pageTitle = isEditMode ? "Edit Match" : "Add Match";

  useEffect(() => {
    async function loadFormData() {
      setLoading(true);
      setMessage("");

      const { data: teamsData, error: teamsError } = await getTeams();

      if (teamsError) {
        setMessage(teamsError.message);
        setLoading(false);
        return;
      }

      setTeams(teamsData ?? []);

      if (isEditMode) {
        const { data: matchData, error: matchError } = await getMatchById(id);

        if (matchError) {
          setMessage(matchError.message);
          setLoading(false);
          return;
        }

        if (matchData) {
          setForm({
            homeTeamId: matchData.home_team_id ?? "",
            awayTeamId: matchData.away_team_id ?? "",
            matchDate: toDateTimeLocalValue(matchData.match_date),
            stage: matchData.stage ?? "",
            status: matchData.status ?? "scheduled",
            homeScore: matchData.home_score ?? "",
            awayScore: matchData.away_score ?? "",
          });
        }
      }

      setLoading(false);
    }

    loadFormData();
  }, [id, isEditMode]);

  const selectedHomeTeamName = useMemo(() => {
    return teams.find((team) => String(team.id) === String(form.homeTeamId))?.name ?? "Home Team";
  }, [teams, form.homeTeamId]);

  const selectedAwayTeamName = useMemo(() => {
    return teams.find((team) => String(team.id) === String(form.awayTeamId))?.name ?? "Away Team";
  }, [teams, form.awayTeamId]);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function validateForm() {
    const homeScore = Number(form.homeScore);
    const awayScore = Number(form.awayScore);
    const hasHomeScore = form.homeScore !== "";
    const hasAwayScore = form.awayScore !== "";

    if (!form.homeTeamId) {
      return "Home team is required.";
    }

    if (!form.awayTeamId) {
      return "Away team is required.";
    }

    if (String(form.homeTeamId) === String(form.awayTeamId)) {
      return "Home team and away team cannot be the same.";
    }

    if (!form.matchDate) {
      return "Match date is required.";
    }

    if (!form.stage.trim()) {
      return "Stage is required.";
    }

    if (!form.status) {
      return "Status is required.";
    }

    if (form.status === "finished" && (!hasHomeScore || !hasAwayScore)) {
      return "Home score and away score are required when status is finished.";
    }

    if (hasHomeScore && (!Number.isFinite(homeScore) || homeScore < 0)) {
      return "Home score must be a number and cannot be negative.";
    }

    if (hasAwayScore && (!Number.isFinite(awayScore) || awayScore < 0)) {
      return "Away score must be a number and cannot be negative.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (saving) {
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setSaving(true);

    const payload = {
      home_team_id: resolveTeamId(teams, form.homeTeamId),
      away_team_id: resolveTeamId(teams, form.awayTeamId),
      match_date: new Date(form.matchDate).toISOString(),
      stage: form.stage.trim(),
      status: form.status,
      home_score: buildScoreValue(form.homeScore, form.status),
      away_score: buildScoreValue(form.awayScore, form.status),
    };

    const { error } = isEditMode
      ? await updateMatch(id, payload)
      : await createMatch(payload);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/admin/matches");
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Loading match form...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {pageTitle}
          </h1>
          <p className="mt-2 text-slate-600">
            Configure teams, schedule, status, and match scores.
          </p>
        </div>

        <Link
          to="/admin/matches"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {message ? (
          <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Home Team
            </span>
            <select
              value={form.homeTeamId}
              onChange={(event) => updateField("homeTeamId", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Choose home team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamOptionLabel(team)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Away Team
            </span>
            <select
              value={form.awayTeamId}
              onChange={(event) => updateField("awayTeamId", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Choose away team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {getTeamOptionLabel(team)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Match Date
            </span>
            <input
              type="datetime-local"
              value={form.matchDate}
              onChange={(event) => updateField("matchDate", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Stage</span>
            <select
              value={form.stage}
              onChange={(event) => updateField("stage", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Choose stage</option>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Preview Match
            </p>
            <p className="mt-2 text-lg font-black text-slate-950">
              {selectedHomeTeamName} vs {selectedAwayTeamName}
            </p>
            <p className="mt-1 text-sm text-slate-500">{form.stage || "Stage not set"}</p>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Home Score
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.homeScore}
              onChange={(event) => updateField("homeScore", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Leave empty if not finished"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Away Score
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.awayScore}
              onChange={(event) => updateField("awayScore", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Leave empty if not finished"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/matches"
            className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? "Saving..." : "Save Match"}
          </button>
        </div>
      </form>
    </section>
  );
}
