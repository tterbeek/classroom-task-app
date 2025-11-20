export default function AddTaskModal({ title, setTitle, onAdd, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Add New Task</h2>

        <input
          type="text"
          placeholder="Task title"
          className="w-full p-2 border rounded mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          onClick={onAdd}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 mb-2"
        >
          Add Task
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
