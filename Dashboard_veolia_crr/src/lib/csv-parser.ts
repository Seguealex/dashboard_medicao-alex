import Papa from "papaparse";

export interface OrdemServicoRow {
  ordem_servico: string; // REQUIRED - unique constraint
  descricao?: string;
  local?: string;
  ativo?: string;
  status_codigo?: string;
  tipo_servico?: string;
  inicio_previsto?: string; // YYYY-MM-DD
  termino_efetivo?: string; // YYYY-MM-DD
}

const COLUMN_MAP: Record<string, keyof OrdemServicoRow> = {
  "ordem de serviço": "ordem_servico",
  "ordem de servico": "ordem_servico",
  "descrição": "descricao",
  "descricao": "descricao",
  "local": "local",
  "ativo": "ativo",
  "status": "status_codigo",
  "status_codigo": "status_codigo",
  "início previsto": "inicio_previsto",
  "inicio previsto": "inicio_previsto",
  "tipo de serviço": "tipo_servico",
  "tipo de servico": "tipo_servico",
  "término efetivo": "termino_efetivo",
  "termino efetivo": "termino_efetivo",
};

function normalizeDate(value: string): string {
  if (!value) return "";
  // Try common date formats
  const cleaned = value.trim().split(" ")[0]; // Remove time part
  // Try DD/MM/YYYY
  const brMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2].padStart(2, "0")}-${brMatch[1].padStart(2, "0")}`;
  }
  // Try YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }
  // Try MM/DD/YYYY
  const usMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    return `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
  }
  return cleaned;
}

export function parseCSV(file: File): Promise<OrdemServicoRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data: OrdemServicoRow[] = [];
          const errors: string[] = [];

          for (let rowIndex = 0; rowIndex < results.data.length; rowIndex++) {
            const row = results.data[rowIndex] as Record<string, string>;
            const mapped: Partial<OrdemServicoRow> = {};

            for (const [rawCol, value] of Object.entries(row)) {
              const col = rawCol.trim();
              // Ignore empty or "Unnamed" columns
              if (!col || col.toLowerCase().startsWith("unnamed")) continue;
              if (!value || !value.trim()) continue;

              const key = COLUMN_MAP[col.toLowerCase()];
              if (!key) continue;

              if (key === "inicio_previsto" || key === "termino_efetivo") {
                const normalized = normalizeDate(value);
                if (normalized) {
                  (mapped as any)[key] = normalized;
                }
              } else {
                (mapped as any)[key] = value.trim();
              }
            }

            // Only require ordem_servico (unique constraint)
            if (!mapped.ordem_servico) {
              errors.push(`Linha ${rowIndex + 2}: Campo "Ordem de Serviço" é obrigatório`);
              continue;
            }

            data.push(mapped as OrdemServicoRow);
          }

          if (errors.length > 0) {
            console.warn("Linhas com erros de validação:", errors);
          }

          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}
