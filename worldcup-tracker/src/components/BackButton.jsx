import { useLocation, useNavigate } from "react-router-dom";

function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const fallbackPath = location.pathname.startsWith("/admin") ? "/admin" : "/dashboard";

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <span aria-hidden="true">←</span>
      Back
    </button>
  );
}

export default BackButton;
