import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";

export default function StudentTaskModal({ student, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [statuses, setStatuses] = useState({}); // taskId → completed

  // Load tasks + status
  useEffect(() => {
    loadTasksAndStatus();
  }, [student]);

  async function loadTasksAndStatus() {
    if (!student) return;

    // Get teacher
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Load tasks
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    // Load student's task statuses
    const { data: statusData } = await supabase
      .from("task_status")
      .select("*")
      .eq("student_id", student.id);

    const statusMap = {};
    statusData?.forEach((s) => {
      statusMap[s.task_id] = s.completed;
    });

    setTasks(tasksData || []);
    setStatuses(statusMap);
  }

  // Toggle task
  async function toggleTask(taskId) {
    const newState = !statuses[taskId];

    setStatuses({
      ...statuses,
      [taskId]: newState,
    });

    const { data: existing } = await supabase
      .from("task_status")
      .select("*")
      .eq("student_id", student.id)
      .eq("task_id", taskId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("task_status")
        .update({ completed: newState })
        .eq("id", existing.id);
    } else {
      await supabase.from("task_status").insert([
        {
          student_id: student.id,
          task_id: taskId,
          completed: newState,
        },
      ]);
    }
  }

  if (!student) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
      onClick={onClose}                 // <-- CLICK OUTSIDE CLOSES
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}   // <-- CLICK INSIDE DOES NOT CLOSE
      >
        {/* Student Name */}
        <h1 className="text-3xl font-bold text-center mb-6">
          {student.student_name}
        </h1>

        {/* Task List */}
        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
          {tasks.length === 0 && (
            <p className="text-gray-500 italic text-center">
              No tasks available.
            </p>
          )}

          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-center p-4 border rounded-xl shadow bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={statuses[task.id] || false}
                onChange={() => toggleTask(task.id)}
                className="h-5 w-5 mr-4"
              />
              <span className="text-xl">{task.title}</span>
            </label>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
