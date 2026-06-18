import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getProfile } from "../services/profileService";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/dashboard");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          setRedirectTo("/login");
          setAllowed(false);
          return;
        }

        const { data: profile, error } = await getProfile(user.id);

        if (error || !profile) {
          setRedirectTo("/dashboard");
          setAllowed(false);
          return;
        }

        setRedirectTo("/dashboard");
        setAllowed(profile.role === "admin");
      } catch (error) {
        console.error("Admin check failed:", error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-600">Checking admin access...</p>
      </section>
    );
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
