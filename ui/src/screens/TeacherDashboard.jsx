import { isDashboardUnlocked } from "../auth/DashboardLock";
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import supabase from "../supabaseClient";
import EditTaskListTitleModal from "../components/tasks/EditTaskListTitleModal";

// Student components
import StudentList from "../components/students/StudentList";
import AddStudentModal from "../components/students/AddStudentModal";
import DeleteStudentModal from "../components/students/DeleteStudentModal";
import EditTaskModal from "../components/tasks/EditTaskModal";
import AddGroupModal from "../components/groups/AddGroupModal";
import EditGroupModal from "../components/groups/EditGroupModal";
import DeleteGroupModal from "../components/groups/DeleteGroupModal";

// Task components
import AddTaskModal from "../components/tasks/AddTaskModal";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";



export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editTask, setEditTask] = useState(null); // holds task being edited
  const [editGroup, setEditGroup] = useState(null);

  const [taskListTitle, setTaskListTitle] = useState("Taken van vandaag");
  const [tasksVisibleOnHome, setTasksVisibleOnHome] = useState(true);
  const [showEditTaskTitle, setShowEditTaskTitle] = useState(false);


  const [showAddStudent, setShowAddStudent] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState("📘");
  const [newTaskPriority, setNewTaskPriority] = useState("required");
  const [newTaskSamenwerken, setNewTaskSamenwerken] = useState(false);
  const [newTaskZelfNakijken, setNewTaskZelfNakijken] = useState(false);
  const [newTaskAudience, setNewTaskAudience] = useState("all");
  const [newTaskGroupIds, setNewTaskGroupIds] = useState([]);

  const [editTaskAudience, setEditTaskAudience] = useState("all");
  const [editTaskGroupIds, setEditTaskGroupIds] = useState([]);
  const [taskAssignmentsByTaskId, setTaskAssignmentsByTaskId] = useState({});

  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  loadTeacherSettings();
}, []);

async function resetAllTaskStatuses() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Delete all task_status entries belonging to this teacher
  const { error } = await supabase
    .from("task_status")
    .delete()
    .in(
      "task_id",
      tasks.map((t) => t.id)
    );

  if (error) {
    console.error("Error resetting task progress:", error);
    alert("Er ging iets mis.");
    return;
  }


}



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
  const loadStudents = useCallback(async () => {
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
  }, []);

  const loadGroups = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    setGroups(data || []);
  }, []);

  const loadTaskAssignmentsForList = useCallback(async (taskRows) => {
    if (!taskRows || taskRows.length === 0) {
      setTaskAssignmentsByTaskId({});
      return;
    }

    const taskIds = taskRows.map((task) => task.id);
    const { data, error } = await supabase
      .from("task_assignments")
      .select("task_id, group_id")
      .in("task_id", taskIds);

    if (error) {
      console.error("Error loading task assignments:", error);
      return;
    }

    const map = {};
    (data || []).forEach((row) => {
      if (!row.group_id) return;
      if (!map[row.task_id]) map[row.task_id] = [];
      map[row.task_id].push(row.group_id);
    });

    setTaskAssignmentsByTaskId(map);
  }, []);

  const loadTasks = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: true });

    const taskRows = data || [];
    setTasks(taskRows);
    loadTaskAssignmentsForList(taskRows);
  }, [loadTaskAssignmentsForList]);

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadTasks();
  }, [loadGroups, loadStudents, loadTasks]);

  const loadTaskAssignments = useCallback(async (taskId) => {
    const { data, error } = await supabase
      .from("task_assignments")
      .select("group_id")
      .eq("task_id", taskId);

    if (error) {
      console.error("Error loading task assignments:", error);
      return;
    }

    const groupIds = [];

    (data || []).forEach((row) => {
      if (row.group_id) groupIds.push(row.group_id);
    });

    setEditTaskGroupIds(groupIds);
  }, []);

  useEffect(() => {
    if (!editTask) {
      setEditTaskAudience("all");
      setEditTaskGroupIds([]);
      return;
    }

    setEditTaskAudience(editTask.audience || "all");
    setEditTaskGroupIds([]);
    loadTaskAssignments(editTask.id);
  }, [editTask, loadTaskAssignments]);


  // Update Tasks function
