import { AlertCircle, Calendar, Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../lib/firestore";

export const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("regular");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);
  const handleOpenModal = (event) => {
    if (event) {
      setEditingId(event.id);
      setName(event.name);
      setDescription(event.description);
      setDate(event.date);
      setCategory(event.category || "regular");
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("regular");
    }
    setFormError("");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
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
      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving event:", error);
      setFormError("Failed to save event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (
      window.confirm(`Are you sure you want to delete the event "${name}"?`)
    ) {
      try {
        await deleteEvent(id);
        await fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event.");
      }
    }
  };
  // Group events by upcoming and past
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastEvents = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const EventCard = ({ event }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          <Calendar className="w-4 h-4" />
          {new Date(event.date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="flex gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md ${event.category === "sports-day" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}
          >
            {event.category === "sports-day" ? "Sports Day" : "Regular"}
          </span>
          <button
            // onClick={() => handleOpenModal(event)}
            onClick={() => navigate(`/admin/events/${event.id}/edit/`)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(event.id, event.name)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{event.name}</h3>
      <p className="text-sm text-slate-500 line-clamp-2">
        {event.description || "No description provided."}
      </p>
    </div>
  );
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
          <p className="text-slate-500 mt-1">
            Create events to award points for later.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/events/create")}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No events scheduled
              </h3>
              <p className="text-slate-500 mb-4">
                Create your first event to start awarding points.
              </p>
              <button
                onClick={() => navigate("/admin/events/create")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
            </div>
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Upcoming Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {pastEvents.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 mt-8">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Past Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

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
                    <Calendar
                      className="h-6 w-6 text-indigo-600"
                      aria-hidden="true"
                    />
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
