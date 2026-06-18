import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const publicPaths = ["/", "/login", "/register", "/check-onboarding", "/complete-profile"];

export default function AppLayout({ children }) {
  const location = useLocation();
  const isPublicPage = publicPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!isPublicPage && <Navbar />}
      {children}
    </div>
  );
}
