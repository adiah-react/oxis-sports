import { AlertCircle, Award, Check, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AGE_GROUPS,
  AGE_GROUP_LABELS,
  GENDERS,
  awardPointsBatch,
  getEvents,
  getHouses,
  getStudents,
} from "../lib/firestore";

const AwardPoints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Flow state
  const [step, setStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [points, setPoints] = useState(10);
  // Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHouse, setFilterHouse] = useState("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, studentsData, housesData] = await Promise.all([
          getEvents(),
          getStudents(),
          getHouses(),
        ]);
        setEvents(eventsData);
        setStudents(studentsData);
        setHouses(housesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleStudentToggle = (student) => {
    setSelectedStudents((prev) => {
      const isSelected = prev.some((s) => s.id === student.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };
  const handleSelectAllFiltered = () => {
    const filtered = getFilteredStudents();
    const allSelected = filtered.every((fs) =>
      selectedStudents.some((ss) => ss.id === fs.id),
    );
    if (allSelected) {
      // Deselect all filtered
      setSelectedStudents((prev) =>
        prev.filter((ss) => !filtered.some((fs) => fs.id === ss.id)),
      );
    } else {
      // Select all filtered (keeping existing selections)
      const newSelections = [...selectedStudents];
      filtered.forEach((fs) => {
        if (!newSelections.some((ss) => ss.id === fs.id)) {
          newSelections.push(fs);
        }
      });
      setSelectedStudents(newSelections);
    }
  };
  const getFilteredStudents = () => {
    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesHouse =
        filterHouse === "all" || student.houseId === filterHouse;
      const matchesAgeGroup =
        filterAgeGroup === "all" || student.ageGroup === filterAgeGroup;
      const matchesGender =
        filterGender === "all" || student.gender === filterGender;
      return matchesSearch && matchesHouse && matchesAgeGroup && matchesGender;
    });
  };
  const handleSubmit = async () => {
    if (!selectedEvent || selectedStudents.length === 0 || points <= 0) {
      setError("Please complete all steps correctly.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await awardPointsBatch(
        selectedStudents,
        selectedEvent,
        points,
        user?.email || "Unknown Admin",
      );
      setSuccess(true);
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setSelectedEvent(null);
        setSelectedStudents([]);
        setPoints(10);
        navigate("/admin");
      }, 3000);
    } catch (err) {
      console.error("Error awarding points:", err);
      setError("Failed to award points. Please try again.");
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No events available
        </h3>
        <p className="text-slate-500 mb-6">
          You need to create an event before you can award points.
        </p>
        <button
          onClick={() => navigate("/admin/events")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Create Event
        </button>
      </div>
    );
  }
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No students available
        </h3>
        <p className="text-slate-500 mb-6">
          You need to add students before you can award points.
        </p>
        <button
          onClick={() => navigate("/admin/students")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Add Students
        </button>
      </div>
    );
  }
  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-green-200 p-12 text-center max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Points Awarded!
        </h3>
        <p className="text-slate-600 mb-6">
          Successfully awarded {points} points to {selectedStudents.length}{" "}
          student(s) for {selectedEvent?.name}.
        </p>
        <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Award Points</h1>
        <p className="text-slate-500 mt-1">
          Follow the steps to award points to students.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-300"
            style={{
              width: `${((step - 1) / 3) * 100}%`,
            }}
          ></div>

          {[
            {
              num: 1,
              label: "Select Event",
            },
            {
              num: 2,
              label: "Select Students",
            },
            {
              num: 3,
              label: "Set Points",
            },
            {
              num: 4,
              label: "Confirm",
            },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                ${step > s.num ? "bg-indigo-600 border-indigo-600 text-white" : step === s.num ? "bg-white border-indigo-600 text-indigo-600" : "bg-white border-slate-300 text-slate-400"}
              `}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${step >= s.num ? "text-slate-900" : "text-slate-400"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        {error && (
          <div className="m-4 bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5" />
            <div className="text-sm text-rose-700">{error}</div>
          </div>
        )}

        <div className="flex-1 p-6">
          {/* Step 1: Select Event */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Which event are you awarding points for?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${selectedEvent?.id === event.id ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-900">
                        {event.name}
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${event.category === "sports-day" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}
                      >
                        {event.category === "sports-day"
                          ? "Sports Day"
                          : "Regular"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Students */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Who should receive points?
                </h2>
                <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {selectedStudents.length} selected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative md:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={filterHouse}
                  onChange={(e) => setFilterHouse(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Houses</option>
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterAgeGroup}
                  onChange={(e) => setFilterAgeGroup(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Ages</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {AGE_GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Genders</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center mb-2 px-2">
                <button
                  onClick={handleSelectAllFiltered}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {getFilteredStudents().every((fs) =>
                    selectedStudents.some((ss) => ss.id === fs.id),
                  ) && getFilteredStudents().length > 0
                    ? "Deselect All Filtered"
                    : "Select All Filtered"}
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-y-auto max-h-[300px] flex-1">
                <ul className="divide-y divide-slate-100">
                  {getFilteredStudents().map((student) => {
                    const house = houses.find((h) => h.id === student.houseId);
                    const isSelected = selectedStudents.some(
                      (s) => s.id === student.id,
                    );
                    return (
                      <li key={student.id}>
                        <label
                          className={`
                          flex items-center p-3 cursor-pointer hover:bg-slate-50 transition-colors
                          ${isSelected ? "bg-indigo-50/50" : ""}
                        `}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div
                              className={`
                              w-5 h-5 rounded border flex items-center justify-center transition-colors
                              ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white"}
                            `}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">
                              {student.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.ageGroup
                                ? AGE_GROUP_LABELS[student.ageGroup]
                                : ""}{" "}
                              •{" "}
                              {student.gender
                                ? student.gender.charAt(0).toUpperCase() +
                                  student.gender.slice(1)
                                : ""}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {house && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `${house.color}15`,
                                  color: house.color,
                                }}
                              >
                                {house.iconEmoji} {house.name}
                              </span>
                            )}
                          </div>
                          {/* Hidden checkbox for accessibility */}
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSelected}
                            onChange={() => handleStudentToggle(student)}
                          />
                        </label>
                      </li>
                    );
                  })}
                  {getFilteredStudents().length === 0 && (
                    <li className="p-8 text-center text-slate-500">
                      No students found matching your filters.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Set Points */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto text-center pt-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                How many points?
              </h2>
              <p className="text-slate-500 mb-8">
                Enter the number of points to award to each selected student.
              </p>

              <div className="flex items-center justify-center mb-8">
                <button
                  onClick={() => setPoints(Math.max(1, points - 5))}
                  className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  -5
                </button>
                <div className="mx-8 relative">
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-32 text-center text-5xl font-black text-indigo-600 border-none focus:ring-0 p-0"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-sm font-medium text-slate-400 uppercase tracking-widest">
                    Points
                  </div>
                </div>
                <button
                  onClick={() => setPoints(points + 5)}
                  className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                >
                  +5
                </button>
              </div>

              <div className="flex justify-center gap-3">
                {[5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPoints(val)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${points === val ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                Review and Confirm
              </h2>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Event
                    </div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      {selectedEvent?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Points per student
                    </div>
                    <div className="font-bold text-green-600 text-xl">
                      +{points}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="text-sm font-medium text-slate-500 mb-3 flex justify-between">
                    <span>Recipients ({selectedStudents.length})</span>
                    <span>
                      Total Points to Award: {selectedStudents.length * points}
                    </span>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedStudents.map((student) => {
                        const house = houses.find(
                          (h) => h.id === student.houseId,
                        );
                        return (
                          <span
                            key={student.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {house?.iconEmoji} {student.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${step === 1 || isSubmitting ? "text-slate-400 cursor-not-allowed" : "text-slate-700 hover:bg-slate-200 bg-slate-100"}`}
          >
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !selectedEvent) ||
                (step === 2 && selectedStudents.length === 0) ||
                (step === 3 && points <= 0)
              }
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Step <ChevronRight className="ml-2 -mr-1 w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-8 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Awarding..." : "Confirm & Award Points"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AwardPoints;
