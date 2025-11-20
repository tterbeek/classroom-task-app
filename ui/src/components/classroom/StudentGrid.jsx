export default function StudentGrid({ students, onSelect, progress = {}, totalTasks = 0 }) {
  function getTileColor(completed) {
    if (totalTasks === 0) return "bg-gray-100";      // No tasks
    if (completed === 0) return "bg-gray-100";       // Not started → grey
    if (completed < totalTasks) return "bg-orange-100"; // In progress
    return "bg-green-100";                           // Completed
  }

  function getBorderColor(completed) {
    if (totalTasks === 0) return "border-gray-300";
    if (completed === 0) return "border-gray-300";   // Not started → grey border
    if (completed < totalTasks) return "border-orange-300";
    return "border-green-300";
  }

  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {students.map((student) => {
        const completed = progress[student.id] || 0;

        return (
          <button
            key={student.id}
            onClick={() => onSelect(student)}
            className={
              `p-4 rounded-xl shadow flex flex-col items-center transition ` +
              `${getTileColor(completed)} ` +
              `${getBorderColor(completed)} border`
            }
          >
            {/* Student name */}
            <span className="text-2xl font-semibold mb-2">
              {student.student_name}
            </span>

            {/* Progress text (Dutch) */}
            {totalTasks > 0 ? (
              <span className="text-lg text-gray-700 font-medium">
                {completed} / {totalTasks} klaar
              </span>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Geen taken
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
