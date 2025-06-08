
import React from 'react';
import { Package, Lock, Unlock, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
}

interface RampaCardProps {
  rampa: number;
  galpao: number;
  frotaOcupando?: Frota;
  isBloqueada: boolean;
  onToggleBloqueio: (rampa: number, galpao: number) => void;
  onToggleCarregada: (frotaId: string) => void;
  onRemoverFrota: (frotaId: string) => void;
  onFinalizarCarregamento: (frotaId: string) => void;
}

const RampaCard = ({
  rampa,
  galpao,
  frotaOcupando,
  isBloqueada,
  onToggleBloqueio,
  onToggleCarregada,
  onRemoverFrota,
  onFinalizarCarregamento
}: RampaCardProps) => {
  const isOcupada = !!frotaOcupando;
  const isCarregada = frotaOcupando?.carregada;

  return (
    <div
      className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
        isBloqueada
          ? 'bg-red-50 border-red-300'
          : isOcupada 
            ? isCarregada 
              ? 'bg-purple-50 border-purple-300' 
              : 'bg-orange-50 border-orange-300'
            : 'bg-green-50 border-green-300 hover:bg-green-100'
      }`}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-slate-600">
          Rampa {rampa}
        </p>
        {isBloqueada ? (
          <div className="mt-1 space-y-2">
            <Lock className="h-4 w-4 text-red-600 mx-auto" strokeWidth={1.5} />
            <p className="text-xs font-bold text-red-700">BLOQUEADA</p>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs border-red-300"
              onClick={() => onToggleBloqueio(rampa, galpao)}
            >
              <Unlock className="h-3 w-3" />
            </Button>
          </div>
        ) : isOcupada && frotaOcupando ? (
          <div className="mt-1 space-y-2">
            <p className={`text-xs font-bold ${isCarregada ? 'text-purple-700' : 'text-orange-700'}`}>
              {frotaOcupando.numero}
            </p>
            {isCarregada && (
              <div className="flex items-center justify-center">
                <Package className="h-3 w-3 text-purple-600" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex items-center justify-center gap-1">
              <Checkbox
                checked={isCarregada}
                onCheckedChange={() => onToggleCarregada(frotaOcupando.id)}
                className="h-3 w-3"
              />
              <label className="text-xs text-slate-600">Carregada</label>
            </div>
            <div className="flex gap-1">
              {isCarregada ? (
                <Button
                  size="sm"
                  variant="default"
                  className="h-6 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => onFinalizarCarregamento(frotaOcupando.id)}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => onRemoverFrota(frotaOcupando.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-red-300"
                onClick={() => onToggleBloqueio(rampa, galpao)}
              >
                <Lock className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 space-y-2">
            <p className="text-xs text-green-600 font-medium">
              Livre
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs border-red-300"
              onClick={() => onToggleBloqueio(rampa, galpao)}
            >
              <Lock className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RampaCard;
