import { useState, useEffect } from "react";
import supabase from "../../supabaseClient";

export default function StudentTaskModal({ student, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState({});

  // 🔊 Sound effects
  const swoosh = new Audio("/sounds/swoosh.mp3");
  const ting = new Audio("/sounds/ting.mp3");

  // Load tasks + statuses
  useEffect(() => {
    async function loadData() {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("teacher_id", student.teacher_id)
        .order("created_at", { ascending: true });

      const { data: groupRows } = await supabase
        .from("group_students")
        .select("group_id")
        .eq("student_id", student.id);

      const groupIds = (groupRows || []).map((row) => row.group_id);

      let groupAssignments = [];
      if (groupIds.length > 0) {
        const { data } = await supabase
          .from("task_assignments")
          .select("task_id")
          .in("group_id", groupIds);
        groupAssignments = data || [];
      }

      const assignedTaskIds = new Set([
        ...groupAssignments.map((row) => row.task_id),
      ]);

      const visibleTasks = (tasksData || []).filter(
        (task) =>
          task.audience !== "targeted" ||
          (task.audience === "targeted" && assignedTaskIds.has(task.id))
      );

      setTasks(visibleTasks);

      const { data: statusData } = await supabase
        .from("task_status")
        .select("*")
        .eq("student_id", student.id);

      const map = {};
      (statusData || []).forEach((s) => (map[s.task_id] = s.completed));

      setStatuses(map);
    }

    loadData();
  }, [student]);

  // Toggle a task status
  async function toggleTask(taskId) {
    const newValue = !statuses[taskId];
    const nextStatuses = { ...statuses, [taskId]: newValue };

    // Update UI instantly
    setStatuses(nextStatuses);

    // Update DB
    const existing = await supabase
      .from("task_status")
      .select("*")
      .eq("student_id", student.id)
      .eq("task_id", taskId)
      .maybeSingle();

    if (existing.data) {
      await supabase
        .from("task_status")
        .update({ completed: newValue })
        .eq("id", existing.data.id);
    } else {
      await supabase.from("task_status").insert([
        {
          student_id: student.id,
          task_id: taskId,
          completed: newValue,
        },
      ]);
    }

    // 🔊 Play sounds
    if (newValue) {
      swoosh.volume = 0.9;
      playSafe(swoosh);
    }

    const requiredTasks = tasks.filter((task) => task.priority !== "optional");
    const wasAllDone =
      requiredTasks.length > 0 &&
      requiredTasks.every((task) => statuses[task.id]);
    const allDone =
      requiredTasks.length > 0 &&
      requiredTasks.every((task) => nextStatuses[task.id]);

    if (allDone && !wasAllDone) {
      ting.volume = 1;
      playSafe(ting);
    }
  }

// 🔊 Safe sound playback function
function playSafe(audio) {
  if (!audio) return;
  audio.play().catch(() => {});
}


  // Close when clicking outside modal
  function backdropClose(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={backdropClose}
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        {/* Student Name */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          {student.student_name}
        </h1>

        {/* Task List */}
        <div className="space-y-4 max-h-[85vh] overflow-auto pr-2">
          {tasks.length === 0 && (
            <p className="text-gray-500 italic text-center">
              Geen taken beschikbaar.
            </p>
          )}

          {[...tasks]
            .sort((a, b) => (a.priority === "optional") - (b.priority === "optional"))
            .map((task) => (
            <label
              key={task.id}
              className={`flex items-center gap-4 p-4 border rounded-xl shadow cursor-pointer ${
                task.priority === "optional"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-white"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={statuses[task.id] || false}
                onChange={() => toggleTask(task.id)}
                className="h-6 w-6"
              />

              {/* Icon + Title */}
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{task.icon || "📘"}</span>
                <span className="text-xl">{task.title}</span>
              </div>

              {task.priority === "optional" && (
                <span className="text-xs bg-gray-300 px-2 py-1 rounded-full">
                  extra
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
