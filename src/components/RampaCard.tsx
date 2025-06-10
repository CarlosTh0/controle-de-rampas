
import React, { useState } from 'react';
import { Package, Lock, Unlock, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Frota } from '../types';
import { calcularTempoDecorrido } from '../utils/timeUtils';
import ConfirmDialog from './ConfirmDialog';

interface RampaCardProps {
  rampa: number;
  galpao: number;
  frotaOcupando?: Frota;
  isBloqueada: boolean;
  onToggleBloqueio: (rampa: number, galpao: number) => void;
  onToggleCarregada: (frotaId: string) => void;
  onRemoverFrota: (frotaId: string) => void;
  onFinalizarCarregamento: (frotaId: string) => void;
  tempoAlerta: number;
}

const RampaCard = ({
  rampa,
  galpao,
  frotaOcupando,
  isBloqueada,
  onToggleBloqueio,
  onToggleCarregada,
  onRemoverFrota,
  onFinalizarCarregamento,
  tempoAlerta
}: RampaCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'block' | 'unblock' | 'remove' | 'finish';
    data?: any;
  } | null>(null);

  const isOcupada = !!frotaOcupando;
  const isCarregada = frotaOcupando?.carregada;
  
  const isAlerta = frotaOcupando && (() => {
    const tempoDecorrido = (new Date().getTime() - frotaOcupando.ultimaMovimentacao.getTime()) / (1000 * 60);
    return tempoDecorrido > tempoAlerta;
  })();

  const handleAction = (type: 'block' | 'unblock' | 'remove' | 'finish', data?: any) => {
    setConfirmAction({ type, data });
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'block':
      case 'unblock':
        onToggleBloqueio(rampa, galpao);
        break;
      case 'remove':
        onRemoverFrota(confirmAction.data);
        break;
      case 'finish':
        onFinalizarCarregamento(confirmAction.data);
        break;
    }
  };

  const getConfirmContent = () => {
    if (!confirmAction) return { title: '', description: '' };

    switch (confirmAction.type) {
      case 'block':
        return {
          title: 'Bloquear Rampa',
          description: `Tem certeza que deseja bloquear a Rampa ${rampa}? Ela ficará indisponível para novas alocações.`
        };
      case 'unblock':
        return {
          title: 'Desbloquear Rampa',
          description: `Tem certeza que deseja desbloquear a Rampa ${rampa}? Ela ficará disponível para alocações.`
        };
      case 'remove':
        return {
          title: 'Remover Frota',
          description: `Tem certeza que deseja remover a frota ${frotaOcupando?.numero} da Rampa ${rampa}? Ela retornará ao pátio.`
        };
      case 'finish':
        return {
          title: 'Finalizar Carregamento',
          description: `Tem certeza que deseja finalizar o carregamento da frota ${frotaOcupando?.numero}? Ela será despachada e a rampa ficará livre.`
        };
      default:
        return { title: '', description: '' };
    }
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade) {
      case 'alta': return 'border-red-400';
      case 'baixa': return 'border-gray-400';
      default: return 'border-orange-300';
    }
  };

  return (
    <>
      <div
        className={`relative p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
          isBloqueada
            ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 animate-pulse'
            : isOcupada 
              ? isCarregada 
                ? `bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 shadow-purple-200 shadow-lg ${frotaOcupando ? getPrioridadeColor(frotaOcupando.prioridade) : ''}` 
                : `bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 shadow-orange-200 shadow-lg ${frotaOcupando ? getPrioridadeColor(frotaOcupando.prioridade) : ''}`
              : 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/30 hover:shadow-green-200 hover:shadow-md'
        } ${isAlerta ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
      >
        <div className="text-center">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Rampa {rampa}
          </p>
          {isBloqueada ? (
            <div className="mt-1 space-y-2">
              <Lock className="h-4 w-4 text-red-600 mx-auto animate-bounce" strokeWidth={1.5} />
              <p className="text-xs font-bold text-red-700 dark:text-red-300">BLOQUEADA</p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-red-300 dark:border-red-600"
                onClick={() => handleAction('unblock')}
              >
                <Unlock className="h-3 w-3" />
              </Button>
            </div>
          ) : isOcupada && frotaOcupando ? (
            <div className="mt-1 space-y-2">
              <p className={`text-xs font-bold transition-colors duration-200 ${isCarregada ? 'text-purple-700 dark:text-purple-300' : 'text-orange-700 dark:text-orange-300'}`}>
                {frotaOcupando.numero}
              </p>
              
              <div className="flex items-center justify-center gap-1">
                <span className={`text-xs px-1 py-0.5 rounded ${
                  frotaOcupando.prioridade === 'alta' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' :
                  frotaOcupando.prioridade === 'baixa' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                }`}>
                  {frotaOcupando.prioridade}
                </span>
                {isAlerta && <span className="text-yellow-500">⚠️</span>}
              </div>
              
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {calcularTempoDecorrido(frotaOcupando.ultimaMovimentacao)}
              </div>
              
              {isCarregada && (
                <div className="flex items-center justify-center">
                  <Package className="h-3 w-3 text-purple-600 animate-pulse" strokeWidth={1.5} />
                </div>
              )}
              
              <div className="flex items-center justify-center gap-1">
                <Checkbox
                  checked={isCarregada}
                  onCheckedChange={() => onToggleCarregada(frotaOcupando.id)}
                  className="h-3 w-3"
                />
                <label className="text-xs text-slate-600 dark:text-slate-400">Carregada</label>
              </div>
              
              <div className="flex gap-1">
                {isCarregada ? (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-6 text-xs bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-110"
                    onClick={() => handleAction('finish', frotaOcupando.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs transition-all duration-200 hover:scale-110"
                    onClick={() => handleAction('remove', frotaOcupando.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs border-red-300 dark:border-red-600 transition-all duration-200 hover:scale-110"
                  onClick={() => handleAction('block')}
                >
                  <Lock className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Livre
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-red-300 dark:border-red-600 transition-all duration-200 hover:scale-110"
                onClick={() => handleAction('block')}
              >
                <Lock className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={getConfirmContent().title}
        description={getConfirmContent().description}
        onConfirm={executeAction}
        confirmText="Confirmar"
        variant={confirmAction?.type === 'remove' || confirmAction?.type === 'finish' ? 'destructive' : 'default'}
      />
    </>
  );
};

export default RampaCard;
