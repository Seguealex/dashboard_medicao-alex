import { useMemo } from "react";
import { STATUS_LABELS, TIPO_SERVICO_LABELS } from "@/lib/types";
import type { OrdemServico, StatusCode, TipoServicoCode } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface Filters {
  dataInicio: string;
  dataFim: string;
  tipoServico: string;
  status: string;
  ativo: string;
  local: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  data: OrdemServico[];
}

export const emptyFilters: Filters = {
  dataInicio: "",
  dataFim: "",
  tipoServico: "all",
  status: "all",
  ativo: "all",
  local: "all",
};

export function applyFilters(data: OrdemServico[], filters: Filters): OrdemServico[] {
  return data.filter((d) => {
    if (filters.dataInicio && d.inicioPrevisto < filters.dataInicio) return false;
    if (filters.dataFim && d.inicioPrevisto > filters.dataFim) return false;
    if (filters.tipoServico !== "all" && d.tipoServico !== filters.tipoServico) return false;
    if (filters.status !== "all" && d.status !== filters.status) return false;
    if (filters.ativo !== "all" && d.ativo !== filters.ativo) return false;
    if (filters.local !== "all" && d.local !== filters.local) return false;
    return true;
  });
}

export function FilterBar({ filters, onChange, data }: FilterBarProps) {
  const ativos = useMemo(() => [...new Set(data.map((d) => d.ativo).filter(Boolean))].sort(), [data]);
  const locais = useMemo(() => [...new Set(data.map((d) => d.local).filter(Boolean))].sort(), [data]);
  const hasFilters = Object.entries(filters).some(([k, v]) => v !== emptyFilters[k as keyof Filters]);

  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="filter-bar">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Data Início</label>
          <Input
            type="date"
            value={filters.dataInicio}
            onChange={(e) => set("dataInicio", e.target.value)}
            className="w-[150px] bg-secondary border-border text-foreground text-sm h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Data Fim</label>
          <Input
            type="date"
            value={filters.dataFim}
            onChange={(e) => set("dataFim", e.target.value)}
            className="w-[150px] bg-secondary border-border text-foreground text-sm h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Tipo de Serviço</label>
          <Select value={filters.tipoServico} onValueChange={(v) => set("tipoServico", v)}>
            <SelectTrigger className="w-[180px] bg-secondary border-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(Object.keys(TIPO_SERVICO_LABELS) as TipoServicoCode[]).map((k) => (
                <SelectItem key={k} value={k}>{TIPO_SERVICO_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Status</label>
          <Select value={filters.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className="w-[160px] bg-secondary border-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(Object.keys(STATUS_LABELS) as StatusCode[]).map((k) => (
                <SelectItem key={k} value={k}>{STATUS_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Ativo</label>
          <Select value={filters.ativo} onValueChange={(v) => set("ativo", v)}>
            <SelectTrigger className="w-[160px] bg-secondary border-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {ativos.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium">Local</label>
          <Select value={filters.local} onValueChange={(v) => set("local", v)}>
            <SelectTrigger className="w-[160px] bg-secondary border-border text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {locais.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilters)} className="text-muted-foreground hover:text-foreground h-9">
            <X className="h-4 w-4 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
