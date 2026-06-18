import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { getOnboardingStatus } from "../services/onboardingService";

export default function CheckOnboarding() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Checking your account...");

  useEffect(() => {
    async function check() {
      const user = await getCurrentUser();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data, error } = await getOnboardingStatus(user.id);

      if (error) {
        setMessage(error.message || "Failed to check account status.");
        return;
      }

      navigate(data.nextPath, { replace: true });
    }

    check();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="font-semibold text-slate-700">{message}</p>
      </div>
    </div>
  );
}
