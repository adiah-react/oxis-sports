import { AlertCircle, Check, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	addPoints,
	getEvents,
	getHouses,
	getStudents
} from "../lib/firestore";

const Places = () => {
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
	const [firstPlace, setFirstPlace] = useState("");
	const [secondPlace, setSecondPlace] = useState("");
	const [thirdPlace, setThirdPlace] = useState("");
	const [fourthPlace, setFourthPlace] = useState("");
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
	const handleEventChange = (event) => {
		// setSelectedEvent(event.target.value); // Update state with selected value
		const currentEvent = events.filter((e) => e.id === event.target.value)[0];
		setSelectedEvent(currentEvent);


	};const handleFirstChange= (event) => {
		setFirstPlace(event.target.value); // Update state with selected value
	};const handleSecondChange= (event) => {
		setSecondPlace(event.target.value); // Update state with selected value
	};const handleThirdChange= (event) => {
		setThirdPlace(event.target.value); // Update state with selected value
	};const handleFourthChange= (event) => {
		setFourthPlace(event.target.value); // Update state with selected value
	}
  const handleSubmit = async (e) => {
		e.preventDefault();
    // Read the form data
    // const form = e.target;
    // const formData = new FormData(form);

		// console.log(formData)

    // if (!selectedEvent || selectedStudents.length === 0 || points <= 0) {
    //   setError("Please complete all steps correctly.");
    //   return;
    // }

    setIsSubmitting(true);
    setError("");

    try {
      // await awardPointsBatch(
      //   selectedStudents,
      //   selectedEvent,
      //   points,
      //   user?.email || "Unknown Admin",
      // );
			await addPoints(students.filter((student) => student.id === firstPlace)[0], selectedEvent, 10, user?.email || "Unknown Admin",);
			await addPoints(students.filter((student) => student.id === secondPlace)[0], selectedEvent, 6, user?.email || "Unknown Admin",);
			await addPoints(students.filter((student) => student.id === thirdPlace)[0], selectedEvent, 4, user?.email || "Unknown Admin",);
			await addPoints(students.filter((student) => student.id === fourthPlace)[0], selectedEvent, 2, user?.email || "Unknown Admin",);

			console.log(firstPlace, secondPlace, thirdPlace, fourthPlace)
			console.log("Award Points")
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
		<div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
			<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <Users className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3
              className="text-lg leading-6 font-bold text-slate-900"
              id="modal-title"
            >
              Award Points for Event
            </h3>
			<form onSubmit={handleSubmit} className="mt-6 space-y-4">
				{/* Event Select */}
				<div>
					<label htmlFor="event" className="block text-sm font-medium text-gray-700">
						What event?
					</label>
					<select id="event" name="event" onChange={handleEventChange}
className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					>
						{events.map(event => (
							<option key={event.id} value={event.id}>{event.name}</option>
						))}
					</select>
				</div>

				{/* 1st place */}
				<div>
					<label
className="block text-sm font-medium text-slate-700"
					 htmlFor="firstPlace">First Place Learner</label>
					<select id="firstPlace" name="firstPlace" onChange={handleFirstChange}
className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
					>
						<option value="">Select 1st Place</option>
						{students.map(student => (
							<option key={student.id} value={student.id}>
								{student.name}
							</option>
						))}
					</select>
				</div>

				{/* 2nd place */}
				<div>
					<label
className="block text-sm font-medium text-slate-700"
					 htmlFor="secondPlace">Second Place Learner</label>
				<select  name="secondPlace" id="secondPlace" onChange={handleSecondChange}
				className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
					<option value="">Select 2nd Place</option>
					{students.map(student => (
						<option key={student.id} value={student.id}>
							{student.name}
						</option>
					))}
				</select>
				</div>

				{/* 3rd place */}
				 <div>
					<label
className="block text-sm font-medium text-slate-700"
					htmlFor="thirdPlace">Third Place Learner</label>
				<select name="thirdPlace" id="thirdPlace"	onChange={handleThirdChange}
				className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
					<option value="">Select 3rd Place</option>
					{students.map(student => (
						<option key={student.id} value={student.id}>
							{student.name}
						</option>
					))}
				</select>
				</div>

				{/* 4th place */}
				<div>
					<label
className="block text-sm font-medium text-slate-700"
					 htmlFor="fourthPlace">Fourth Place Learner</label>
					<select name="fourthPlace" id="fourthPlace" onChange={handleFourthChange}
					className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
						<option value="">Select 4th Place</option>
						{students.map(student => (
							<option key={student.id} value={student.id}>
								{student.name}
							</option>
						))}
					</select>
				</div>
				{/* Submit */}

					<button className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm" type="submit">Submit</button>

				</form>
			</div>
				</div>
			</div>
		</div>
  );
};

export default Places;
