import React, { useState } from 'react';
import { Warehouse, Plus, Minus, Package, CheckCircle, Filter, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
  rampaDespacho?: number; // Rampa onde estava quando foi despachada
  galpaoDespacho?: number; // Galpão onde estava quando foi despachada
}

interface RampaBloqueada {
  rampa: number;
  galpao: number;
  bloqueada: boolean;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [frotas, setFrotas] = useState<Frota[]>([
    { id: '1', numero: 'CEG-001', status: 'patio' },
    { id: '2', numero: 'CEG-002', status: 'patio' },
    { id: '3', numero: 'CEG-003', status: 'rampa', rampa: 1, galpao: 1, carregada: false },
    { id: '4', numero: 'CEG-004', status: 'rampa', rampa: 5, galpao: 2, carregada: true },
  ]);
  
  const [rampasBloqueadas, setRampasBloqueadas] = useState<RampaBloqueada[]>([]);
  const [novaFrota, setNovaFrota] = useState('');
  const [filtroDespachadas, setFiltroDespachadas] = useState('');

  // Função para bloquear/desbloquear rampa
  const toggleBloqueioRampa = (rampa: number, galpao: number) => {
    const rampaExistente = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    
    if (rampaExistente) {
      // Toggle do bloqueio
      setRampasBloqueadas(prev => 
        prev.map(r => 
          r.rampa === rampa && r.galpao === galpao 
            ? { ...r, bloqueada: !r.bloqueada }
            : r
        )
      );
      
      toast({
        title: rampaExistente.bloqueada ? "Rampa Desbloqueada" : "Rampa Bloqueada",
        description: `Rampa ${rampa} foi ${rampaExistente.bloqueada ? 'desbloqueada' : 'bloqueada'}`,
      });
    } else {
      // Criar novo bloqueio
      setRampasBloqueadas(prev => [...prev, { rampa, galpao, bloqueada: true }]);
      
      toast({
        title: "Rampa Bloqueada",
        description: `Rampa ${rampa} foi bloqueada`,
      });
    }
  };

  // Verificar se rampa está bloqueada
  const rampaEstaBloqueada = (rampa: number, galpao: number) => {
    const rampaBloqueada = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    return rampaBloqueada?.bloqueada || false;
  };

  // Função para alocar frota em uma rampa
  const alocarFrota = (frotaId: string, rampa: number, galpao: number) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'rampa', rampa, galpao, carregada: false }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast({
      title: "Frota Alocada",
      description: `${frota?.numero} foi alocada na Rampa ${rampa}, Vão ${galpao}`,
    });
  };

  // Função para remover frota da rampa (apenas para frotas não carregadas)
  const removerFrota = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'patio', rampa: undefined, galpao: undefined, carregada: undefined }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast({
      title: "Frota Removida",
      description: `${frota?.numero} retornou ao pátio`,
    });
  };

  // Função para finalizar carregamento e despachar frota
  const finalizarCarregamento = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { 
            ...frota, 
            status: 'despachada', 
            rampaDespacho: frota.rampa,
            galpaoDespacho: frota.galpao,
            rampa: undefined, 
            galpao: undefined, 
            carregada: true 
          }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast({
      title: "Carregamento Finalizado",
      description: `${frota?.numero} foi despachada e liberou a rampa ${frota?.rampa}`,
    });
  };

  // Função para marcar/desmarcar frota como carregada
  const toggleCarregada = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, carregada: !frota.carregada }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    const novoStatus = !frota?.carregada;
    
    toast({
      title: novoStatus ? "Frota Carregada" : "Carregamento Removido",
      description: `${frota?.numero} ${novoStatus ? 'foi marcada como carregada' : 'não está mais carregada'}`,
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
  
  // Frotas despachadas (carregadas e finalizadas)
  const frotasDespachadas = frotas.filter(f => f.status === 'despachada');

  // Filtrar frotas despachadas
  const frotasDespachadasFiltradas = frotasDespachadas.filter(frota => 
    frota.numero.toLowerCase().includes(filtroDespachadas.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Frotas</p>
                  <p className="text-3xl font-bold text-slate-800">{frotas.length}</p>
                </div>
                <img 
                  src="/lovable-uploads/f734fecc-7cb6-4a8b-b2ad-e689122a5756.png" 
                  alt="Ícone de caminhão" 
                  className="h-8 w-8" 
                />
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
                  <p className="text-sm font-medium text-slate-600">Carregadas</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {frotas.filter(f => f.carregada).length}
                  </p>
                </div>
                <img 
                  src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                  alt="Ícone de cegonheira carregada" 
                  className="h-8 w-8" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rampas Livres</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {16 - frotas.filter(f => f.status === 'rampa').length - rampasBloqueadas.filter(r => r.bloqueada).length}
                  </p>
                </div>
                <Warehouse className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vãos e Rampas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" strokeWidth={1.5} />
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
                          const isCarregada = frotaOcupando?.carregada;
                          const isBloqueada = rampaEstaBloqueada(rampa, galpao);
                          
                          return (
                            <div
                              key={rampa}
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
                                      onClick={() => toggleBloqueioRampa(rampa, galpao)}
                                    >
                                      <Unlock className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : isOcupada ? (
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
                                        onCheckedChange={() => toggleCarregada(frotaOcupando.id)}
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
                                          onClick={() => finalizarCarregamento(frotaOcupando.id)}
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-xs"
                                          onClick={() => removerFrota(frotaOcupando.id)}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs border-red-300"
                                        onClick={() => toggleBloqueioRampa(rampa, galpao)}
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
                                      onClick={() => toggleBloqueioRampa(rampa, galpao)}
                                    >
                                      <Lock className="h-3 w-3" />
                                    </Button>
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
                        <img 
                          src="/lovable-uploads/f734fecc-7cb6-4a8b-b2ad-e689122a5756.png" 
                          alt="Ícone de caminhão" 
                          className="h-4 w-4" 
                        />
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
                  
                  {frotasPatio.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma frota no pátio
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Frotas Despachadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                    alt="Ícone de cegonheira carregada" 
                    className="h-5 w-5" 
                  />
                  Frotas Despachadas
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Filtrar por número da frota..."
                    value={filtroDespachadas}
                    onChange={(e) => setFiltroDespachadas(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {frotasDespachadasFiltradas.map(frota => (
                    <div
                      key={frota.id}
                      className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                            alt="Ícone de cegonheira carregada" 
                            className="h-4 w-4" 
                          />
                          <span className="font-medium text-purple-800">
                            {frota.numero}
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">
                          Carregada
                        </span>
                      </div>
                      {frota.rampaDespacho && (
                        <div className="text-xs text-slate-600">
                          Rampa {frota.rampaDespacho} - Vão {frota.galpaoDespacho}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {frotasDespachadasFiltradas.length === 0 && frotasDespachadas.length > 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma frota encontrada com esse filtro
                    </p>
                  )}
                  
                  {frotasDespachadas.length === 0 && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma frota despachada
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
