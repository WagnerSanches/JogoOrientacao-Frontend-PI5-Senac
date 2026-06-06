const TEAM1 = ["CLARO", "REY"];
const TEAM2 = ["KARIN", "BEATRIZ"];

const LEVEL_LABELS = {
  0: "CALOURO",
  1: "1º ANO",
  2: "2º ANO",
  3: "3º ANO",
  4: "4º ANO",
};

export function Cell({ cell }) {
  const hasProfessor = Boolean(cell.professor);
  const isTeam1 = TEAM1.includes(cell.professor);
  const isTeam2 = TEAM2.includes(cell.professor);

  const cellBg = isTeam1
    ? "bg-blue-400 border-blue-500 shadow-blue-100"
    : isTeam2
    ? "bg-rose-400 border-rose-500 shadow-rose-100"
    : "bg-white border-gray-200";

  const levelColor = hasProfessor ? "text-white/80" : "text-gray-400";

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 aspect-square shadow-sm transition-all ${cellBg}`}
    >
      <span
        className={`text-[10px] font-semibold tracking-wide uppercase ${levelColor}`}
      >
        {LEVEL_LABELS[cell.level] ?? `Nv ${cell.level}`}
      </span>
      {hasProfessor && (
        <span className="mt-1 px-2 py-0.5 bg-white/20 rounded-full text-white text-[11px] font-bold tracking-wide">
          {cell.professor}
        </span>
      )}
    </div>
  );
}
