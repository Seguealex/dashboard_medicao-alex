import type { OrdemServico } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

interface KPICardsProps {
  data: OrdemServico[];
}

export function KPICards({ data }: KPICardsProps) {
  const total = data.length;
  const byStatus = {
    APPR: data.filter((d) => d.status === "APPR").length,
    COMP: data.filter((d) => d.status === "COMP").length,
    // both INPRG and WSCH are now labeled "Aguardando Planejamento"; combine them
    INPRG: data.filter((d) => d.status === "INPRG" || d.status === "WSCH").length,
  };

  const cards = [
    { label: "Total de Ordens", value: total, color: "text-primary", borderColor: "border-l-primary" },
    { label: STATUS_LABELS.APPR, value: byStatus.APPR, color: "text-primary", borderColor: "border-l-primary" },
    { label: STATUS_LABELS.INPRG, value: byStatus.INPRG, color: "text-accent", borderColor: "border-l-accent" },
    { label: STATUS_LABELS.COMP, value: byStatus.COMP, color: "text-kpi-green", borderColor: "border-l-kpi-green" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`kpi-card border-l-4 ${card.borderColor} animate-fade-in`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {card.label}
          </p>
          <p className={`text-3xl font-bold ${card.color} animate-count-up tabular-nums`}>
            {card.value.toLocaleString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}
