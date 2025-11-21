const ICONS = [
  "📘", "✏️", "🧮", "📚", "📝",
  "🔬", "🌍", "🎨", "🎵", "🧪",
  "💡", "🔢", "📐", "📊", "🔭",
];

export default function TaskIconPicker({ selectedIcon, onSelect }) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onSelect(icon)}
          className={`text-3xl p-2 rounded-lg border 
            ${selectedIcon === icon ? "bg-blue-100 border-blue-500" : "bg-gray-100"}
            hover:bg-blue-50`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
