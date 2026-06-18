import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/authService";
import ErrorAlert from "../components/ErrorAlert";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");

    if (loading) {
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    navigate("/check-onboarding", { replace: true });
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-green-500">
          <img
            src="/images/world-cup-2026-banner.jpg"
            alt="World Cup 2026 Banner"
            className="h-44 w-full rounded-3xl object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent p-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-200">
                Dundun Pildun 2026
              </p>
              <p className="text-xl font-black text-white">
                Predict. Compete. Climb.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Login</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <ErrorAlert message={message} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600">
            Register
          </Link>
        </p>
    </section>
  );
}
