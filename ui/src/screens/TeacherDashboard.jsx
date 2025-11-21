import { isDashboardUnlocked } from "../auth/DashboardLock";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import EditTaskListTitleModal from "../components/tasks/EditTaskListTitleModal";

// Student components
import StudentList from "../components/students/StudentList";
import AddStudentModal from "../components/students/AddStudentModal";
import DeleteStudentModal from "../components/students/DeleteStudentModal";
import EditTaskModal from "../components/tasks/EditTaskModal";

// Task components
import AddTaskModal from "../components/tasks/AddTaskModal";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";



export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null); // holds task being edited

  const [taskListTitle, setTaskListTitle] = useState("Taken van vandaag");
  const [showEditTaskTitle, setShowEditTaskTitle] = useState(false);


  const [showAddStudent, setShowAddStudent] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState("📘");

  // -------------------------------------------------------
  // 1️⃣ Protect the dashboard — must unlock via PIN first
  // -------------------------------------------------------
  useEffect(() => {
    if (!isDashboardUnlocked()) {
      console.log("Dashboard locked → redirecting to PIN screen");
      navigate("/pin", { replace: true });
    }
  }, [navigate]);


// Title of the dagtaken for that teacher
  useEffect(() => {
  async function loadTeacherSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("teachers")
      .select("task_list_title")
      .eq("id", user.id)
      .single();

    if (data?.task_list_title) {
      setTaskListTitle(data.task_list_title);
    }
  }

  loadTeacherSettings();
}, []);




  // -------------------------------------------------------
  // 2️⃣ FIRST-TIME PIN CHECK (ONLY WHEN DASHBOARD IS UNLOCKED)
  // -------------------------------------------------------
  useEffect(() => {
    async function checkPin() {
      // Only check after teacher unlocks dashboard
      if (!isDashboardUnlocked()) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: teacher, error } = await supabase
        .from("teachers")
        .select("pin_code")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading teacher:", error);
        return;
      }

      // First-time user → send to PIN change screen
      if (teacher?.pin_code === "0000") {
        console.log("First login → PIN = 0000 → redirecting to /change-pin");
        navigate("/change-pin", { replace: true });
      }
    }

    checkPin();
  }, [navigate]);


  useEffect(() => {
  return () => {
    setShowAddStudent(false);
  };
}, []);

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


  // Update Tasks function
async function updateTask(taskId, newTitle, newIcon) {
  const { error } = await supabase
    .from("tasks")
    .update({
      title: newTitle,
      icon: newIcon
    })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
    return;
  }

  setEditTask(null);
  loadTasks();
}

// Modifying title of tasklist
async function saveTaskListTitle(newTitle) {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase
    .from("teachers")
    .update({ task_list_title: newTitle })
    .eq("id", user.id);

  setTaskListTitle(newTitle);
  setShowEditTaskTitle(false);
}


  // ---------- STUDENT ACTIONS ----------
async function addStudent(name) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("students").insert([
    { teacher_id: user.id, student_name: name }
  ]);

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

    setNewTaskTitle("");     // clear field
    setNewTaskIcon("📘");    // reset icon
    loadTasks();             // keep modal open
    // DON'T CLOSE THE MODAL HERE

  }

  async function deleteTask() {
    await supabase.from("tasks").delete().eq("id", deleteTaskId);
    setDeleteTaskId(null);
    loadTasks();
  }

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-white p-6">

     <div className="flex justify-between items-center mb-8">
  <h1 className="text-3xl font-bold">Leerkracht Dashboard</h1>

  <div className="flex gap-3">
    <button
      onClick={() => navigate("/change-pin")}
      className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
    >
      PIN wijzigen
    </button>

    <button
      onClick={() => navigate("/classroom")}
      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
    >
      ← Terug naar klasoverzicht
    </button>
  </div>
</div>


      {/* TWO-COLUMN LAYOUT */}
      <div className="flex gap-8">

        {/* LEFT COLUMN = TASKS (2/3 width) */}
        <div className="w-2/3 bg-white shadow rounded-xl p-6">
          
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    <h2 className="text-xl font-semibold">{taskListTitle}</h2>

    {/* EDIT ICON NEXT TO TITLE */}
    <button
      onClick={() => setShowEditTaskTitle(true)}
      className="text-gray-500 hover:text-gray-700"
    >
      ✏️
    </button>
  </div>

  <button
    onClick={() => setShowAddTask(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    + Nieuwe taken
  </button>
</div>

          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">Nog geen taken toegevoegd.</p>
          ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border cursor-pointer hover:bg-gray-100"
                onClick={() => {
                console.log("EDIT CLICKED", task);
                setEditTask(task);
              }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task.icon || "📘"}</span>
                  <span className="text-gray-800">{task.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();  // prevent edit modal opening
                    setDeleteTaskId(task.id);
                  }}
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
              + Nieuwe leerlingen
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
    onAdd={(name) => {
      addStudent(name);
    }}
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
      {showEditTaskTitle && (
        <EditTaskListTitleModal
          currentTitle={taskListTitle}
          onSave={saveTaskListTitle}
          onClose={() => setShowEditTaskTitle(false)}
        />
      )}



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

      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={(title, icon) => updateTask(editTask.id, title, icon)}
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
