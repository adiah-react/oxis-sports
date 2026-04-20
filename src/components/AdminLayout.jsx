import {
  Activity,
  Award,
  Calendar,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Award Points",
      href: "/admin/award",
      icon: Award,
    },
    {
      name: "Manage Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      name: "Manage Events",
      href: "/admin/events",
      icon: Calendar,
    },
    {
      name: "Manage Houses",
      href: "/admin/houses",
      icon: Flag,
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <Award className="h-6 w-6 text-indigo-400 mr-2" />
          <span className="font-bold text-lg tracking-tight">Admin Portal</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                    ${isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                  `}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-200" : "text-slate-400 group-hover:text-slate-300"}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-300 mr-3">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="text-sm font-medium text-slate-300 truncate">
              {user?.email}
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/"
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="mr-3 h-4 w-4" />
              Public Site
            </Link>
            <Link
              to="/?tab=sports-day"
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-amber-400 rounded-md hover:bg-amber-950 hover:text-amber-300 transition-colors"
            >
              <Activity className="mr-3 h-4 w-4" />
              Sports Day
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-rose-400 rounded-md hover:bg-rose-950 hover:text-rose-300 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
