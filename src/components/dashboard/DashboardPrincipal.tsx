// src/components/dashboard/DashboardPrincipal.tsx
import { useExcel } from "@/contexts/ExcelContext";
import { BarChart3, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { KpiCards } from "./KpiCards";
import { SeletorContrato } from "./SeletorContrato";
import { EvolucaoFaturamentoChart } from "./EvolucaoFaturamentoChart";
import { ComposicaoEspecificacoesChart } from "./ComposicaoEspecificacoesChart";
import { SaldoVsFaturamentoChart } from "./SaldoVsFaturamentoChart";
import { TopServicosDonut } from "./TopServicosDonut";
import { TabelaHistoricoMedicoes } from "./TabelaHistoricoMedicoes";
import { TabelaDetalhamentoEspecificacoes } from "./TabelaDetalhamentoEspecificacoes";
import { Sidebar, type SidebarTab } from "./Sidebar";
import { CONTRATOS_DISPONIVEIS } from "@/lib/types";
import { useState } from "react";

export function DashboardPrincipal() {
  const { faturamento } = useExcel();
  const navigate = useNavigate();
  const [contratoAtivoId, setContratoAtivoId] = useState(CONTRATOS_DISPONIVEIS[0].id);
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");

  // Estado: Nenhum dado carregado (nem via Supabase, nem via Excel)
  if (!faturamento || faturamento.boletim.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background">
        <BarChart3 className="h-16 w-16 text-primary opacity-60" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Dashboard — Medição e Faturamento
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Nenhum dado carregado no banco. Faça o login administrativo para importar a planilha.
          </p>
          <Button
            onClick={() => navigate("/admin-login")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Acessar Administração
          </Button>
        </div>
      </div>
    );
  }

  const contratoAtivo = CONTRATOS_DISPONIVEIS.find(c => c.id === contratoAtivoId) || CONTRATOS_DISPONIVEIS[0];

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar Lateral fixa */}
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Container Principal */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Premium Estilo Imagem */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border/40">
          
          {/* Esquerda: (Vazio para manter alinhamento já que a busca saiu) */}
          <div className="flex items-center gap-4 w-64 hidden md:block">
            {/* Espaço reservado para flex space-between */}
          </div>

          {/* Centro: Títulos / Navegação */}
          <div className="hidden lg:flex items-center justify-center gap-6 text-sm font-medium">
             <div className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" onClick={() => alert("Exemplo Fake Tab")}>
               Relatório
             </div>
          </div>

          {/* Direita: Perfil e Seletor Contrato */}
          <div className="flex items-center gap-4">
            <SeletorContrato 
              activeId={contratoAtivoId} 
              onChange={setContratoAtivoId} 
              contratos={CONTRATOS_DISPONIVEIS}
            />
            
            <div 
              className="flex items-center gap-2 border-l border-border/50 pl-4 ml-2 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/admin")}
              title="Acessar Administração"
            >
              <div className="flex flex-col items-end mr-1 hidden sm:flex">
                <span className="text-sm font-medium leading-tight">Admin</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Administração</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center relative overflow-hidden ring-2 ring-border">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-20">
          
          {activeTab === "dashboard" && (
            <>
              {/* KPIs (Top Cards) */}
              <KpiCards dados={faturamento} contrato={contratoAtivo} />

              {/* Linha Central: Evolução Faturamento na Esquerda, Área Saldo na Direita */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-h-0">
                <div className="h-full min-h-0 min-w-0">
                  <EvolucaoFaturamentoChart dados={faturamento.boletim} />
                </div>
                <div className="h-full min-h-0 min-w-0">
                  <SaldoVsFaturamentoChart dados={faturamento.boletim} contrato={contratoAtivo} />
                </div>
              </div>

              {/* Container Agrupador dos Gráficos Inferiores para Menor Espaçamento */}
              <div className="flex flex-col gap-6 w-full min-h-0">
                {/* Terceira Linha: Composição Base (Full Width) */}
                <div className="w-full relative z-20 min-h-0 min-w-0">
                  <ComposicaoEspecificacoesChart especificacoes={faturamento.especificacoes} />
                </div>

                {/* Quarta Linha: Donut Servicos (Centralizado e maior) */}
                <div className="flex justify-center w-full relative z-10 min-h-0 min-w-0">
                  <div className="w-full max-w-5xl min-h-0 min-w-0">
                    <TopServicosDonut especificacoes={faturamento.especificacoes} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "especificacoes" && (
            <div className="h-full">
              <TabelaDetalhamentoEspecificacoes 
                especificacoes={faturamento.especificacoes} 
                meses={faturamento.mesesEspecificacoes}
              />
            </div>
          )}

          {activeTab === "boletim" && (
            <div className="h-full">
              <TabelaHistoricoMedicoes boletim={faturamento.boletim} />
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
