export default function DeleteTaskModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Delete Task?</h2>

        <p className="mb-4 text-gray-700">
          Are you sure you want to delete this task?
        </p>

        <button
          onClick={onConfirm}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 mb-2"
        >
          Delete
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
