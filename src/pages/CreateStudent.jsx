import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addStudent,
  AGE_GROUP_LABELS,
  AGE_GROUPS,
  GENDERS,
  getHouses,
  getStudents,
  updateStudent,
} from "../lib/firestore";

const CreateStudent = () => {
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHouse, setFilterHouse] = useState("all");
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state
  const [name, setName] = useState("");
  const [houseId, setHouseId] = useState("");
  const [ageGroup, setAgeGroup] = useState("lower-school");
  const [gender, setGender] = useState("male");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { editingId } = useParams();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, housesData] = await Promise.all([
        getStudents(),
        getHouses(),
      ]);
      setStudents(studentsData);
      setHouses(housesData);
      // Set default houseId for form if houses exist
      if (housesData.length > 0 && !houseId) {
        setHouseId(housesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !houseId) {
      setFormError("Name and House are required");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingId) {
        await updateStudent(editingId, {
          name,
          houseId,
          ageGroup,
          gender,
        });
      } else {
        await addStudent({
          name,
          houseId,
          ageGroup,
          gender,
        });
      }
      // await fetchData();
      // handleCloseModal();
      // alert(
      //   "Student saved successfully! You will be redirected to the student page.",
      // );

      // // Auto-redirect after 2 seconds
      // setTimeout(() => {
      //   navigate("/admin/students", {
      //     state: {
      //       studentCreated: true,
      //     },
      //   });
      // }, 3000);
      navigate("/admin/students");
    } catch (error) {
      console.error("Error saving student:", error);
      setFormError("Failed to save student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {editingId ? "Edit Student" : "Add New Student"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5" />
                  <div className="text-sm text-rose-700">{formError}</div>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. Harry Potter"
                />
              </div>

              <div>
                <label
                  htmlFor="house"
                  className="block text-sm font-medium text-slate-700"
                >
                  Assign to House
                </label>
                <select
                  id="house"
                  value={houseId}
                  onChange={(e) => setHouseId(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.iconEmoji} {house.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="ageGroup"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Age Group
                  </label>
                  <select
                    id="ageGroup"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {AGE_GROUP_LABELS[group]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Saving..." : "Save Student"}
        </button>
        <button
          type="button"
          // onClick={handleCloseModal}
          onClick={() => navigate("/admin/students")}
          className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateStudent;
