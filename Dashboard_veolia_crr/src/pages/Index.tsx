import { useState, useEffect, useMemo } from "react";
import { BarChart3, Filter } from "lucide-react";
import { loadData } from "@/lib/data-store";
import { KPICards } from "@/components/KPICards";
import { TipoServicoKPIs } from "@/components/TipoServicoKPIs";
import { ChartBarTipoServico, ChartPieStatus, ChartLineByMonth } from "@/components/Charts";
import { FilterBar, applyFilters, emptyFilters, type Filters } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { OrdemServico } from "@/lib/types";

const Index = () => {
  const [allData, setAllData] = useState<OrdemServico[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadData();
      setAllData(data);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => applyFilters(allData, filters), [allData, filters]);

  if (allData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <BarChart3 className="h-16 w-16 text-primary opacity-60" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard de Ordens de Serviço</h1>
          <p className="text-muted-foreground mb-6">
            Nenhum dado disponível. Faça upload de um arquivo CSV para começar.
          </p>
          <Button onClick={() => navigate("/admin")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Importar Dados
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="dashboard-header px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex flex-col items-start gap-2">
          <img src="/veolia-logo.svg" alt="Veolia" className="h-12 w-auto object-contain" />
          <h1 className="text-xl font-bold text-foreground">Dashboard — Ordens de Serviço</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="text-muted-foreground hover:text-foreground"
          >
            Admin
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-[1440px] mx-auto">
        {/* Filters */}
        {showFilters && (
          <FilterBar filters={filters} onChange={setFilters} data={allData} />
        )}

        {/* KPIs */}
        <KPICards data={filteredData} />
        <TipoServicoKPIs data={filteredData} />

        {/* Gráficos: barras e rosca */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartBarTipoServico data={filteredData} />
          <ChartPieStatus data={filteredData} />
        </div>

        {/* Ordens Previstas: largura total na parte de baixo */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 sm:px-6">
          <ChartLineByMonth data={filteredData} />
        </div>

        {/* Footer info */}
        <p className="text-xs text-muted-foreground text-center pt-4">
          Exibindo {filteredData.length.toLocaleString("pt-BR")} de {allData.length.toLocaleString("pt-BR")} ordens de serviço
        </p>
      </main>
    </div>
  );
};

export default Index;
