// src/components/dashboard/TopServicosDonut.tsx
import { useMemo } from "react";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { DadosEspecificacao } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface Props {
  especificacoes: DadosEspecificacao[];
}

const COLORS = [
  "hsl(var(--primary))",
  "#10b981", // emerald-500
  "#1764deff", // blue-500
  "#f5ed0bff", // amber-500
  "#541bd9ff", // violet-500
  "#ec4899", // pink-500
];

export function TopServicosDonut({ especificacoes }: Props) {
  // Transforma os dados para ter o total de cada serviço isolado.
  // Ignoramos linhas que funcionam como totais ou subtotais agrupados no Boletim
  const chartData = useMemo(() => {
    // Filtramos nomes que não são serviços concretos
    const specsToUse = especificacoes.filter(e =>
      !e.tipoServico.toLowerCase().includes("valor total da medição") &&
      !e.tipoServico.toLowerCase().includes("valor total geral") &&
      e.total > 0
    );

    const totalEspec = specsToUse.reduce((acc, curr) => acc + curr.total, 0);

    return specsToUse.map((spec) => ({
      name: spec.tipoServico,
      value: spec.total,
      percentStr: formatPercent(spec.total / totalEspec)
    })).sort((a, b) => b.value - a.value); // Ordenar do maior pro menor
  }, [especificacoes]);

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col border-border/60 h-full w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Proporção por Serviço</CardTitle>
          <CardDescription>Sem dados disponíveis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col border-border/60 w-full shadow-md h-auto min-h-[700px]">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base text-foreground">Proporção das Especificações</CardTitle>
        <CardDescription>Resumo dos valores totais por tipo principal</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 w-full pt-4 pb-6" style={{ minHeight: 700 }}>
        <ResponsiveContainer width="100%" height={650} debounce={100}>
          <PieChart margin={{ top: 0, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={148}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry, index) => {
                // Se for a categoria específica, usa vermelho (#ef4444), senão usa a cor da paleta
                const color = entry.name.trim() === "Emergenciais (Booss) - Obras"
                  ? "#ef4444"
                  : COLORS[index % COLORS.length];

                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover text-popover-foreground rounded-lg border shadow-sm p-3 text-sm max-w-[280px]">
                      <div className="flex items-start gap-2 max-w-full overflow-hidden">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: payload[0].payload.fill }}
                        />
                        <p className="font-semibold text-xs leading-tight whitespace-normal break-words">
                          {data.name}
                        </p>
                      </div>
                      <div className="mt-2 pl-5 flex justify-between gap-4 font-medium border-t border-border pt-2">
                        <span>Valor:</span>
                        <span>{formatCurrency(data.value)}</span>
                      </div>
                      <div className="pl-5 flex justify-between gap-4 text-xs text-muted-foreground mt-0.5">
                        <span>% do Total (Especificações):</span>
                        <span>{data.percentStr}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Legenda Profissional sem scroll, exibindo valores e porcentagens em grid */}
            <Legend
              verticalAlign="bottom"
              content={(props) => {
                const { payload } = props;
                if (!payload) return null;
                return (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                    {payload.map((entry, index) => {
                      const itemData = chartData.find(d => d.name === entry.value);
                      return (
                        <li key={`item-${index}`} className="flex items-start gap-2.5">
                          <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: entry.color }} />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-semibold text-foreground text-xs leading-snug break-words">
                              {entry.value}
                            </span>
                            {itemData && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-blue-500/40 to-indigo-500/40 border border-blue-400/20 backdrop-blur-sm w-fit shadow-sm">
                                <span className="font-bold text-white text-[11px] tracking-wide">
                                  {formatCurrency(itemData.value)}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/50" />
                                <span className="text-white font-bold text-[10px]">
                                  {itemData.percentStr}
                                </span>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
