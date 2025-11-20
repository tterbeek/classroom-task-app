import { useState } from "react";
import TaskIconPicker from "../TaskIconPicker";

export default function EditTaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [icon, setIcon] = useState(task.icon || "📘");

  function handleSave() {
    if (!title.trim()) return;
    onSave(title, icon);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2 className="text-2xl font-bold mb-4">Taak bewerken</h2>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Nieuwe titel"
        />

        {/* Icon Picker */}
        <TaskIconPicker selectedIcon={icon} onSelect={setIcon} />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuleren
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
