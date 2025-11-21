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

      setTasks(tasksData || []);

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

    // Update UI instantly
    setStatuses((prev) => ({ ...prev, [taskId]: newValue }));

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

    // Check if all tasks are completed
    const allDone =
      Object.values({ ...statuses, [taskId]: newValue }).filter(Boolean)
        .length === tasks.length;

    if (allDone) {
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
        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
          {tasks.length === 0 && (
            <p className="text-gray-500 italic text-center">
              Geen taken beschikbaar.
            </p>
          )}

          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center gap-4 p-4 border rounded-xl shadow bg-gray-50 cursor-pointer"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={statuses[task.id] || false}
                onChange={() => toggleTask(task.id)}
                className="h-6 w-6"
              />

              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{task.icon || "📘"}</span>
                <span className="text-xl">{task.title}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
