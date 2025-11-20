export default function StudentList({ students, onDelete }) {
  if (!students || students.length === 0) {
    return (
      <p className="text-gray-500 italic">No students yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {students.map((student) => (
        <div
          key={student.id}
          className="flex justify-between items-center p-3 border rounded bg-gray-50"
        >
          <span>{student.student_name}</span>

          <button
            onClick={() => onDelete(student.id)}
            className="text-red-600 hover:text-red-800"
          >
            Verwijder
          </button>
        </div>
      ))}
    </div>
  );
}
