
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Clock } from 'lucide-react';
import { Movimentacao } from '../types';
import { calcularTempoDecorrido } from '../utils/timeUtils';

interface HistoricoMovimentacoesProps {
  movimentacoes: Movimentacao[];
}

const HistoricoMovimentacoes = ({ movimentacoes }: HistoricoMovimentacoesProps) => {
  const movimentacoesRecentes = movimentacoes
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const getIconeAcao = (acao: string) => {
    switch (acao) {
      case 'criada': return '🆕';
      case 'alocada': return '📍';
      case 'removida': return '↩️';
      case 'carregada': return '📦';
      case 'despachada': return '🚛';
      case 'bloqueio': return '🔒';
      case 'desbloqueio': return '🔓';
      default: return '📝';
    }
  };

  const getCorAcao = (acao: string) => {
    switch (acao) {
      case 'criada': return 'text-blue-600';
      case 'alocada': return 'text-orange-600';
      case 'removida': return 'text-yellow-600';
      case 'carregada': return 'text-purple-600';
      case 'despachada': return 'text-green-600';
      case 'bloqueio': return 'text-red-600';
      case 'desbloqueio': return 'text-green-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Movimentações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {movimentacoesRecentes.map(mov => (
            <div
              key={mov.id}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border transition-all duration-200 hover:shadow-md"
            >
              <div className="text-lg">{getIconeAcao(mov.acao)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-800">{mov.frotaNumero}</span>
                  <span className={`text-sm font-medium ${getCorAcao(mov.acao)}`}>
                    {mov.acao.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{mov.detalhes}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">
                    {calcularTempoDecorrido(mov.timestamp)} atrás
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {movimentacoesRecentes.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              Nenhuma movimentação registrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricoMovimentacoes;
