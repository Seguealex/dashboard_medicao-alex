export interface OrdemServico {
  ordemServico: string;
  descricao: string;
  local: string;
  ativo: string;
  status: StatusCode;
  inicioPrevisto: string; // YYYY-MM-DD
  tipoServico: TipoServicoCode;
  terminoEfetivo?: string;
}

export type StatusCode = "APPR" | "COMP" | "INPRG" | "WSCH";
export type TipoServicoCode = "CM" | "PM" | "PRJ" | "OTHER";

export const STATUS_LABELS: Record<StatusCode, string> = {
  APPR: "Aprovada",
  COMP: "Concluída",
  INPRG: "Aguardando Planejamento",
  WSCH: "Aguardando Planejamento",
};

export const TIPO_SERVICO_LABELS: Record<TipoServicoCode, string> = {
  CM: "Manutenção Corretiva",
  PM: "Manutenção Planejada",
  PRJ: "Ordem de Projetos",
  OTHER: "Manutenção Predial",
};

export const STATUS_COLORS: Record<StatusCode, string> = {
  APPR: "hsl(45, 100%, 55%)",
  COMP: "hsl(142, 60%, 50%)",
  INPRG: "hsl(199, 80%, 50%)",
  WSCH: "hsl(280, 65%, 60%)",
};

export const TIPO_SERVICO_COLORS: Record<TipoServicoCode, string> = {
  CM: "hsl(0, 72%, 55%)",
  PM: "hsl(199, 80%, 50%)",
  PRJ: "hsl(280, 65%, 60%)",
  OTHER: "hsl(25, 95%, 55%)",
};
