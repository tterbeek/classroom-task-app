import { useState } from "react";

export default function AddStudentModal({ onAdd, onClose }) {
  const [name, setName] = useState("");

  function handleAdd() {
    if (!name.trim()) return;

    onAdd(name);      // parent handles inserting
    setName("");      // clear for next entry
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Leerling toevoegen</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Naam leerling"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuleren
          </button>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}
