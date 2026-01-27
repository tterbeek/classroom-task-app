import { useCallback, useEffect, useState } from "react";
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
  const [optionalCompleted, setOptionalCompleted] = useState({});
  const [totalTasksByStudent, setTotalTasksByStudent] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const [taskListTitle, setTaskListTitle] = useState("Taken van vandaag");
  const [tasksVisibleOnHome, setTasksVisibleOnHome] = useState(true);


  useEffect(() => {
    loadStudents();
    loadTasks();
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
    if (!user) return;

    const { data } = await supabase
      .from("teachers")
      .select("task_list_title, tasks_visible_on_home")
      .eq("id", user.id)
      .single();

    if (data?.task_list_title) {
      setTaskListTitle(data.task_list_title);
    }

    if (data?.tasks_visible_on_home !== undefined && data?.tasks_visible_on_home !== null) {
      setTasksVisibleOnHome(data.tasks_visible_on_home);
    } else {
      setTasksVisibleOnHome(true);
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

const loadProgress = useCallback(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  if (students.length === 0) {
    setProgress({});
    setOptionalCompleted({});
    setTotalTasksByStudent({});
    return;
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const requiredTaskIds = new Set(
    tasks.filter((task) => task.priority !== "optional").map((task) => task.id)
  );
  const allTaskIds = new Set(
    tasks.filter((task) => task.audience !== "targeted").map((task) => task.id)
  );

  const { data: groupRows } = await supabase
    .from("groups")
    .select("id")
    .eq("teacher_id", user.id);

  const groupIds = (groupRows || []).map((row) => row.id);

  let groupStudents = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("group_students")
      .select("group_id, student_id")
      .in("group_id", groupIds);
    groupStudents = data || [];
  }

  const studentGroupsMap = new Map();
  groupStudents.forEach((row) => {
    if (!studentGroupsMap.has(row.student_id)) {
      studentGroupsMap.set(row.student_id, new Set());
    }
    studentGroupsMap.get(row.student_id).add(row.group_id);
  });

  let assignmentRows = [];
  if (tasks.length > 0) {
    const taskIds = tasks.map((task) => task.id);
    const { data } = await supabase
      .from("task_assignments")
      .select("task_id, group_id")
      .in("task_id", taskIds);
    assignmentRows = data || [];
  }

  const assignmentsByGroup = new Map();

  assignmentRows.forEach((row) => {
    if (row.group_id) {
      if (!assignmentsByGroup.has(row.group_id)) {
        assignmentsByGroup.set(row.group_id, new Set());
      }
      assignmentsByGroup.get(row.group_id).add(row.task_id);
    }
  });

  const visibleTasksByStudent = new Map();
  const totalTasksMap = {};

  students.forEach((student) => {
    const visible = new Set(allTaskIds);

    const studentGroups = studentGroupsMap.get(student.id);
    if (studentGroups) {
      studentGroups.forEach((groupId) => {
        const groupTasks = assignmentsByGroup.get(groupId);
        if (!groupTasks) return;
        groupTasks.forEach((taskId) => {
          if (taskById.get(taskId)?.audience === "targeted") {
            visible.add(taskId);
          }
        });
      });
    }

    let requiredCount = 0;
    visible.forEach((taskId) => {
      if (requiredTaskIds.has(taskId)) requiredCount++;
    });

    visibleTasksByStudent.set(student.id, visible);
    totalTasksMap[student.id] = requiredCount;
  });

  const studentIds = students.map((student) => student.id);
  const taskIds = tasks.map((task) => task.id);

  let statusRows = [];
  if (studentIds.length > 0 && taskIds.length > 0) {
    const { data } = await supabase
      .from("task_status")
      .select("student_id, task_id, completed")
      .in("student_id", studentIds)
      .in("task_id", taskIds);
    statusRows = data || [];
  }

  const progressMap = {}; // studentId → completed required count
  const optionalMap = {}; // studentId → completed optional task

  statusRows.forEach((row) => {
    if (!row.completed) return;

    const visible = visibleTasksByStudent.get(row.student_id);
    if (!visible || !visible.has(row.task_id)) return;

    const task = taskById.get(row.task_id);
    if (!task) return;

    if (task.priority === "optional") {
      optionalMap[row.student_id] = true;
    } else {
      progressMap[row.student_id] = (progressMap[row.student_id] || 0) + 1;
    }
  });

  setProgress(progressMap);
  setOptionalCompleted(optionalMap);
  setTotalTasksByStudent(totalTasksMap);
}, [students, tasks]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

function closeModal() {
  setActiveStudent(null);
  loadProgress(); // refresh progress after changes
}


  
  const classTasks = tasks.filter((task) => task.audience !== "targeted");

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
      <div className={tasksVisibleOnHome ? "w-2/3" : "w-full"}>
        <StudentGrid
          students={students}
          onSelect={openStudentTasks}
          progress={progress}
          totalTasksByStudent={totalTasksByStudent}
          optionalCompleted={optionalCompleted}
        />
      </div>

      {/* RIGHT COLUMN — TASKS */}
      {tasksVisibleOnHome && (
        <div className="w-1/3 bg-gray-50 border rounded-xl p-6 shadow">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {taskListTitle}
        </h2>

          {classTasks.length === 0 ? (
            <p className="text-gray-500 italic text-center">
              Er zijn nog geen taken toegevoegd.
            </p>
          ) : (
            <ul className="space-y-3">
              {[...classTasks]
                .sort((a, b) => (a.priority === "optional") - (b.priority === "optional"))
                .map((t) => (
                <li
                  key={t.id}
                  className={`p-4 rounded-xl border text-lg shadow flex items-center gap-3 ${
                    t.priority === "optional"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{t.icon || "📘"}</span>
                    <span>{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.samenwerken && (
                      <span className="text-lg" title="Samenwerken">
                        🤝
                      </span>
                    )}
                    {t.zelf_nakijken && (
                      <span className="text-lg" title="Zelf nakijken">
                        🔑
                      </span>
                    )}
                    {t.priority === "optional" && (
                      <span className="text-xs bg-gray-300 px-2 py-1 rounded-full">
                        magje
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
