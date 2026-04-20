import { AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addEvent, updateEvent } from "../lib/firestore";

const CreateEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingId, setEditingId] = useState(null);
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("regular");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { editingId } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      setFormError("Name and Date are required");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingId) {
        await updateEvent(editingId, {
          name,
          description,
          date,
          category,
        });
      } else {
        await addEvent({
          name,
          description,
          date,
          category,
        });
      }
      // await fetchEvents();
      // handleCloseModal();
      // alert(
      //   "Event saved successfully! You will be redirected to the events page.",
      // );

      // // Auto-redirect after 2 seconds
      // setTimeout(() => {
      //   navigate("/admin/events", {
      //     state: {
      //       eventCreated: true,
      //     },
      //   });
      // }, 3000);
      navigate("/admin/events");
    } catch (error) {
      console.error("Error saving event:", error);
      setFormError("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <Calendar className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3
              className="text-lg leading-6 font-bold text-slate-900"
              id="modal-title"
            >
              {editingId ? "Edit Event" : "Create New Event"}
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
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g. Sports Day 2026"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700"
                >
                  Event Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="regular">
                    Regular Event (e.g. Cricket, Football)
                  </option>
                  <option value="sports-day">Sports Day Event</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Details about the event..."
                />
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
          {isSubmitting ? "Saving..." : "Save Event"}
        </button>
        <button
          type="button"
          // onClick={handleCloseModal}
          onClick={() => navigate("/admin/events")}
          className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
