import { AlertCircle, Flag } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addHouse, updateHouse } from "../lib/firestore";

const CreateHouse = () => {
  //  pass in as props if needed
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { editingId } = useParams();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [iconEmoji, setIconEmoji] = useState("🏆");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // await fetchHouses();
      // handleCloseModal();

      // alert(
      //   "House saved successfully! You will be redirected to the houses page.",
      // );

      // // Auto-redirect after 2 seconds
      // setTimeout(() => {
      //   navigate("/admin/houses", {
      //     state: {
      //       houseCreated: true,
      //     },
      //   });
      // }, 3000);
      navigate("/admin/houses");
    } catch (error) {
      console.error("Error saving house:", error);
      setFormError("Failed to save house. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <Flag className="h-6 w-6 text-indigo-600" aria-hidden="true" />
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
                    <div className="text-sm text-rose-700">{formError}</div>
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
            // onClick={handleCloseModal}
            onClick={() => navigate("/admin/houses")}
            className="mt-3 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHouse;
