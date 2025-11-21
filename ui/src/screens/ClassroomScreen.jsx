import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import StudentGrid from "../components/classroom/StudentGrid";
import StudentTaskModal from "../components/classroom/StudentTaskModal";
import NewTeacherWelcomeModal from "../components/NewTeacherWelcomeModal"; 


export default function ClassroomScreen() {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [progress, setProgress] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const [taskListTitle, setTaskListTitle] = useState("Taken van vandaag");


  useEffect(() => {
    loadStudents();
    loadTasks();
    loadProgress();
  }, []);

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

    if (data) setStudents(data);
  }

useEffect(() => {
    async function checkTeacherPin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: teacher } = await supabase
        .from("teachers")
        .select("pin_code")
        .eq("id", user.id)
        .single();

      // If first-time user → show welcome modal
      if (teacher?.pin_code === "0000") {
        setShowWelcome(true);
      }
    }

    checkTeacherPin();
  }, []);

  // loading tasklisttitle
useEffect(() => {
  async function loadTitle() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("teachers")
      .select("task_list_title")
      .eq("id", user.id)
      .single();

    if (data?.task_list_title) {
      setTaskListTitle(data.task_list_title);
    }
  }
  loadTitle();
}, []);


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

    if (data) setTasks(data);
  }

  function openTeacherDashboard() {
    navigate("/pin");
  }

  function openStudentTasks(student) {
    setActiveStudent(student);
  }

async function loadProgress() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Load all task statuses for this teacher's students
  const { data: statuses } = await supabase
    .from("task_status")
    .select("*");

  const progressMap = {}; // studentId → completed count

  statuses?.forEach((s) => {
    if (!progressMap[s.student_id]) progressMap[s.student_id] = 0;
    if (s.completed) progressMap[s.student_id]++;
  });

  setProgress(progressMap);
}

function closeModal() {
  setActiveStudent(null);
  loadProgress(); // refresh progress after changes
}


  
  return (
  <div className="min-h-screen bg-white p-6 relative">

    {/* 🔧 Gear icon — move outside the columns, top-right of page */}
    <button
      onClick={openTeacherDashboard}
      className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full shadow hover:bg-gray-200 z-50"
    >
      <Cog6ToothIcon className="h-7 w-7 text-gray-700" />
    </button>
    {/* 2-column layout */}
    <div className="flex gap-8 mt-4 items-start">

      {/* LEFT COLUMN — STUDENTS */}
      <div className="w-2/3">
        <StudentGrid
          students={students}
          onSelect={openStudentTasks}
          progress={progress}
          totalTasks={tasks.length}
        />
      </div>

      {/* RIGHT COLUMN — TASKS */}
      <div className="w-1/3 bg-gray-50 border rounded-xl p-6 shadow">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {taskListTitle}
      </h2>

        {tasks.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            Er zijn nog geen taken toegevoegd.
          </p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="p-4 bg-white border rounded-xl text-lg shadow flex items-center gap-3"
              >
                <span className="text-2xl">{t.icon}</span>
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>

{showWelcome && (
  <NewTeacherWelcomeModal onClose={() => setShowWelcome(false)} />
)}

    {/* Student Task Modal */}
    {activeStudent && (
      <StudentTaskModal
        student={activeStudent}
        onClose={closeModal}
      />
    )}
  </div>
);

}