async function updateTask(
  taskId,
  newTitle,
  newIcon,
  newPriority,
  newAudience,
  groupIds,
  samenwerken,
  zelfNakijken
) {
  const hasTargets = groupIds.length > 0;
  const audience =
    newAudience === "targeted" && hasTargets ? "targeted" : "all";

  const { error } = await supabase
    .from("tasks")
    .update({
      title: newTitle,
      icon: newIcon,
      priority: newPriority,
      audience,
      samenwerken,
      zelf_nakijken: zelfNakijken,
    })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
    return;
  }

  const { error: deleteError } = await supabase
    .from("task_assignments")
    .delete()
    .eq("task_id", taskId);

  if (deleteError) {
    console.error("Error clearing task assignments:", deleteError);
    return;
  }

  if (audience === "targeted") {
    const assignments = [
      ...groupIds.map((groupId) => ({
        task_id: taskId,
        group_id: groupId,
      })),
    ];

    if (assignments.length > 0) {
      const { error: assignmentError } = await supabase
        .from("task_assignments")
        .insert(assignments);

      if (assignmentError) {
        console.error("Error updating task assignments:", assignmentError);
      }
    }
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

async function toggleTasksVisibleOnHome(event) {
  const { checked } = event.target;
  setTasksVisibleOnHome(checked);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("teachers")
    .update({ tasks_visible_on_home: checked })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating tasks visibility:", error);
    setTasksVisibleOnHome(!checked); // revert on error
    alert("Kon zichtbaarheid niet opslaan.");
  }
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

    const hasTargets = newTaskGroupIds.length > 0;
    const audience =
      newTaskAudience === "targeted" && hasTargets ? "targeted" : "all";

    const { data: createdTask, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: newTaskTitle,
          icon: newTaskIcon,
          priority: newTaskPriority,
          samenwerken: newTaskSamenwerken,
          zelf_nakijken: newTaskZelfNakijken,
          audience,
          teacher_id: user.id,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (audience === "targeted" && createdTask?.id) {
      const assignments = [
        ...newTaskGroupIds.map((groupId) => ({
          task_id: createdTask.id,
          group_id: groupId,
        })),
      ];

      if (assignments.length > 0) {
        const { error: assignmentError } = await supabase
          .from("task_assignments")
          .insert(assignments);

        if (assignmentError) {
          console.error("Error creating task assignments:", assignmentError);
        }
      }
    }

    setNewTaskTitle("");     // clear field
    setNewTaskIcon("📘");    // reset icon
    setNewTaskPriority("required");
    setNewTaskSamenwerken(false);
    setNewTaskZelfNakijken(false);
    setNewTaskAudience("all");
    setNewTaskGroupIds([]);
    loadTasks();             // keep modal open
    // DON'T CLOSE THE MODAL HERE

  }

  async function deleteTask() {
    await supabase.from("tasks").delete().eq("id", deleteTaskId);
    setDeleteTaskId(null);
    loadTasks();
  }

  async function deleteGroup() {
    await supabase.from("groups").delete().eq("id", deleteGroupId);
    setDeleteGroupId(null);
    loadGroups();
  }

  // ---------- UI ----------
  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

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

  {/* LEFT SIDE — title + edit icon */}
  <div className="flex items-center gap-3">
    <h2 className="text-xl font-semibold">{taskListTitle}</h2>

    {/* EDIT TITLE ICON */}
    <button
      onClick={() => setShowEditTaskTitle(true)}
      className="text-gray-500 hover:text-gray-700"
      title="Titel aanpassen"
    >
      ✏️
    </button>
  </div>

  {/* RIGHT SIDE — new task + reset icon */}
  <div className="flex items-center gap-3">

    {/* SHOW TASKS ON CLASSROOM HOME */}
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={tasksVisibleOnHome}
        onChange={toggleTasksVisibleOnHome}
        className="h-4 w-4"
      />
      <span>Toon in klasoverzicht</span>
    </label>

    {/* RESET ALL TASK COMPLETIONS */}
      <button
    onClick={() => setShowResetConfirm(true)}
    className="text-red-500 hover:text-red-700 text-xl"
    title="Reset alle voortgang"
  >
    ⟲
  </button>

    {/* ADD TASK BUTTON */}
    <button
      onClick={() => setShowAddTask(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      + Nieuwe taken
    </button>
  </div>

</div>

          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">Nog geen taken toegevoegd.</p>
          ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Verplicht
              </h3>
              <ul className="space-y-2">
                {tasks
                  .filter((task) => task.priority !== "optional")
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        console.log("EDIT CLICKED", task);
                        setEditTask(task);
                      }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-2xl">{task.icon || "📘"}</span>
                        <span className="text-gray-800">{task.title}</span>
                        {task.audience === "targeted" &&
                          (taskAssignmentsByTaskId[task.id] || [])
                            .map((groupId) => ({
                              id: groupId,
                              name: groupNameById.get(groupId),
                            }))
                            .filter((group) => group.name)
                            .map((group) => (
                              <span
                                key={group.id}
                                className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                              >
                                {group.name}
                              </span>
                            ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {task.samenwerken && (
                          <span className="text-lg" title="Samenwerken">
                            🤝
                          </span>
                        )}
                        {task.zelf_nakijken && (
                          <span className="text-lg" title="Zelf nakijken">
                            🔑
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent edit modal opening
                            setDeleteTaskId(task.id);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Verwijder
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Extra
              </h3>
              <ul className="space-y-2">
                {tasks
                  .filter((task) => task.priority === "optional")
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        console.log("EDIT CLICKED", task);
                        setEditTask(task);
                      }}
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-2xl">{task.icon || "📘"}</span>
                        <span className="text-gray-800">{task.title}</span>
                        {task.audience === "targeted" &&
                          (taskAssignmentsByTaskId[task.id] || [])
                            .map((groupId) => ({
                              id: groupId,
                              name: groupNameById.get(groupId),
                            }))
                            .filter((group) => group.name)
                            .map((group) => (
                              <span
                                key={group.id}
                                className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                              >
                                {group.name}
                              </span>
                            ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {task.samenwerken && (
                          <span className="text-lg" title="Samenwerken">
                            🤝
                          </span>
                        )}
                        {task.zelf_nakijken && (
                          <span className="text-lg" title="Zelf nakijken">
                            🔑
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent edit modal opening
                            setDeleteTaskId(task.id);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Verwijder
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

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

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Groepen</h3>
              <button
                type="button"
                onClick={() => setShowAddGroup(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Nieuwe groep
              </button>
            </div>

            {groups.length === 0 ? (
              <p className="text-gray-500 italic">Nog geen groepen.</p>
            ) : (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 border-gray-200 cursor-pointer"
                    onClick={() => setEditGroup(group)}
                  >
                    <span>{group.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteGroupId(group.id);
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

      {deleteGroupId && (
        <DeleteGroupModal
          onConfirm={deleteGroup}
          onClose={() => setDeleteGroupId(null)}
        />
      )}

      {showAddGroup && (
        <AddGroupModal
          students={students}
          onClose={() => setShowAddGroup(false)}
          onSaved={() => {
            setShowAddGroup(false);
            loadGroups();
          }}
        />
      )}

      {editGroup && (
        <EditGroupModal
          group={editGroup}
          students={students}
          onClose={() => setEditGroup(null)}
          onSaved={() => {
            setEditGroup(null);
            loadGroups();
          }}
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

{showResetConfirm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
      <h2 className="text-xl font-bold mb-4">
        Alle voortgang terugzetten?
      </h2>

      <p className="text-gray-600 mb-6">
        Dit verwijdert alle afgevinkte taken voor elke leerling. 
        Weet je het zeker?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowResetConfirm(false)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Annuleren
        </button>

        <button
          onClick={async () => {
            await resetAllTaskStatuses();
            setShowResetConfirm(false);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
)}


      {showAddTask && (
        <AddTaskModal
          title={newTaskTitle}
          setTitle={setNewTaskTitle}
          selectedIcon={newTaskIcon}
          setSelectedIcon={setNewTaskIcon}
          priority={newTaskPriority}
          setPriority={setNewTaskPriority}
          samenwerken={newTaskSamenwerken}
          setSamenwerken={setNewTaskSamenwerken}
          zelfNakijken={newTaskZelfNakijken}
          setZelfNakijken={setNewTaskZelfNakijken}
          audience={newTaskAudience}
          setAudience={setNewTaskAudience}
          groups={groups}
          selectedGroupIds={newTaskGroupIds}
          setSelectedGroupIds={setNewTaskGroupIds}
          onAdd={addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          audience={editTaskAudience}
          setAudience={setEditTaskAudience}
          groups={groups}
          selectedGroupIds={editTaskGroupIds}
          setSelectedGroupIds={setEditTaskGroupIds}
          onClose={() => setEditTask(null)}
          onSave={(
            title,
            icon,
            priority,
            audience,
            groupIds,
            samenwerken,
            zelfNakijken
          ) =>
            updateTask(
              editTask.id,
              title,
              icon,
              priority,
              audience,
              groupIds,
              samenwerken,
              zelfNakijken
            )
          }
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
