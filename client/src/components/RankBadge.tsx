import { Badge } from "@/components/ui/badge";

const RANK_COLORS: Record<string, string> = {
  "Kurucu": "bg-red-950 text-red-400 border-red-900/50",
  "Başlider": "bg-orange-950 text-orange-400 border-orange-900/50",
  "Pençe": "bg-purple-950 text-purple-400 border-purple-900/50",
  "Nöbetçi": "bg-blue-950 text-blue-400 border-blue-900/50",
  "Sangur": "bg-cyan-950 text-cyan-400 border-cyan-900/50",
  "Çeri": "bg-zinc-800 text-zinc-300 border-zinc-700/50",
  "Aday": "bg-zinc-900 text-zinc-500 border-zinc-800/50",
};

export function RankBadge({ rank }: { rank: string | null }) {
  const normalizedRank = rank || "Aday";
  const colorClass = RANK_COLORS[normalizedRank] || RANK_COLORS["Aday"];

  return (
    <Badge 
      variant="outline" 
      className={`font-mono text-[10px] tracking-wider uppercase rounded-sm px-2 py-0.5 ${colorClass}`}
    >
      {normalizedRank}
    </Badge>
  );
}
