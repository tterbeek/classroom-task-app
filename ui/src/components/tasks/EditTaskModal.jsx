import { useState } from "react";
import TaskIconPicker from "../TaskIconPicker";

export default function EditTaskModal({
  task,
  audience,
  setAudience,
  groups,
  selectedGroupIds,
  setSelectedGroupIds,
  onClose,
  onSave,
}) {
  const [title, setTitle] = useState(task.title);
  const [icon, setIcon] = useState(task.icon || "📘");
  const [priority, setPriority] = useState(task.priority || "required");
  const [samenwerken, setSamenwerken] = useState(!!task.samenwerken);
  const [zelfNakijken, setZelfNakijken] = useState(!!task.zelf_nakijken);
  const hasGroups = groups && groups.length > 0;

  function handleSave() {
    if (!title.trim()) return;
    onSave(
      title,
      icon,
      priority,
      audience,
      selectedGroupIds,
      samenwerken,
      zelfNakijken
    );
  }

  function toggleGroup(groupId) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
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

        <div className="mt-4">
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
              Moetjes
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="priority"
                value="optional"
                checked={priority === "optional"}
                onChange={() => setPriority("optional")}
              />
              Magjes
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-2">Samenwerken?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="samenwerken"
                value="yes"
                checked={samenwerken === true}
                onChange={() => setSamenwerken(true)}
              />
              Ja
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="samenwerken"
                value="no"
                checked={samenwerken === false}
                onChange={() => setSamenwerken(false)}
              />
              Nee
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block font-medium mb-2">Zelf nakijken?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="zelfNakijken"
                value="yes"
                checked={zelfNakijken === true}
                onChange={() => setZelfNakijken(true)}
              />
              Ja
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="zelfNakijken"
                value="no"
                checked={zelfNakijken === false}
                onChange={() => setZelfNakijken(false)}
              />
              Nee
            </label>
          </div>
        </div>

        <div className="mt-4">
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
          <div className="mt-4 space-y-4">
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
