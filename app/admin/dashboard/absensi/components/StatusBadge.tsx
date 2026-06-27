export function StatusBadge({
  color,
  label,
}: {
  color: "amber" | "red" | "blue" | "purple";
  label: string;
}) {
  const colors = {
    amber: "text-amber-400 bg-amber-900/30",
    red: "text-red-400 bg-red-900/30",
    blue: "text-blue-300 bg-blue-900/30",
    purple: "text-purple-300 bg-purple-900/30",
  };
  return (
    <span
      className={`${colors[color]} text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-medium`}
    >
      {label}
    </span>
  );
}
