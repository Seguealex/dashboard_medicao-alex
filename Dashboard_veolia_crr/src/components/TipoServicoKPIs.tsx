import { useMemo } from "react";
import type { OrdemServico } from "@/lib/types";
import { STATUS_LABELS, TIPO_SERVICO_LABELS } from "@/lib/types";

interface TipoServicoKPIsProps {
  data: OrdemServico[];
}

export function TipoServicoKPIs({ data }: TipoServicoKPIsProps) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => {
      map[d.tipoServico] = (map[d.tipoServico] || 0) + 1;
    });
    return map;
  }, [data]);

  const items = [
    { code: "CM", color: "border-l-destructive" },
    { code: "PM", color: "border-l-accent" },
    { code: "PRJ", color: "border-l-kpi-purple" },
    { code: "OTHER", color: "border-l-kpi-orange" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={item.code}
          className={`kpi-card border-l-4 ${item.color} animate-fade-in`}
          style={{ animationDelay: `${(i + 4) * 80}ms` }}
        >
          <span className="text-xs text-muted-foreground font-medium">
            {TIPO_SERVICO_LABELS[item.code as keyof typeof TIPO_SERVICO_LABELS]}
          </span>
          <p className="text-2xl font-bold text-foreground mt-1">
            {(counts[item.code] || 0).toLocaleString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}
