import { useEffect, useMemo, useState } from "react";
import supabase from "../../supabaseClient";

export default function EditGroupModal({
  group,
  students = [],
  onClose,
  onSaved,
}) {
  const [name, setName] = useState(group?.name || "");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        a.student_name.localeCompare(b.student_name, "nl")
      ),
    [students]
  );

  useEffect(() => {
    setName(group?.name || "");
    setSelectedIds([]);
    setIsLoading(true);

    if (!group?.id) {
      setIsLoading(false);
      return;
    }

    async function loadMembers() {
      const { data, error } = await supabase
        .from("group_students")
        .select("student_id")
        .eq("group_id", group.id);

      if (error) {
        console.error("Error loading group members:", error);
        setIsLoading(false);
        return;
      }

      setSelectedIds((data || []).map((row) => row.student_id));
      setIsLoading(false);
    }

    loadMembers();
  }, [group]);

  function toggleStudent(studentId) {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }

  async function handleSave() {
    if (!group?.id || !name.trim()) return;

    const { error: updateError } = await supabase
      .from("groups")
      .update({ name: name.trim() })
      .eq("id", group.id);

    if (updateError) {
      console.error("Error updating group:", updateError);
      return;
    }

    const { error: deleteError } = await supabase
      .from("group_students")
      .delete()
      .eq("group_id", group.id);

    if (deleteError) {
      console.error("Error clearing group members:", deleteError);
      return;
    }

    if (selectedIds.length > 0) {
      const rows = selectedIds.map((studentId) => ({
        group_id: group.id,
        student_id: studentId,
      }));

      const { error: membersError } = await supabase
        .from("group_students")
        .insert(rows);

      if (membersError) {
        console.error("Error updating group members:", membersError);
      }
    }

    if (onSaved) onSaved();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Groep bewerken</h2>

        <label className="block mb-2 font-medium">Naam</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Groepsnaam"
        />

        <p className="text-sm font-medium mb-2">Leerlingen</p>
        {isLoading ? (
          <p className="text-sm text-gray-500 italic mb-4">Laden...</p>
        ) : sortedStudents.length === 0 ? (
          <p className="text-sm text-gray-500 italic mb-4">
            Nog geen leerlingen.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-auto pr-1 mb-4">
            {sortedStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="h-4 w-4"
                />
                <span>{student.student_name}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Annuleren
          </button>
          <button
            type="button"
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
