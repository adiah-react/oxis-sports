import { getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getHouses,
  getStudentsByHouse,
  pointEntriesCollection,
} from "../lib/firestore";

export const HouseDetail = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHousePoints, setTotalHousePoints] = useState(0);

  useEffect(() => {
    const fetchHouseData = async () => {
      if (!id) return;
      try {
        // Fetch house details
        const houses = await getHouses();
        const currentHouse = houses.find((h) => h.id === id);
        if (!currentHouse) {
          setLoading(false);
          return;
        }
        setHouse(currentHouse);
        // Fetch students in this house
        const houseStudents = await getStudentsByHouse(id);
        // Fetch all point entries for this house
        const pointsQuery = query(
          pointEntriesCollection,
          where("houseId", "==", id),
        );
        const pointsSnapshot = await getDocs(pointsQuery);
        const points = pointsSnapshot.docs.map((doc) => doc.data());
        // Calculate total house points
        const total = points.reduce((sum, entry) => sum + entry.points, 0);
        setTotalHousePoints(total);
        // Calculate points per student
        const studentsWithPoints = houseStudents.map((student) => {
          const studentPoints = points
            .filter((entry) => entry.studentId === student.id)
            .reduce((sum, entry) => sum + entry.points, 0);
          return {
            ...student,
            totalPoints: studentPoints,
          };
        });
        // Sort by points descending
        studentsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);
        setStudents(studentsWithPoints);
      } catch (error) {
        console.error("Error fetching house details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHouseData();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!house) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Trophy className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          House Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          The house you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* House Header */}
      <div
        className="text-white py-16 px-4 relative overflow-hidden"
        style={{
          backgroundColor: house.color,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl border-4 border-white/20"
            >
              {house.iconEmoji}
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <motion.h1
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="text-5xl font-black tracking-tight mb-2"
              >
                House {house.name}
              </motion.h1>
              <motion.div
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="flex flex-wrap justify-center md:justify-start gap-4 text-white/90"
              >
                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span className="font-bold">
                    {totalHousePoints.toLocaleString()}
                  </span>{" "}
                  Total Points
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{students.length}</span> Members
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              House Roster & Standings
            </h2>
          </div>

          <div className="p-0">
            {students.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {students.map((student, index) => (
                  <motion.li
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    key={student.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index < 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}
                      `}
                      >
                        {index + 1}
                      </div>
                      <div className="font-medium text-slate-900 text-lg">
                        {student.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-lg">
                        {student.totalPoints}
                      </span>
                      <span className="text-sm text-slate-400">pts</span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">
                  No students found
                </h3>
                <p className="text-slate-500">
                  There are no students assigned to this house yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
