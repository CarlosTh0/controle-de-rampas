
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, BarChart3, Target } from 'lucide-react';
import { Frota, Movimentacao } from '../types';
import { formatarDuracao } from '../utils/timeUtils';

interface EstatisticasAvancadasProps {
  frotas: Frota[];
  movimentacoes: Movimentacao[];
  totalVaos: number;
}

const EstatisticasAvancadas = ({ frotas, movimentacoes, totalVaos }: EstatisticasAvancadasProps) => {
  const calcularEstatisticas = () => {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    
    // Movimentações de hoje
    const movimentacoesHoje = movimentacoes.filter(mov => mov.timestamp >= hoje);
    
    // Frotas despachadas hoje
    const frotasDespachadas = frotas.filter(f => f.status === 'despachada');
    const despachadasHoje = movimentacoesHoje.filter(mov => mov.acao === 'despachada').length;
    
    // Tempo médio de carregamento (baseado nas despachadas com tempo registrado)
    const temposCarregamento = frotasDespachadas
      .filter(f => f.tempoCarregamento)
      .map(f => f.tempoCarregamento!);
    
    const tempoMedioCarregamento = temposCarregamento.length > 0
      ? Math.round(temposCarregamento.reduce((a, b) => a + b, 0) / temposCarregamento.length)
      : 0;
    
    // Produtividade por vão (despachadas hoje / total de vãos)
    const produtividadePorVao = totalVaos > 0 ? (despachadasHoje / totalVaos) : 0;
    
    // Taxa de ocupação das rampas
    const frotasEmRampas = frotas.filter(f => f.status === 'rampa').length;
    const totalRampas = totalVaos * 4; // Assumindo 4 rampas por vão
    const taxaOcupacao = totalRampas > 0 ? (frotasEmRampas / totalRampas) * 100 : 0;
    
    return {
      despachadasHoje,
      tempoMedioCarregamento,
      produtividadePorVao: Math.round(produtividadePorVao * 10) / 10,
      taxaOcupacao: Math.round(taxaOcupacao),
      movimentacoesHoje: movimentacoesHoje.length
    };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Despachadas Hoje</p>
              <p className="text-2xl font-bold text-green-600">{stats.despachadasHoje}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatarDuracao(stats.tempoMedioCarregamento)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Produtividade/Vão</p>
              <p className="text-2xl font-bold text-purple-600">{stats.produtividadePorVao}</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ocupação</p>
              <p className="text-2xl font-bold text-orange-600">{stats.taxaOcupacao}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstatisticasAvancadas;
