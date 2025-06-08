import React, { useState } from 'react';
import { Warehouse, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import StatsCard from './StatsCard';
import RampaCard from './RampaCard';
import FrotasPatio from './FrotasPatio';
import GestaoVaos from './GestaoVaos';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
  rampaDespacho?: number;
  galpaoDespacho?: number;
}

interface RampaBloqueada {
  rampa: number;
  galpao: number;
  bloqueada: boolean;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [totalVaos, setTotalVaos] = useState(4);
  const [rampasPorVao, setRampasPorVao] = useState(4);
  const [frotas, setFrotas] = useState<Frota[]>([
    { id: '1', numero: 'CEG-001', status: 'patio' },
    { id: '2', numero: 'CEG-002', status: 'patio' },
    { id: '3', numero: 'CEG-003', status: 'rampa', rampa: 1, galpao: 1, carregada: false },
    { id: '4', numero: 'CEG-004', status: 'rampa', rampa: 5, galpao: 2, carregada: true },
  ]);
  
  const [rampasBloqueadas, setRampasBloqueadas] = useState<RampaBloqueada[]>([]);
  const [novaFrota, setNovaFrota] = useState('');
  const [filtroDespachadas, setFiltroDespachadas] = useState('');

  const updateConfig = (vaos: number, rampas: number) => {
    // Remove frotas que estão em rampas que não existem mais
    setFrotas(prev => prev.map(frota => {
      if (frota.status === 'rampa' && frota.rampa && frota.galpao) {
        const novaRampa = (frota.galpao - 1) * rampas + (frota.rampa - 1) % rampas + 1;
        if (frota.galpao > vaos || novaRampa > rampas * vaos) {
          return { ...frota, status: 'patio', rampa: undefined, galpao: undefined, carregada: undefined };
        }
      }
      return frota;
    }));

    // Remove bloqueios de rampas que não existem mais
    setRampasBloqueadas(prev => 
      prev.filter(r => r.galpao <= vaos && r.rampa <= rampas * vaos)
    );

    setTotalVaos(vaos);
    setRampasPorVao(rampas);
  };

  const toggleBloqueioRampa = (rampa: number, galpao: number) => {
    const rampaExistente = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    
    if (rampaExistente) {
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
      setRampasBloqueadas(prev => [...prev, { rampa, galpao, bloqueada: true }]);
      
      toast({
        title: "Rampa Bloqueada",
        description: `Rampa ${rampa} foi bloqueada`,
      });
    }
  };

  const rampaEstaBloqueada = (rampa: number, galpao: number) => {
    const rampaBloqueada = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    return rampaBloqueada?.bloqueada || false;
  };

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

  const rampaOcupada = (rampa: number, galpao: number) => {
    return frotas.find(f => f.rampa === rampa && f.galpao === galpao);
  };

  const frotasPatio = frotas.filter(f => f.status === 'patio');
  const frotasDespachadas = frotas.filter(f => f.status === 'despachada');
  const frotasDespachadasFiltradas = frotasDespachadas.filter(frota => 
    frota.numero.toLowerCase().includes(filtroDespachadas.toLowerCase())
  );

  const totalRampas = totalVaos * rampasPorVao;

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
          <StatsCard
            title="Total de Frotas"
            value={frotas.length}
            icon={
              <img 
                src="/lovable-uploads/f734fecc-7cb6-4a8b-b2ad-e689122a5756.png" 
                alt="Ícone de caminhão" 
                className="h-12 w-12" 
              />
            }
          />

          <StatsCard
            title="No Pátio"
            value={frotasPatio.length}
            textColor="text-green-600"
            icon={
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-green-600 rounded-full"></div>
              </div>
            }
          />

          <StatsCard
            title="Em Rampas"
            value={frotas.filter(f => f.status === 'rampa').length}
            textColor="text-orange-600"
            icon={
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-orange-600 rounded-full"></div>
              </div>
            }
          />

          <StatsCard
            title="Carregadas"
            value={frotas.filter(f => f.carregada).length}
            textColor="text-purple-600"
            icon={
              <img 
                src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                alt="Ícone de cegonheira carregada" 
                className="h-12 w-12" 
              />
            }
          />

          <StatsCard
            title="Rampas Livres"
            value={totalRampas - frotas.filter(f => f.status === 'rampa').length - rampasBloqueadas.filter(r => r.bloqueada).length}
            textColor="text-blue-600"
            icon={<Warehouse className="h-10 w-10 text-blue-600" strokeWidth={1.5} />}
          />
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
                  {Array.from({ length: totalVaos }, (_, galpaoIndex) => {
                    const galpao = galpaoIndex + 1;
                    return (
                      <div key={galpao} className="space-y-4">
                        <h3 className="font-semibold text-slate-700 text-center">
                          Vão {galpao}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: rampasPorVao }, (_, rampaIndex) => {
                            const rampa = (galpao - 1) * rampasPorVao + rampaIndex + 1;
                            const frotaOcupando = rampaOcupada(rampa, galpao);
                            const isBloqueada = rampaEstaBloqueada(rampa, galpao);
                            
                            return (
                              <RampaCard
                                key={rampa}
                                rampa={rampa}
                                galpao={galpao}
                                frotaOcupando={frotaOcupando}
                                isBloqueada={isBloqueada}
                                onToggleBloqueio={toggleBloqueioRampa}
                                onToggleCarregada={toggleCarregada}
                                onRemoverFrota={removerFrota}
                                onFinalizarCarregamento={finalizarCarregamento}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-6">
            {/* Gestão de Vãos */}
            <GestaoVaos
              totalVaos={totalVaos}
              rampasPorVao={rampasPorVao}
              onUpdateConfig={updateConfig}
            />

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
            <FrotasPatio
              frotas={frotasPatio}
              onAlocarFrota={alocarFrota}
              rampaOcupada={rampaOcupada}
              rampaEstaBloqueada={rampaEstaBloqueada}
              totalRampas={totalRampas}
              rampasPorVao={rampasPorVao}
            />

            {/* Frotas Despachadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                    alt="Ícone de cegonheira carregada" 
                    className="h-8 w-8" 
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
                      className="p-3 bg-purple-50 rounded-lg border border-purple-200 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                            alt="Ícone de cegonheira carregada" 
                            className="h-5 w-5" 
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
