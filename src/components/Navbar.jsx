import { Activity, LogIn, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                House Points
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Leaderboard
              </Link>
              <Link
                to="/?tab=sports-day"
                className="px-3 py-2 rounded-md text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50 transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                Sports Day
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
