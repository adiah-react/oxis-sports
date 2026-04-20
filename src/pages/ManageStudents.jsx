import {
  AlertCircle,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AGE_GROUPS,
  AGE_GROUP_LABELS,
  GENDERS,
  addStudent,
  deleteStudent,
  getHouses,
  getStudents,
  updateStudent,
} from "../lib/firestore";
const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHouse, setFilterHouse] = useState("all");
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Form state
  const [name, setName] = useState("");
  const [houseId, setHouseId] = useState("");
  const [ageGroup, setAgeGroup] = useState("lower-school");
  const [gender, setGender] = useState("male");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
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
  const handleOpenModal = (student) => {
    if (student) {
      setEditingId(student.id);
      setName(student.name);
      setHouseId(student.houseId);
      setAgeGroup(student.ageGroup || "lower-school");
      setGender(student.gender || "male");
    } else {
      setEditingId(null);
      setName("");
      setAgeGroup("lower-school");
      setGender("male");
      if (houses.length > 0) setHouseId(houses[0].id);
    }
    setFormError("");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
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
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving student:", error);
      setFormError("Failed to save student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (
      window.confirm(`Are you sure you want to delete the student "${name}"?`)
    ) {
      try {
        await deleteStudent(id);
        await fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student.");
      }
    }
  };
  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesHouse =
      filterHouse === "all" || student.houseId === filterHouse;
    return matchesSearch && matchesHouse;
  });
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Students</h1>
          <p className="text-slate-500 mt-1">
            Add students and assign them to houses.
          </p>
        </div>
        <button
          // onClick={() => handleOpenModal()}
          onClick={() => navigate("/admin/students/create")}
          disabled={houses.length === 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${houses.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {houses.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              No houses found
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              You need to create at least one house before adding students.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterHouse}
              onChange={(e) => setFilterHouse(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
            >
              <option value="all">All Houses</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    House
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const house = houses.find((h) => h.id === student.houseId);
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium mr-3">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {house ? (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                backgroundColor: `${house.color}15`,
                                color: house.color,
                                borderColor: `${house.color}30`,
                              }}
                            >
                              <span className="mr-1">{house.iconEmoji}</span>
                              {house.name}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500 italic">
                              Unknown House
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-500">
                            {student.ageGroup
                              ? AGE_GROUP_LABELS[student.ageGroup]
                              : "N/A"}{" "}
                            •{" "}
                            {student.gender
                              ? student.gender.charAt(0).toUpperCase() +
                                student.gender.slice(1)
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/admin/students/${student.id}/edit`)
                            }
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(student.id, student.name)
                            }
                            className="text-rose-600 hover:text-rose-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-900">
                        No students found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search or add a new student.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={handleCloseModal}
            ></div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Users
                      className="h-6 w-6 text-indigo-600"
                      aria-hidden="true"
                    />
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
                          <div className="text-sm text-rose-700">
                            {formError}
                          </div>
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
                  onClick={handleCloseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
