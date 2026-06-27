export function SummaryBadge({
  color,
  value,
  label,
}: {
  color: "emerald" | "amber" | "red" | "gray";
  value: number | string;
  label: string;
}) {
  const colors = {
    emerald: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
    amber: "bg-amber-900/30 text-amber-300 border-amber-800",
    red: "bg-red-900/30 text-red-300 border-red-800",
    gray: "bg-gray-800 text-gray-400 border-gray-700",
  };

  return (
    <div
      className={`${colors[color]} px-3 py-1.5 rounded-md border flex flex-col justify-center items-center min-w-[70px]`}
    >
      <span className="font-bold text-lg">{value}</span>
      <span>{label}</span>
    </div>
  );
}
