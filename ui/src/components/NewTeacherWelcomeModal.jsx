export default function NewTeacherWelcomeModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold mb-4 text-center">
          Welkom bij zelfstandig werken in de klas!
        </h2>

        <p className="text-gray-700 leading-relaxed mb-4">
          Je account is succesvol aangemaakt.  
          Je kan <strong>onmiddellijk starten in de klas</strong> met het beheren
          van zelfstandige werktaken in de klas.
        </p>

        <p className="text-gray-700 leading-relaxed mb-4">
          Klik rechtsboven op het <strong>tandwiel icoontje</strong> om het
          leerkrachtgedeelte te openen.  
          Gebruik de <strong>PIN-code 0000</strong> om toegang te krijgen.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          In het leerkracht dashboard kan je vervolgens:
        </p>

        <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-6">
          <li>Leerlingen toevoegen</li>
          <li>Taken instellen</li>
          <li>Taken voorzien van icoontjes</li>
          <li>Alles klaarzetten voor je klas</li>
        </ul>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Begrijp ik!
          </button>
        </div>
      </div>
    </div>
  );
}
