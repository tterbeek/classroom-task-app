import { useEffect, useRef } from "react";
import TaskIconPicker from "../TaskIconPicker";

export default function AddTaskModal({
  title,
  setTitle,
  selectedIcon,
  setSelectedIcon,
  priority,
  setPriority,
  audience,
  setAudience,
  groups,
  selectedGroupIds,
  setSelectedGroupIds,
  onAdd,
  onClose,
}) {
  const inputRef = useRef(null);
  const hasGroups = groups && groups.length > 0;

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
    setPriority("required");
    setAudience("all");
    setSelectedGroupIds([]);
    setTimeout(() => inputRef.current?.focus(), 50); // refocus for next task
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
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

          <div className="mb-4">
            <label className="block font-medium mb-2">Type taak</label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priority"
                  value="required"
                  checked={priority === "required"}
                  onChange={() => setPriority("required")}
                />
                Nodig
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="priority"
                  value="optional"
                  checked={priority === "optional"}
                  onChange={() => setPriority("optional")}
                />
                Extra
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Voor wie?</label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="all"
                  checked={audience === "all"}
                  onChange={() => setAudience("all")}
                />
                Hele klas
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="targeted"
                  checked={audience === "targeted"}
                  onChange={() => setAudience("targeted")}
                />
                Specifiek
              </label>
            </div>
          </div>

          {audience === "targeted" && (
            <div className="mb-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Groepen</p>
                {hasGroups ? (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => {
                      const isSelected = selectedGroupIds.includes(group.id);
                      return (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          className={`px-3 py-1 rounded-full border text-sm ${
                            isSelected
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white"
                          }`}
                        >
                          {group.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nog geen groepen.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Sluiten
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
