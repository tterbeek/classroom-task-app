import { useEffect, useRef } from "react";
import TaskIconPicker from "../TaskIconPicker";

export default function AddTaskModal({
  title,
  setTitle,
  selectedIcon,
  setSelectedIcon,
  onAdd,
  onClose,
}) {
  const inputRef = useRef(null);

  // Focus the input whenever modal opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  function handleSubmit(e) {
    e.preventDefault(); // ❗ prevents modal from closing
    if (!title.trim()) return;

    onAdd();            // save to DB
    setTitle("");       // clear title
    setSelectedIcon("📘"); // reset icon
    setTimeout(() => inputRef.current?.focus(), 50); // refocus for next task
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Nieuwe taak</h2>

        {/* Wrap in form to catch ENTER */}
        <form onSubmit={handleSubmit}>
          {/* Task Title */}
          <label className="block mb-2 font-medium">Titel van taak</label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2 mb-4"
            placeholder="Bijv. Rekenen opdracht"
          />

          {/* Icon Picker */}
          <label className="block mb-2 font-medium">Kies een icoontje</label>
          <TaskIconPicker
            selectedIcon={selectedIcon}
            onSelect={(icon) => setSelectedIcon(icon)}
          />

          {/* Bottom Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Annuleren
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
