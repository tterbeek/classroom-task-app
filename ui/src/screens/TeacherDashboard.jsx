import { isDashboardUnlocked } from "../auth/DashboardLock";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";

// Student components
import StudentList from "../components/students/StudentList";
import AddStudentModal from "../components/students/AddStudentModal";
import DeleteStudentModal from "../components/students/DeleteStudentModal";

// Task components
import TaskList from "../components/tasks/TaskList";
import AddTaskModal from "../components/tasks/AddTaskModal";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const [newStudentName, setNewStudentName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState("📘");

  // Protect the dashboard
  useEffect(() => {
    if (!isDashboardUnlocked()) navigate("/pin", { replace: true });
  }, [navigate]);

  // ---------- LOADERS ----------
  async function loadStudents() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("students")
      .select("*")
      .eq("teacher_id", user.id)
      .order("student_name", { ascending: true });

    setStudents(data || []);
  }

  async function loadTasks() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    setTasks(data || []);
  }

  useEffect(() => {
    loadStudents();
    loadTasks();
  }, []);

  // ---------- STUDENT ACTIONS ----------
  async function addStudent() {
    if (!newStudentName.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("students").insert([
      {
        teacher_id: user.id,
        student_name: newStudentName,
      },
    ]);

    setNewStudentName("");
    setShowAddStudent(false);
    loadStudents();
  }

  async function deleteStudent() {
    await supabase.from("students").delete().eq("id", deleteStudentId);
    setDeleteStudentId(null);
    loadStudents();
  }

  // ---------- TASK ACTIONS ----------
  async function addTask() {
    if (!newTaskTitle.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTaskTitle,
        icon: newTaskIcon,
        teacher_id: user.id,
      },
    ]);

    if (error) console.error(error);

    setNewTaskTitle("");
    setNewTaskIcon("📘");
    setShowAddTask(false);
    loadTasks();
  }

  async function deleteTask() {
    await supabase.from("tasks").delete().eq("id", deleteTaskId);
    setDeleteTaskId(null);
    loadTasks();
  }

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leerkracht Dashboard</h1>

        <button
          onClick={() => navigate("/classroom")}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Terug naar klasoverzicht
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-8">

        {/* LEFT COLUMN = TASKS (2/3 width) */}
        <div className="w-2/3 bg-white shadow rounded-xl p-6">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Taken</h2>

            <button
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nieuwe Taak
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">Nog geen taken toegevoegd.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon || "📘"}</span>
                    <span className="text-gray-800">{task.title}</span>
                  </div>

                  <button
                    onClick={() => setDeleteTaskId(task.id)}
                    className="text-red-600 hover:underline"
                  >
                    Verwijder
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COLUMN = STUDENTS (1/3 width) */}
        <div className="w-1/3 bg-gray-50 border rounded-xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Leerlingen</h2>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Leerling toevoegen
            </button>
          </div>

          <StudentList
            students={students}
            onDelete={(id) => setDeleteStudentId(id)}
          />
        </div>
      </div>

      {/* STUDENT MODALS */}
      {showAddStudent && (
        <AddStudentModal
          name={newStudentName}
          setName={setNewStudentName}
          onAdd={addStudent}
          onClose={() => setShowAddStudent(false)}
        />
      )}

      {deleteStudentId && (
        <DeleteStudentModal
          onConfirm={deleteStudent}
          onClose={() => setDeleteStudentId(null)}
        />
      )}

      {/* TASK MODALS */}
      {showAddTask && (
        <AddTaskModal
          title={newTaskTitle}
          setTitle={setNewTaskTitle}
          selectedIcon={newTaskIcon}
          setSelectedIcon={setNewTaskIcon}
          onAdd={addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {deleteTaskId && (
        <DeleteTaskModal
          onConfirm={deleteTask}
          onClose={() => setDeleteTaskId(null)}
        />
      )}
    </div>
  );
}
