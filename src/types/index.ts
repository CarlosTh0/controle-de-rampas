
export interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
  rampaDespacho?: number;
  galpaoDespacho?: number;
  prioridade: 'alta' | 'normal' | 'baixa';
  criadoEm: Date;
  ultimaMovimentacao: Date;
  tempoCarregamento?: number;
}

export interface RampaBloqueada {
  rampa: number;
  galpao: number;
  bloqueada: boolean;
}

export interface Movimentacao {
  id: string;
  frotaId: string;
  frotaNumero: string;
  acao: 'criada' | 'alocada' | 'removida' | 'carregada' | 'despachada' | 'bloqueio' | 'desbloqueio';
  detalhes: string;
  timestamp: Date;
  rampa?: number;
  galpao?: number;
}

export interface Configuracao {
  totalVaos: number;
  rampasPorVao: number;
  tempoAlertaMinutos: number;
  modoEscuro: boolean;
}
