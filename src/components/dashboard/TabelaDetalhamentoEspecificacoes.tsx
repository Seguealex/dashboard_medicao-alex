// src/components/dashboard/TabelaDetalhamentoEspecificacoes.tsx
import { formatCurrency } from "@/lib/format";
import type { DadosEspecificacao } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  especificacoes: DadosEspecificacao[];
  meses: string[];
}

export function TabelaDetalhamentoEspecificacoes({ especificacoes, meses }: Props) {
  if (especificacoes.length === 0 || meses.length === 0) {
    return (
      <Card className="flex flex-col border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalhamento por Especificações</CardTitle>
          <CardDescription>Sem dados disponíveis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Mostrar todos os meses disponíveis para garantir que novos períodos no início da lista apareçam
  const mesesRecentes = meses; // Removido o slice(-6) para permitir visualização completa do histórico

  return (
    <Card className="flex flex-col border-border/60 w-full overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-base text-foreground">Detalhamento por Tipo de Serviço</CardTitle>
        <CardDescription>Últimos 6 períodos mensais apurados nas especificações</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold bg-muted/50 sticky left-0 z-10 w-1/3 min-w-[300px]">
                  Especificação / Tipo de Serviço
                </th>
                {mesesRecentes.map((mes, idx) => (
                  <th key={idx} className="px-4 py-3 font-semibold text-right whitespace-nowrap min-w-[120px]">
                    {mes}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap bg-muted/50">
                  Total Geral
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {especificacoes.map((linha, idx) => {
                const isTotal = linha.tipoServico.toLowerCase().includes("valor total");
                return (
                  <tr 
                    key={idx} 
                    className={`hover:bg-muted/30 transition-colors ${isTotal ? 'bg-primary/5 font-semibold text-primary' : 'text-foreground'}`}
                  >
                    <td className={`px-4 py-3 font-medium bg-background sticky left-0 z-10 w-1/3 border-r border-border/20 ${isTotal ? 'bg-primary/5' : ''}`}>
                      {linha.tipoServico}
                    </td>
                    
                    {mesesRecentes.map((mes, mIdx) => {
                      const valMes = linha.valoresPorMes.find(v => v.mes === mes)?.valor || 0;
                      return (
                        <td key={mIdx} className="px-4 py-3 text-right">
                          {formatCurrency(valMes)}
                        </td>
                      );
                    })}

                    <td className={`px-4 py-3 text-right font-bold bg-muted/20 ${isTotal ? 'text-primary' : ''}`}>
                      {formatCurrency(linha.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
