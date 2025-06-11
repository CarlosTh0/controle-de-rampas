
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { Frota } from '../types';
import { calcularTempoDecorrido } from '../utils/timeUtils';

interface FrotasPatioProps {
  frotas: Frota[];
  onAlocarFrota: (frotaId: string, rampa: number, galpao: number) => void;
  rampaOcupada: (rampa: number, galpao: number) => Frota | undefined;
  rampaEstaBloqueada: (rampa: number, galpao: number) => boolean;
  totalRampas: number;
  rampasPorVao: number;
  tempoAlerta: number;
}

const FrotasPatio = ({ 
  frotas, 
  onAlocarFrota, 
  rampaOcupada, 
  rampaEstaBloqueada, 
  totalRampas, 
  rampasPorVao,
  tempoAlerta
}: FrotasPatioProps) => {
  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700';
      case 'baixa': return 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600';
      default: return 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
    }
  };

  const isAlerta = (frota: Frota) => {
    const tempoDecorrido = (new Date().getTime() - frota.ultimaMovimentacao.getTime()) / (1000 * 60);
    return tempoDecorrido > tempoAlerta;
  };

  // Ordenar por prioridade e depois por tempo
  const frotasOrdenadas = [...frotas].sort((a, b) => {
    const prioridadeOrder = { alta: 3, normal: 2, baixa: 1 };
    const prioridadeDiff = prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    
    if (prioridadeDiff !== 0) return prioridadeDiff;
    
    return a.ultimaMovimentacao.getTime() - b.ultimaMovimentacao.getTime();
  });

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg dark:text-white">Frotas no Pátio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {frotasOrdenadas.map(frota => (
            <div
              key={frota.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                getPrioridadeColor(frota.prioridade)
              } ${isAlerta(frota) ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {frota.numero}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      frota.prioridade === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' :
                      frota.prioridade === 'baixa' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                    }`}>
                      {frota.prioridade}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {calcularTempoDecorrido(frota.ultimaMovimentacao)}
                    </span>
                    {isAlerta(frota) && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">⚠️</span>
                    )}
                  </div>
                </div>
              </div>
              <select
                className="text-sm border rounded px-2 py-1 transition-all duration-200 hover:border-green-400 focus:border-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onChange={(e) => {
                  if (e.target.value) {
                    const [rampa, galpao] = e.target.value.split('-').map(Number);
                    onAlocarFrota(frota.id, rampa, galpao);
                  }
                }}
                defaultValue=""
              >
                <option value="">Alocar</option>
                {Array.from({ length: totalRampas }, (_, i) => {
                  const rampa = i + 1;
                  const galpao = Math.ceil(rampa / rampasPorVao);
                  const ocupada = rampaOcupada(rampa, galpao);
                  const bloqueada = rampaEstaBloqueada(rampa, galpao);
                  
                  if (ocupada || bloqueada) return null;
                  
                  return (
                    <option key={rampa} value={`${rampa}-${galpao}`}>
                      Rampa {rampa} (V{galpao})
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
          
          {frotas.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              Nenhuma frota no pátio
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FrotasPatio;
