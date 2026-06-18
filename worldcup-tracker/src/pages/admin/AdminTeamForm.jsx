import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTeam,
  getTeamById,
  updateTeam,
} from "../../services/adminTeamService";

export default function AdminTeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const title = useMemo(() => {
    return isEditMode ? "Edit Team" : "Add Team";
  }, [isEditMode]);

  useEffect(() => {
    async function loadTeam() {
      if (!isEditMode) {
        return;
      }

      setLoading(true);
      setMessage("");

      const { data, error } = await getTeamById(id);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setCode(data.code || "");
      setGroupName(data.group_name || "");
      setFlag(data.flag || "");
      setLoading(false);
    }

    loadTeam();
  }, [id, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (saving) {
      return;
    }

    if (!name.trim()) {
      setMessage("Team name is required.");
      return;
    }

    if (!code.trim()) {
      setMessage("Team code is required.");
      return;
    }

    if (code.trim().length < 2 || code.trim().length > 4) {
      setMessage("Team code should be 2 to 4 characters, for example: ARG.");
      return;
    }

    if (!groupName.trim()) {
      setMessage("Group is required, for example: Group A.");
      return;
    }

    if (!flag.trim()) {
      setMessage("Flag is required, for example: 🇦🇷.");
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      group_name: groupName.trim(),
      flag: flag.trim(),
    };

    setSaving(true);

    const { error } = isEditMode
      ? await updateTeam(id, payload)
      : await createTeam(payload);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/admin/teams");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <p className="font-semibold text-slate-600">Loading team form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-900">
            {title}
          </h1>

          <p className="mt-2 text-slate-600">
            Manage team name, code, group, and flag.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Team Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Argentina"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Team Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase"
                placeholder="ARG"
                maxLength={4}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Group
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Group J"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Flag / Emoji
              </label>
              <input
                type="text"
                value={flag}
                onChange={(event) => setFlag(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="🇦🇷"
              />
              <p className="mt-2 text-sm text-slate-500">
                For the MVP, use a flag emoji so no file upload is needed.
              </p>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/admin/teams")}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
