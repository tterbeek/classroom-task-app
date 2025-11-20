export default function TaskList({ tasks, onDelete }) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-gray-500 italic">No tasks yet.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex justify-between items-center p-3 border rounded bg-gray-50"
        >
          <span>{task.title}</span>

          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
