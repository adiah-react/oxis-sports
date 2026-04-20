import { AnimatePresence, motion } from "framer-motion";
import { Activity, Clock, Medal, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HouseCard from "../components/HouseCard";
import {
  AGE_GROUP_LABELS,
  AGE_GROUPS,
  subscribeToHouses,
  subscribeToPointEntries,
  subscribeToStudents,
} from "../lib/firestore";

const SPORTS_DAY_BONUS_POINTS = 50;
const isValidTab = (tab) =>
  tab === "overall" || tab === "sports-day" || tab == "regular";

const Leaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pointEntries, setPointEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    isValidTab(tabParam) ? tabParam : "overall",
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "overall") {
      setSearchParams({});
    } else {
      setSearchParams({
        tab,
      });
    }
  };

  useEffect(() => {
    const unsubHouses = subscribeToHouses(setHouses);
    const unsubStudents = subscribeToStudents(setStudents);
    const unsubPoints = subscribeToPointEntries(setPointEntries);
    const timer = setTimeout(() => setLoading(false), 1000);

    return () => {
      unsubHouses();
      unsubStudents();
      unsubPoints();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        >
          <Trophy className="w-12 h-12 text-indigo-300" />
        </motion.div>
      </div>
    );
  }

  // --- Helper Functions ---
  const getStudentPoints = (studentId, categoryFilter) => {
    return pointEntries
      .filter((entry) => entry.studentId === studentId)
      .filter(
        (entry) => !categoryFilter || entry.eventCategory === categoryFilter,
      )
      .reduce((sum, entry) => sum + entry.points, 0);
  };

  const getHousePoints = (houseId, categoryFilter) => {
    return pointEntries
      .filter((entry) => entry.houseId === houseId)
      .filter(
        (entry) => !categoryFilter || entry.eventCategory === categoryFilter,
      )
      .reduce((sum, entry) => sum + entry.points, 0);
  };

  // --- Sports Day Bonus Logic ---
  // Find best male and female on sports day
  const sportsDayStudentPoints = students.map((student) => ({
    ...student,
    sportsDayPoints: getStudentPoints(student.id, "sports-day"),
  }));

  const bestMaleSportsDay = [...sportsDayStudentPoints]
    .filter((s) => s.gener === "male" && s.sportsDayPoints > 0)
    .sort((a, b) => b.sportsDayPoints - a.sportsDayPoints)[0];
  const bestFemaleSportsDay = [...sportsDayStudentPoints]
    .filter((s) => s.gender === "female" && s.sportsDayPoints > 0)
    .sort((a, b) => b.sportsDayPoints - a.sportsDayPoints)[0];

  // --- Calculate Standings based on Active Tab ---
  const houseStandings = houses
    .map((house) => {
      let points = 0;
      let bonusPoints = 0;
      if (activeTab === "overall") {
        points = getHousePoints(house.id);
        // Add bonus points if this house has the best male or female on sports day
        if (bestMaleSportsDay?.houseId === house.id)
          bonusPoints += SPORTS_DAY_BONUS_POINTS;
        if (bestFemaleSportsDay?.houseId === house.id)
          bonusPoints += SPORTS_DAY_BONUS_POINTS;
      } else if (activeTab === "sports-day") {
        points = getHousePoints(house.id, "sports-day");
      } else if (activeTab === "regular") {
        points = getHousePoints(house.id, "regular");
      }

      return {
        ...house,
        basePoints: points,
        bonusPoints: bonusPoints,
        totalPoints: points + bonusPoints,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
  const maxPoints =
    houseStandings.length > 0 ? houseStandings[0].totalPoints : 0;

  // --- Top Scorers Logic ---
  const topScorers = students
    .map((student) => {
      let points = 0;
      if (activeTab === "overall") points = getStudentPoints(student.id);
      else if (activeTab === "sports-day")
        points = getStudentPoints(student.id, "sports-day");
      else if (activeTab === "regular")
        points = getStudentPoints(student.id, "regular");
      return {
        ...student,
        points,
      };
    })
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const recentEntries = pointEntries
    .filter((entry) => {
      if (activeTab === "overall") return true;
      return entry.eventCategory === activeTab;
    })
    .slice(0, 5);

  // --- Sports Day Specific Views ---
  const getTopPerformersByAgeGroup = () => {
    const performers = {};
    AGE_GROUPS.forEach((ageGroup) => {
      const studentsInGroup = sportsDayStudentPoints.filter(
        (s) => s.ageGroup === ageGroup && s.sportsDayPoints > 0,
      );
      const bestMale = [...studentsInGroup]
        .filter((s) => s.gender === "male")
        .sort((a, b) => b.sportsDayPoints - a.sportsDayPoints)[0];

      const bestFemale = [...studentsInGroup]
        .filter((s) => s.gender === "female")
        .sort((a, b) => b.sportsDayPoints - a.sportsDayPoints)[0];

      performers[ageGroup] = {
        bestMale,
        bestFemale,
      };
    });
    return performers;
  };

  const topPerformersByAgeGroup = getTopPerformersByAgeGroup();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-indigo-900 text-white pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <Trophy className="w-16 h-16 mx-auto text-amber-400 mb-6" />
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
              College Cup Standings
            </h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-8">
              The race for the College Cup is on! Watch the live standings as
              learners earn points for their houses.
            </p>

            {/* Tabs */}
            <div className="flex justify-center">
              <div className="bg-indigo-950/50 p-1.5 rounded-2xl backdrop-blur-sm inline-flex">
                <button
                  onClick={() => handleTabChange("overall")}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "overall" ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-200 hover:text-white hover:bg-indigo-800/50"}`}
                >
                  Overall Standings
                </button>
                <button
                  onClick={() => handleTabChange("sports-day")}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "sports-day" ? "bg-amber-500 text-amber-950 shadow-lg" : "text-indigo-200 hover:text-white hover:bg-indigo-800/50"}`}
                >
                  <Activity className="w-4 h-4" /> Sports Day
                </button>
                <button
                  onClick={() => handleTabChange("regular")}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "regular" ? "bg-indigo-600 text-white shadow-lg" : "text-indigo-200 hover:text-white hover:bg-indigo-800/50"}`}
                >
                  Regular Events
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        {/* Bonus Points Banner for Overall Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "overall" &&
            (bestMaleSportsDay || bestFemaleSportsDay) && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                className="mb-8 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg text-amber-950 border border-amber-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Medal className="w-6 h-6" />
                  <h2 className="text-xl font-black">
                    Sports Day Champions Bonus
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bestMaleSportsDay && (
                    <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">
                        Best Male Athlete
                      </div>
                      <div className="font-bold text-lg">
                        {bestMaleSportsDay.name}
                      </div>
                      <div className="text-sm flex items-center gap-2 mt-1">
                        <span className="bg-amber-950/10 px-2 py-0.5 rounded font-bold">
                          +{SPORTS_DAY_BONUS_POINTS} pts
                        </span>
                        <span>
                          for{" "}
                          {
                            houses.find(
                              (h) => h.id === bestMaleSportsDay.houseId,
                            )?.name
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  {bestFemaleSportsDay && (
                    <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-sm font-bold uppercase tracking-wider mb-1 opacity-80">
                        Best Female Athlete
                      </div>
                      <div className="font-bold text-lg">
                        {bestFemaleSportsDay.name}
                      </div>
                      <div className="text-sm flex items-center gap-2 mt-1">
                        <span className="bg-amber-950/10 px-2 py-0.5 rounded font-bold">
                          +{SPORTS_DAY_BONUS_POINTS} pts
                        </span>
                        <span>
                          for{" "}
                          {
                            houses.find(
                              (h) => h.id === bestFemaleSportsDay.houseId,
                            )?.name
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="space-y-6 mb-16">
          {houseStandings.map((house, index) => (
            <HouseCard
              key={`${house.id}-${activeTab}`} // Force re-render on tab change for animation
              house={house}
              points={house.totalPoints}
              rank={index + 1}
              maxPoints={maxPoints}
            />
          ))}

          {houseStandings.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">
                No houses found
              </h3>
              <p className="text-slate-500">
                Admins need to set up houses first.
              </p>
            </div>
          )}
        </div>

        {/* Sports Day Specific Section */}
        <AnimatePresence mode="wait">
          {activeTab === "sports-day" && (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              className="mb-16"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <Medal className="w-6 h-6 text-amber-500" />
                Top Performers by Age Group
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AGE_GROUPS.map((ageGroup) => {
                  const performers = topPerformersByAgeGroup[ageGroup];
                  if (!performers.bestMale && !performers.bestFemale)
                    return null;
                  return (
                    <div
                      key={ageGroup}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-slate-50 p-4 border-b border-slate-100 font-bold text-slate-700">
                        {AGE_GROUP_LABELS[ageGroup]}
                      </div>
                      <div className="p-0 divide-y divide-slate-100">
                        {performers.bestMale && (
                          <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                                Best Male
                              </div>
                              <div className="font-bold text-slate-900">
                                {performers.bestMale.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {
                                  houses.find(
                                    (h) => h.id === performers.bestMale.houseId,
                                  )?.name
                                }
                              </div>
                            </div>
                            <div className="font-black text-indigo-600 text-xl">
                              {performers.bestMale.sportsDayPoints}{" "}
                              <span className="text-sm font-normal text-slate-400">
                                pts
                              </span>
                            </div>
                          </div>
                        )}
                        {performers.bestFemale && (
                          <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                                Best Female
                              </div>
                              <div className="font-bold text-slate-900">
                                {performers.bestFemale.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {
                                  houses.find(
                                    (h) =>
                                      h.id === performers.bestFemale.houseId,
                                  )?.name
                                }
                              </div>
                            </div>
                            <div className="font-black text-indigo-600 text-xl">
                              {performers.bestFemale.sportsDayPoints}{" "}
                              <span className="text-sm font-normal text-slate-400">
                                pts
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Scorers */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <Star className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeTab === "overall"
                  ? "Overall Top Scorers"
                  : activeTab === "sports-day"
                    ? "Sports Day Top Scorers"
                    : "Regular Events Top Scorers"}
              </h2>
            </div>
            <div className="p-0">
              {topScorers.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {topScorers.map((student, index) => {
                    const house = houses.find((h) => h.id === student.houseId);
                    return (
                      <li
                        key={student.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 text-center font-bold text-slate-400">
                            #{index + 1}
                          </div>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{
                              backgroundColor: `${house?.color}20`,
                              color: house?.color,
                            }}
                          >
                            {house?.iconEmoji}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {student.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {house?.name}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-slate-700">
                          {student.points}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            pts
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No points awarded yet in this category.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-0">
              {recentEntries.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {recentEntries.map((entry) => {
                    const house = houses.find((h) => h.id === entry.houseId);
                    return (
                      <li
                        key={entry.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm mt-1 flex-shrink-0"
                              style={{
                                backgroundColor: `${house?.color}20`,
                                color: house?.color,
                              }}
                            >
                              {house?.iconEmoji}
                            </div>
                            <div>
                              <div className="text-sm text-slate-900">
                                <span className="font-medium">
                                  {entry.studentName}
                                </span>{" "}
                                earned points for{" "}
                                <span className="font-medium">
                                  {entry.eventName}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <span>
                                  {entry.awardedAt?.toDate
                                    ? new Date(
                                        entry.awardedAt.toDate(),
                                      ).toLocaleDateString()
                                    : "Just now"}
                                </span>
                                {entry.eventCategory === "sports-day" && (
                                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                    Sports Day
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                            +{entry.points}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  No recent activity in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
