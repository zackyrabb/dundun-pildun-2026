import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { getCurrentUser } from "../services/authService";
import { getProfile, uploadAvatar, upsertProfile } from "../services/profileService";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function CompleteProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const { data } = await getProfile(currentUser.id);

      if (data) {
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || "");
      }
    }

    loadUser();
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (loading) {
      return;
    }

    if (!user) {
      setMessage("User is not logged in.");
      return;
    }

    if (!fullName.trim()) {
      setMessage("Full name is required.");
      return;
    }

    if (!username.trim()) {
      setMessage("Username is required.");
      return;
    }

    if (!avatarUrl && !avatarFile) {
      setMessage("Profile photo is required.");
      return;
    }

    if (avatarFile && !avatarFile.type.startsWith("image/")) {
      setMessage("Avatar file must be an image.");
      return;
    }

    if (avatarFile && avatarFile.size > MAX_AVATAR_SIZE) {
      setMessage("Avatar size must be 2MB or less.");
      return;
    }

    setLoading(true);

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const { data: uploadData, error: uploadError } = await uploadAvatar(
        user.id,
        avatarFile
      );

      if (uploadError) {
        setLoading(false);
        setMessage(uploadError.message);
        return;
      }

      finalAvatarUrl = uploadData.publicUrl;
    }

    const { error } = await upsertProfile({
      id: user.id,
      full_name: fullName.trim(),
      username: username.trim(),
      avatar_url: finalAvatarUrl,
      updated_at: new Date().toISOString()
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/check-onboarding", { replace: true });
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Complete Profile
        </h1>

        <p className="mt-2 text-slate-600">
          Add your name and profile photo before choosing favorite teams.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="example: budi"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="mt-4 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          <ErrorAlert message={message} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save and Continue"}
          </button>
        </form>
    </section>
  );
}
