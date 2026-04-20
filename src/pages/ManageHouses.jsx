import { AlertCircle, Edit2, Flag, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addHouse,
  deleteHouse,
  getHouses,
  seedInitialHouses,
  updateHouse,
} from "../lib/firestore";

const ManageHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [iconEmoji, setIconEmoji] = useState("🏆");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchHouses = async () => {
    setLoading(true);
    try {
      const data = await getHouses();
      setHouses(data);
    } catch (error) {
      console.error("Error fetching houses:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHouses();
  }, []);
  const handleOpenModal = (house) => {
    if (house) {
      setEditingId(house.id);
      setName(house.name);
      setColor(house.color);
      setIconEmoji(house.iconEmoji);
    } else {
      setEditingId(null);
      setName("");
      setColor("#3b82f6");
      setIconEmoji("🏆");
    }
    setFormError("");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !iconEmoji.trim()) {
      setFormError("Name and Icon Emoji are required");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingId) {
        await updateHouse(editingId, {
          name,
          color,
          iconEmoji,
        });
      } else {
        await addHouse({
          name,
          color,
          iconEmoji,
        });
      }
      await fetchHouses();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving house:", error);
      setFormError("Failed to save house. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete the house "${name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteHouse(id);
        await fetchHouses();
      } catch (error) {
        console.error("Error deleting house:", error);
        alert("Failed to delete house.");
      }
    }
  };
  const handleSeedHouses = async () => {
    if (window.confirm("This will add the 4 default houses. Proceed?")) {
      setLoading(true);
      try {
        await seedInitialHouses();
        await fetchHouses();
      } catch (error) {
        console.error("Error seeding houses:", error);
        alert("Failed to seed houses.");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Houses</h1>
          <p className="text-slate-500 mt-1">
            Create and configure the competing houses.
          </p>
        </div>
        <div className="flex gap-3">
          {houses.length === 0 && (
            <button
              onClick={handleSeedHouses}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Seed Default Houses
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add House
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="h-2 w-full"
                style={{
                  backgroundColor: house.color,
                }}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${house.color}20`,
                      border: `1px solid ${house.color}`,
                    }}
                  >
                    {house.iconEmoji}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(house)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(house.id, house.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {house.name}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: house.color,
                    }}
                  ></div>
                  {house.color}
                </div>
              </div>
            </div>
          ))}

          {houses.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
              <Flag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No houses yet
              </h3>
              <p className="text-slate-500 mb-4">
                Get started by creating your first house or seeding the
                defaults.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add House
              </button>
            </div>
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
                    <Flag
                      className="h-6 w-6 text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-bold text-slate-900"
                      id="modal-title"
                    >
                      {editingId ? "Edit House" : "Add New House"}
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
                          House Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g. Gryffindor"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="color"
                            className="block text-sm font-medium text-slate-700"
                          >
                            Theme Color
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="color"
                              id="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="h-9 w-9 rounded border border-slate-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                              className="block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="iconEmoji"
                            className="block text-sm font-medium text-slate-700"
                          >
                            Icon Emoji
                          </label>
                          <input
                            type="text"
                            id="iconEmoji"
                            value={iconEmoji}
                            onChange={(e) => setIconEmoji(e.target.value)}
                            className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-xl"
                            placeholder="🦁"
                            maxLength={2}
                          />
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
                  {isSubmitting ? "Saving..." : "Save House"}
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

export default ManageHouses;
