import {
	Award,
	Calendar,
	Flag,
	TrendingUp,
	Users
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	getAllPointEntries,
	getEvents,
	getHouses,
	getStudents,
} from "../lib/firestore";
const AllEvents = () => {
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
          getAllPointEntries(),
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Point Awards
              </h2>
              {/* <Link
                to="/admin/award"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link> */}
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

export default AllEvents;
