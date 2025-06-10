
import { Frota, Movimentacao } from '../types';

export const exportarRelatorioCSV = (frotas: Frota[], movimentacoes: Movimentacao[]) => {
  const csvContent = [
    // Cabeçalho
    'Número,Status,Prioridade,Tempo Decorrido,Rampa,Vão,Carregada,Criado Em',
    // Dados das frotas
    ...frotas.map(frota => [
      frota.numero,
      frota.status,
      frota.prioridade,
      calcularTempoDecorrido(frota.ultimaMovimentacao),
      frota.rampa || '',
      frota.galpao || '',
      frota.carregada ? 'Sim' : 'Não',
      frota.criadoEm.toLocaleString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-frotas-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const calcularTempoDecorrido = (inicio: Date): string => {
  const agora = new Date();
  const diferenca = agora.getTime() - inicio.getTime();
  const minutos = Math.floor(diferenca / (1000 * 60));
  const horas = Math.floor(minutos / 60);
  
  if (horas > 0) {
    return `${horas}h ${minutos % 60}m`;
  } else {
    return `${minutos}m`;
  }
};
