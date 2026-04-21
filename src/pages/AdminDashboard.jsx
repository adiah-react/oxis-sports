import {
  ArrowRight,
  Award,
  Calendar,
  Flag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEvents,
  getHouses,
  getRecentPointEntries,
  getStudents,
} from "../lib/firestore";
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    houses: 0,
    students: 0,
    events: 0,
    totalPoints: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [houses, students, events, recentPoints] = await Promise.all([
          getHouses(),
          getStudents(),
          getEvents(),
          getRecentPointEntries(5),
        ]);
        // Calculate total points from recent entries (rough estimate for dashboard)
        // In a real app, we might want an aggregation query or a separate stats document
        const totalPoints = recentPoints.reduce(
          (sum, entry) => sum + entry.points,
          0,
        );
        setStats({
          houses: houses.length,
          students: students.length,
          events: events.length,
          totalPoints: totalPoints, // Note: this is just from recent entries
        });
        setRecentActivity(recentPoints);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  const statCards = [
    {
      name: "Total Students",
      value: stats.students,
      icon: Users,
      color: "bg-blue-500",
      link: "/admin/students",
    },
    {
      name: "Active Houses",
      value: stats.houses,
      icon: Flag,
      color: "bg-indigo-500",
      link: "/admin/houses",
    },
    {
      name: "Total Events",
      value: stats.events,
      icon: Calendar,
      color: "bg-emerald-500",
      link: "/admin/events",
    },
    {
      name: "Recent Points",
      value: stats.totalPoints,
      icon: TrendingUp,
      color: "bg-amber-500",
      link: "/admin/award",
    },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Welcome to the House Points administration portal.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon
                  className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`}
                />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-sm font-medium text-slate-500">{stat.name}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <Link
                to="/admin/award"
                className="flex items-center w-full p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors group"
              >
                <div className="bg-white p-2 rounded-md shadow-sm mr-4 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Award Points</div>
                  <div className="text-xs text-indigo-500 mt-0.5">
                    Give points to students
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/events"
                className="flex items-center w-full p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors group"
              >
                <div className="bg-white p-2 rounded-md shadow-sm mr-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Create Event</div>
                  <div className="text-xs text-emerald-500 mt-0.5">
                    Schedule a new competition
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/students"
                className="flex items-center w-full p-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors group"
              >
                <div className="bg-white p-2 rounded-md shadow-sm mr-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-bold">Add Student</div>
                  <div className="text-xs text-blue-500 mt-0.5">
                    Register a new house member
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Point Awards
              </h2>
              <Link
                to="/admin/all-events"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>
            <div className="p-0">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {recentActivity.map((entry) => (
                    <li
                      key={entry.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-100 text-green-700 p-2 rounded-lg font-bold min-w-[3rem] text-center">
                            +{entry.points}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {entry.studentName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              For: {entry.eventName} • By: {entry.awardedBy}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {entry.awardedAt?.toDate
                            ? new Date(
                                entry.awardedAt.toDate(),
                              ).toLocaleDateString()
                            : "Just now"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">
                    No points awarded yet
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Start by creating an event and awarding points.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
