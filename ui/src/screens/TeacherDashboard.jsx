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
  // ---- STUDENTS ----
  const [students, setStudents] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  // ---- TASKS ----
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const navigate = useNavigate();

  // ---- PIN LOCK ----
  useEffect(() => {
    if (!isDashboardUnlocked()) {
      navigate("/pin", { replace: true });
    }
  }, [navigate]);

  // ---- LOAD STUDENTS ----
  async function loadStudents() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return setTimeout(loadStudents, 200);
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("teacher_id", user.id)
      .order("student_name", { ascending: true });

    if (!error) setStudents(data);
  }

  // ---- LOAD TASKS ----
  async function loadTasks() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    if (!error) setTasks(data);
  }

  // ---- INITIAL LOAD ----
  useEffect(() => {
    if (isDashboardUnlocked()) {
      loadStudents();
      loadTasks();
    }
  }, []);

  // ---- ADD STUDENT ----
  async function addStudent() {
    if (!newStudentName.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("students").insert([
      {
        student_name: newStudentName,
        teacher_id: user.id,
      },
    ]);

    if (!error) {
      setNewStudentName("");
      setShowAddStudent(false);
      loadStudents();
    }
  }

  // ---- DELETE STUDENT ----
  async function deleteStudent() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", deleteId)
      .eq("teacher_id", user.id);

    if (!error) {
      setDeleteId(null);
      loadStudents();
    }
  }

  // ---- ADD TASK ----
  async function addTask() {
    if (!taskTitle.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("tasks").insert([
      {
        title: taskTitle,
        teacher_id: user.id,
      },
    ]);

    if (!error) {
      setTaskTitle("");
      setShowAddTask(false);
      loadTasks();
    }
  }

  // ---- DELETE TASK ----
  async function deleteTask() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", deleteTaskId)
      .eq("teacher_id", user.id);

    if (!error) {
      setDeleteTaskId(null);
      loadTasks();
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
    <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

<button
  onClick={() => navigate("/classroom")}
  className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800"
>
  ← Back to Classroom
</button>


      {/* ---------- STUDENTS PANEL ---------- */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Students</h2>

        <StudentList
          students={students}
          onDelete={(id) => setDeleteId(id)}
        />

        <button
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowAddStudent(true)}
        >
          + Add Student
        </button>
      </div>

      {/* ---------- TASKS PANEL ---------- */}
      <div className="bg-white shadow rounded-xl p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>

        <TaskList tasks={tasks} onDelete={(id) => setDeleteTaskId(id)} />

        <button
          className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={() => setShowAddTask(true)}
        >
          + Add Task
        </button>
      </div>

      {/* ---- Add Student Modal ---- */}
      {showAddStudent && (
        <AddStudentModal
          name={newStudentName}
          setName={setNewStudentName}
          onAdd={addStudent}
          onClose={() => setShowAddStudent(false)}
        />
      )}

      {/* ---- Delete Student Modal ---- */}
      {deleteId && (
        <DeleteStudentModal
          onConfirm={deleteStudent}
          onClose={() => setDeleteId(null)}
        />
      )}

      {/* ---- Add Task Modal ---- */}
      {showAddTask && (
        <AddTaskModal
          title={taskTitle}
          setTitle={setTaskTitle}
          onAdd={addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {/* ---- Delete Task Modal ---- */}
      {deleteTaskId && (
        <DeleteTaskModal
          onConfirm={deleteTask}
          onClose={() => setDeleteTaskId(null)}
        />
      )}
    </div>
  );
}
