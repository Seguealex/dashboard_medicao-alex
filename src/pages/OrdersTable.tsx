import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadData } from "@/lib/data-store";
import type { OrdemServico } from "@/lib/types";
import { STATUS_LABELS, TIPO_SERVICO_LABELS } from "@/lib/types";

export default function OrdersTable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros vindos da URL
  const filterStatus = searchParams.get("status");
  const filterStatusNot = searchParams.get("status_not");
  const filterTipo = searchParams.get("tipo");
  const filterAtivo = searchParams.get("ativo");
  const filterMes = searchParams.get("mes"); // Pode ser "01/2026" ou "2026"

  // Configuração de Ordenação
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrdemServico;
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allData = await loadData();

      // Aplicar filtros da URL
      const filteredData = allData.filter((item) => {
        let matches = true;
        if (filterStatus && item.status !== filterStatus) matches = false;
        if (filterStatusNot && item.status === filterStatusNot) matches = false;
        if (filterTipo && item.tipoServico !== filterTipo) matches = false;
        if (filterAtivo && item.ativo !== filterAtivo) matches = false;
        
        if (filterMes && item.inicioPrevisto) {
          // item.inicioPrevisto é "YYYY-MM-DD"
          if (filterMes.includes("/")) {
            // filterMes = "MM/YYYY" -> "YYYY-MM"
            const [mm, yyyy] = filterMes.split("/");
            if (!item.inicioPrevisto.startsWith(`${yyyy}-${mm}`)) {
              matches = false;
            }
          } else {
            // filterMes = "YYYY"
            if (!item.inicioPrevisto.startsWith(filterMes)) {
              matches = false;
            }
          }
        }

        return matches;
      });

      setData(filteredData);
      setLoading(false);
    };
    fetchData();
  }, [filterStatus, filterTipo, filterAtivo, filterMes]);

  const handleSort = (key: keyof OrdemServico) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const getFilterDescription = () => {
    const filters = [];
    if (filterStatus) filters.push(`Status: ${STATUS_LABELS[filterStatus as keyof typeof STATUS_LABELS] || filterStatus}`);
    if (filterTipo) filters.push(`Tipo: ${TIPO_SERVICO_LABELS[filterTipo as keyof typeof TIPO_SERVICO_LABELS] || filterTipo}`);
    if (filterAtivo) filters.push(`Ativo: ${filterAtivo}`);
    if (filterMes) filters.push(`Previsão: ${filterMes}`);

    return filters.length > 0 ? filters.join(" | ") : "Todas as Ordens";
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Tabela de Ordens
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {getFilterDescription()} ({sortedData.length} registros)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 border-primary/50 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Dashboard
        </Button>
      </header>

      {/* Main Table Area */}
      <div className="rounded-md border border-border/50 bg-black/20 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="hover:bg-transparent border-b-border/50">
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                  onClick={() => handleSort("ordemServico")}
                >
                  <div className="flex items-center gap-1">
                    Ordem <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors min-w-[200px]"
                  onClick={() => handleSort("descricao")}
                >
                  <div className="flex items-center gap-1">
                    Descrição <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                  onClick={() => handleSort("ativo")}
                >
                  <div className="flex items-center gap-1">
                    Ativo <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                  onClick={() => handleSort("tipoServico")}
                >
                  <div className="flex items-center gap-1">
                    Tipo <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando ordens...
                  </TableCell>
                </TableRow>
              ) : sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    Nenhuma ordem encontrada para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((ordem) => (
                  <TableRow
                    key={ordem.ordemServico}
                    className="hover:bg-primary/5 border-b border-border/10 transition-colors"
                  >
                    <TableCell className="font-mono text-xs font-semibold">{ordem.ordemServico}</TableCell>
                    <TableCell className="text-sm">{ordem.descricao}</TableCell>
                    <TableCell className="text-sm font-medium">{ordem.ativo || "-"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs whitespace-nowrap">
                        {STATUS_LABELS[ordem.status] || ordem.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs whitespace-nowrap">
                        {TIPO_SERVICO_LABELS[ordem.tipoServico] || ordem.tipoServico}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
