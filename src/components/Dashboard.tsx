import React, { useState } from 'react';
import { Truck, Warehouse, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa';
  rampa?: number;
  galpao?: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [frotas, setFrotas] = useState<Frota[]>([
    { id: '1', numero: 'CEG-001', status: 'patio' },
    { id: '2', numero: 'CEG-002', status: 'patio' },
    { id: '3', numero: 'CEG-003', status: 'rampa', rampa: 1, galpao: 1 },
    { id: '4', numero: 'CEG-004', status: 'rampa', rampa: 5, galpao: 2 },
  ]);
  
  const [novaFrota, setNovaFrota] = useState('');

  // Função para alocar frota em uma rampa
  const alocarFrota = (frotaId: string, rampa: number, galpao: number) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'rampa', rampa, galpao }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast({
      title: "Frota Alocada",
      description: `${frota?.numero} foi alocada na Rampa ${rampa}, Vão ${galpao}`,
    });
  };

  // Função para remover frota da rampa
  const removerFrota = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'patio', rampa: undefined, galpao: undefined }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast({
      title: "Frota Removida",
      description: `${frota?.numero} retornou ao pátio`,
    });
  };

  // Função para adicionar nova frota
  const adicionarFrota = () => {
    if (!novaFrota.trim()) return;
    
    const novaFrotaObj: Frota = {
      id: Date.now().toString(),
      numero: novaFrota.toUpperCase(),
      status: 'patio'
    };
    
    setFrotas(prev => [...prev, novaFrotaObj]);
    setNovaFrota('');
    
    toast({
      title: "Frota Adicionada",
      description: `${novaFrotaObj.numero} adicionada ao pátio`,
    });
  };

  // Verifica se uma rampa está ocupada
  const rampaOcupada = (rampa: number, galpao: number) => {
    return frotas.find(f => f.rampa === rampa && f.galpao === galpao);
  };

  // Frotas disponíveis no pátio
  const frotasPatio = frotas.filter(f => f.status === 'patio');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Sistema de Gestão de Frotas
          </h1>
          <p className="text-slate-600">
            Controle de cegonheiras no pátio e rampas de carregamento
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Frotas</p>
                  <p className="text-3xl font-bold text-slate-800">{frotas.length}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">No Pátio</p>
                  <p className="text-3xl font-bold text-green-600">{frotasPatio.length}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Em Rampas</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {frotas.filter(f => f.status === 'rampa').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rampas Livres</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {16 - frotas.filter(f => f.status === 'rampa').length}
                  </p>
                </div>
                <Warehouse className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galpões e Rampas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Vãos e Rampas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(galpao => (
                    <div key={galpao} className="space-y-4">
                      <h3 className="font-semibold text-slate-700 text-center">
                        Vão {galpao}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }, (_, i) => {
                          const rampa = (galpao - 1) * 4 + i + 1;
                          const frotaOcupando = rampaOcupada(rampa, galpao);
                          const isOcupada = !!frotaOcupando;
                          
                          return (
                            <div
                              key={rampa}
                              className={`relative p-3 rounded-lg border-2 transition-all duration-200 ${
                                isOcupada 
                                  ? 'bg-orange-50 border-orange-300' 
                                  : 'bg-green-50 border-green-300 hover:bg-green-100'
                              }`}
                            >
                              <div className="text-center">
                                <p className="text-xs font-medium text-slate-600">
                                  Rampa {rampa}
                                </p>
                                {isOcupada ? (
                                  <div className="mt-1">
                                    <p className="text-xs font-bold text-orange-700">
                                      {frotaOcupando.numero}
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="mt-1 h-6 text-xs"
                                      onClick={() => removerFrota(frotaOcupando.id)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <p className="text-xs text-green-600 font-medium">
                                      Livre
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-6">
            {/* Adicionar Frota */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Adicionar Frota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: CEG-005"
                    value={novaFrota}
                    onChange={(e) => setNovaFrota(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={adicionarFrota}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Frotas no Pátio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frotas no Pátio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {frotasPatio.map(frota => (
                    <div
                      key={frota.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          {frota.numero}
                        </span>
                      </div>
                      <select
                        className="text-sm border rounded px-2 py-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [rampa, galpao] = e.target.value.split('-').map(Number);
                            alocarFrota(frota.id, rampa, galpao);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Alocar</option>
                        {Array.from({ length: 16 }, (_, i) => {
                          const rampa = i + 1;
                          const galpao = Math.ceil(rampa / 4);
                          const ocupada = rampaOcupada(rampa, galpao);
                          
                          if (ocupada) return null;
                          
                          return (
                            <option key={rampa} value={`${rampa}-${galpao}`}>
                              Rampa {rampa} (V{galpao})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ))}
                  
                  {frotasPatio.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma frota no pátio
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
