
import { Frota, RampaBloqueada, Movimentacao, Configuracao } from '../types';

const STORAGE_KEYS = {
  FROTAS: 'sistema-frotas-frotas',
  RAMPAS_BLOQUEADAS: 'sistema-frotas-rampas',
  MOVIMENTACOES: 'sistema-frotas-movimentacoes',
  CONFIGURACAO: 'sistema-frotas-config'
};

export const salvarFrotas = (frotas: Frota[]) => {
  localStorage.setItem(STORAGE_KEYS.FROTAS, JSON.stringify(frotas));
};

export const carregarFrotas = (): Frota[] => {
  const dados = localStorage.getItem(STORAGE_KEYS.FROTAS);
  if (!dados) return [];
  
  return JSON.parse(dados).map((frota: any) => ({
    ...frota,
    criadoEm: new Date(frota.criadoEm),
    ultimaMovimentacao: new Date(frota.ultimaMovimentacao)
  }));
};

export const salvarRampasBloqueadas = (rampas: RampaBloqueada[]) => {
  localStorage.setItem(STORAGE_KEYS.RAMPAS_BLOQUEADAS, JSON.stringify(rampas));
};

export const carregarRampasBloqueadas = (): RampaBloqueada[] => {
  const dados = localStorage.getItem(STORAGE_KEYS.RAMPAS_BLOQUEADAS);
  return dados ? JSON.parse(dados) : [];
};

export const salvarMovimentacoes = (movimentacoes: Movimentacao[]) => {
  localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES, JSON.stringify(movimentacoes));
};

export const carregarMovimentacoes = (): Movimentacao[] => {
  const dados = localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES);
  if (!dados) return [];
  
  return JSON.parse(dados).map((mov: any) => ({
    ...mov,
    timestamp: new Date(mov.timestamp)
  }));
};

export const salvarConfiguracao = (config: Configuracao) => {
  localStorage.setItem(STORAGE_KEYS.CONFIGURACAO, JSON.stringify(config));
};

export const carregarConfiguracao = (): Configuracao => {
  const dados = localStorage.getItem(STORAGE_KEYS.CONFIGURACAO);
  return dados ? JSON.parse(dados) : {
    totalVaos: 4,
    rampasPorVao: 4,
    tempoAlertaMinutos: 120,
    modoEscuro: false
  };
};
