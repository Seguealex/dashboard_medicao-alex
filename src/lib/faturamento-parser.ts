// src/lib/faturamento-parser.ts
import type { DadosBoletim, DadosEspecificacao, FaturamentoProcessado, SpecData } from "./types";

/**
 * Interpreta a aba "BOLETIM MENSAL"
 * - Cabeçalhos na linha 3 (índice 2)
 * - Dados a partir da linha 4 (índice 3)
 */
function parseBoletim(rawRows: any[][]): DadosBoletim[] {
  const boletim: DadosBoletim[] = [];
  
  // Começamos na linha índice 1 (segunda linha do Excel), pois às vezes o cabeçalho é curto.
  // Usamos lógica de detecção para pular cabeçalhos ou campos vazios.
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;
    
    // Ignorar ou parar se encontrarmos o cabeçalho de outro contrato ou o topo da planilha:
    if (typeof row[0] === 'string') {
      const cell = row[0].toLowerCase();
      if (cell.includes('contrato n') || cell.includes('periodo da med')) {
        // Se já temos dados, paramos. Se estamos no começo (boletim vazio), apenas pulamos essa linha de título.
        if (boletim.length > 0) break;
        continue;
      }
    }

    // Pular linhas totalmente vazias (sem data de início, valor medido E valor fatura)
    if (!row[0] && !row[4] && !row[8]) continue;

    const b: DadosBoletim = {
      periodoInicio: row[0],
      periodoFim: row[2],
      dataEnvio: row[3],
      valorMedido: typeof row[4] === 'number' ? row[4] : 0,
      dataLiberacao: row[5],
      numeroPedido: typeof row[6] === 'string' ? row[6] : '',
      numeroFatura: row[7],
      valorFatura: typeof row[8] === 'number' ? row[8] : 0,
      saldoContrato: typeof row[9] === 'number' ? row[9] : 0,
    };
    
    // Só adiciona se tiver informações relevantes (valor faturado ou medido ativo)
    if (b.valorMedido > 0 || b.valorFatura > 0 || b.numeroPedido !== '') {
      boletim.push(b);
    }
  }
  
  return boletim;
}

/**
 * Interpreta a aba "ESPECIFICAÇÕES"
 * - Linha 1 (índice 0): Cabeçalhos das colunas (meses a partir do índice 1)
 * - Linhas 2 em diante: Tipos de Serviço na coluna 0, valores nos meses seguintes
 */
function parseEspecificacoes(rawRows: any[][]): { especificacoes: DadosEspecificacao[], meses: string[] } {
  const especificacoes: DadosEspecificacao[] = [];
  const meses: string[] = [];
  
  if (rawRows.length < 2) return { especificacoes, meses };
  
  const headers = rawRows[0];
  
  // Coletar meses disponíveis (índice 1 em diante)
  for (let col = 1; col < headers.length; col++) {
    let header = headers[col];
    if (header != null && header !== "") {
      // Garantir que o cabeçalho seja string (pode vir como número se for uma data serial do Excel)
      const headerStr = String(header);
      
      // O cabeçalho vem com quebras de linha: "21/07/2025\r\nA\r\n20/08/2025"
      // Limpamos para pegar apenas o mês/ano do fim do ciclo ou formatar melhor
      // Substituímos " A " ou " a " por " à " para padronizar e removemos quebras de linha
      const cleanHeader = headerStr
        .replace(/\r?\n/g, ' ')
        .replace(/\s+A\s+/i, ' à ') // Case-insensitive " A " com espaços
        .trim();
      meses.push(cleanHeader);
    }
  }
  
  // Processar linhas de dados
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || !row[0]) continue;
    
    const tipoServico = String(row[0]).trim();
    if (!tipoServico) continue;
    
    const valoresPorMes: SpecData[] = [];
    let totalLinha = 0;
    
    for (let m = 0; m < meses.length; m++) {
      const val = row[m + 1]; // Offset index 1 for values
      const numericVal = typeof val === 'number' ? val : 0;
      valoresPorMes.push({ 
        mes: meses[m], 
        valor: numericVal 
      });
      totalLinha += numericVal;
    }
    
    // Só adiciona se a linha tiver valores e não for linha totalmente zerada
    if (totalLinha > 0 || row.some(v => typeof v === 'number' && v > 0)) {
       especificacoes.push({
         tipoServico,
         valoresPorMes,
         total: totalLinha
       });
    }
  }
  
  return { especificacoes, meses };
}

/**
 * Ponto de entrada: Converte os dados crus do Excel nas estruturas do Dashboard
 */
export function processarFaturamentoExcel(rawSheets: Record<string, any[][]>): FaturamentoProcessado {
  const sheetBoletim = rawSheets["BOLETIM MENSAL"] || rawSheets["Boletim Mensal"];
  const sheetSpecs = rawSheets["ESPECIFICAÇÕES"] || rawSheets["Especificações"] || rawSheets["Especificacoes"];
  
  if (!sheetBoletim || !sheetSpecs) {
    throw new Error("O arquivo Excel não contém as abas 'BOLETIM MENSAL' e 'ESPECIFICAÇÕES' necessárias.");
  }
  
  const boletim = parseBoletim(sheetBoletim);
  const { especificacoes, meses } = parseEspecificacoes(sheetSpecs);
  
  return {
    boletim,
    especificacoes,
    mesesEspecificacoes: meses
  };
}
