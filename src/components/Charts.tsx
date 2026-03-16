import { useMemo, useState, useEffect } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import type { OrdemServico } from "@/lib/types";
import { TIPO_SERVICO_LABELS, STATUS_LABELS, STATUS_COLORS, TIPO_SERVICO_COLORS } from "@/lib/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area
} from "recharts";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

interface ChartsProps {
  data: OrdemServico[];
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  color: "#1f2937",
  fontSize: "13px",
};

import { useNavigate } from "react-router-dom";

export function ChartBarTipoServico({ data }: ChartsProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const label = TIPO_SERVICO_LABELS[d.tipoServico] || d.tipoServico;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const colors = Object.values(TIPO_SERVICO_COLORS);

  const handleBarClick = (entry: any) => {
    // entry.name é o label ("Manutenção Corretiva"). Vamos achar o código ("CM").
    const tipoEntry = Object.entries(TIPO_SERVICO_LABELS).find(([_, label]) => label === entry.name);
    if (tipoEntry) {
      navigate(`/ordens?tipo=${tipoEntry[0]}`);
    } else {
      navigate("/ordens");
    }
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
        Ordens por Tipo de Serviço
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 22%)" />
          <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} width={isMobile ? 25 : 40} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(222, 20%, 22%)", opacity: 0.2 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} onClick={handleBarClick}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={colors[i % colors.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartPieStatus({ data }: ChartsProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const label = STATUS_LABELS[d.status] || d.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const colors = Object.values(STATUS_COLORS);
  const outerRadius = isMobile ? 70 : 100;
  const innerRadius = isMobile ? 40 : 60;

  const handlePieClick = (entry: any) => {
    // entry.name é o label ("Aprovada", "Concluída", etc)
    const statusEntry = Object.entries(STATUS_LABELS).find(([_, label]) => label === entry.name);
    if (statusEntry) {
      navigate(`/ordens?status=${statusEntry[0]}`);
    } else {
      navigate("/ordens");
    }
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
        Ordens por Status
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            onClick={handlePieClick}
            label={isMobile
              ? ({ percent }) => `${(percent * 100).toFixed(0)}%`
              : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={!isMobile}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={colors[i % colors.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: isMobile ? "11px" : "12px", color: "hsl(215, 15%, 55%)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartLineByMonth({ data }: ChartsProps) {
  const [viewMode, setViewMode] = useState<"mensal" | "anual">("mensal");
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    const counts: Record<string, { total: number; proximas: number }> = {};
    const today = new Date();

    // Só ordens não concluídas (COMP = já finalizado; não entra no gráfico)
    data.forEach((d) => {
      if (d.status === "COMP") return;
      if (!d.inicioPrevisto) return;
      const date = parseISO(d.inicioPrevisto);
      let key = viewMode === "mensal"
        ? d.inicioPrevisto.substring(0, 7)
        : d.inicioPrevisto.substring(0, 4);

      if (!counts[key]) {
        counts[key] = { total: 0, proximas: 0 };
      }
      counts[key].total += 1;

      const daysDifference = differenceInDays(date, today);
      if (daysDifference >= 0 && daysDifference <= 30) {
        counts[key].proximas += 1;
      }
    });

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        name: viewMode === "mensal" ? key.split("-").reverse().join("/") : key,
        Total: value.total,
        "Próximas (30 dias)": value.proximas > 0 ? value.proximas : undefined,
      }));
  }, [data, viewMode]);

  const isMobile = useIsMobile();

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const entryName = state.activeLabel || state.activePayload[0].payload.name;
      if (entryName) {
        navigate(`/ordens?mes=${encodeURIComponent(entryName)}&status_not=COMP`);
        return;
      }
    }
    navigate("/ordens");
  };

  return (
    <div className="chart-container">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Ordens Previstas
        </h3>
        <div className="flex bg-secondary/50 rounded-md p-1 gap-1">
          <button
            onClick={() => setViewMode("mensal")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              viewMode === "mensal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setViewMode("anual")}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
              viewMode === "anual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} onClick={handleChartClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 22%)" />
          <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} width={isMobile ? 25 : 40} />
          <Tooltip 
            contentStyle={tooltipStyle}
            cursor={{ fill: "hsl(222, 20%, 22%)", opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(215, 15%, 55%)" }} />
          <Bar dataKey="Total" fill="hsl(215, 25%, 35%)" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
          <Line 
            type="monotone" 
            dataKey="Próximas (30 dias)" 
            stroke="hsl(45, 100%, 55%)" 
            strokeWidth={3} 
            dot={{ fill: "hsl(45, 100%, 55%)", r: 5, strokeWidth: 2 }} 
            connectNulls
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RankingAtivos({ data }: ChartsProps) {
  const navigate = useNavigate();
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      if (d.ativo) counts[d.ativo] = (counts[d.ativo] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const handleBarClick = (entry: any) => {
    if (entry && entry.name) {
      navigate(`/ordens?ativo=${encodeURIComponent(entry.name)}`);
    } else {
      navigate("/ordens");
    }
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
        Top 10 Ativos com Mais Ordens
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 22%)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(222, 20%, 22%)", opacity: 0.2 }} />
          <Bar dataKey="value" fill="hsl(199, 80%, 50%)" radius={[0, 4, 4, 0]} onClick={handleBarClick}>
            {chartData.map((entry, i) => (
              <Cell key={i} className="cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
