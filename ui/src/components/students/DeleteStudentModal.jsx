export default function DeleteStudentModal({ onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Delete Student?</h2>

        <p className="mb-4 text-gray-700">
          Ben je zeker dat je deze leerling wilt verijwderen?
        </p>

        <button
          onClick={onConfirm}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 mb-2"
        >
          Verwijder
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
