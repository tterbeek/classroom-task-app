import { useState } from "react";
import TaskIconPicker from "../TaskIconPicker"; // since picker is in /components

export default function AddTaskModal({ title, setTitle, selectedIcon, setSelectedIcon, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4">Nieuwe taak</h2>

        {/* Task Title */}
        <label className="block mb-2 font-medium">Titel van taak</label>
        <input
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Annuleren
          </button>

          <button
            onClick={() => onAdd()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
