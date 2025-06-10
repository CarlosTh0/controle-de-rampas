
import React, { useState, useEffect, useRef } from 'react';
import { Warehouse, Plus, Moon, Sun, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Frota, RampaBloqueada, Movimentacao, Configuracao } from '../types';
import { 
  salvarFrotas, 
  carregarFrotas, 
  salvarRampasBloqueadas, 
  carregarRampasBloqueadas,
  salvarMovimentacoes,
  carregarMovimentacoes,
  salvarConfiguracao,
  carregarConfiguracao
} from '../utils/localStorage';
import { validarPlacaBrasileira, formatarPlaca } from '../utils/validation';
import { calcularTempoDecorrido } from '../utils/timeUtils';
import { exportarRelatorioCSV } from '../utils/exportUtils';
import StatsCard from './StatsCard';
import RampaCard from './RampaCard';
import FrotasPatio from './FrotasPatio';
import GestaoVaos from './GestaoVaos';
import HistoricoMovimentacoes from './HistoricoMovimentacoes';
import EstatisticasAvancadas from './EstatisticasAvancadas';
import FiltrosAvancados from './FiltrosAvancados';

const Dashboard = () => {
  const { toast } = useToast();
  const novaFrotaInputRef = useRef<HTMLInputElement>(null);
  
  // Estados principais
  const [config, setConfig] = useState<Configuracao>(carregarConfiguracao());
  const [frotas, setFrotas] = useState<Frota[]>(carregarFrotas());
  const [rampasBloqueadas, setRampasBloqueadas] = useState<RampaBloqueada[]>(carregarRampasBloqueadas());
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(carregarMovimentacoes());
  
  // Estados da UI
  const [novaFrota, setNovaFrota] = useState('');
  const [novaPrioridade, setNovaPrioridade] = useState<'alta' | 'normal' | 'baixa'>('normal');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [filtroVao, setFiltroVao] = useState('todos');
  const [filtroDespachadas, setFiltroDespachadas] = useState('');

  // Funções que precisam estar declaradas antes dos hooks que as usam
  const toggleModoEscuro = () => {
    setConfig(prev => ({ ...prev, modoEscuro: !prev.modoEscuro }));
  };

  const exportarRelatorio = () => {
    exportarRelatorioCSV(frotas, movimentacoes);
    toast({
      title: "Relatório Exportado",
      description: "O arquivo CSV foi baixado com sucesso",
    });
  };

  // Efeitos para persistência
  useEffect(() => {
    salvarFrotas(frotas);
  }, [frotas]);

  useEffect(() => {
    salvarRampasBloqueadas(rampasBloqueadas);
  }, [rampasBloqueadas]);

  useEffect(() => {
    salvarMovimentacoes(movimentacoes);
  }, [movimentacoes]);

  useEffect(() => {
    salvarConfiguracao(config);
  }, [config]);

  // Efeito para modo escuro
  useEffect(() => {
    if (config.modoEscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.modoEscuro]);

  // Atalhos de teclado
  useKeyboardShortcuts({
    onAddFrota: () => novaFrotaInputRef.current?.focus(),
    onToggleSearch: () => setBusca(''),
    onExportReport: exportarRelatorio,
    onToggleDarkMode: toggleModoEscuro
  });

  // Funções utilitárias
  const adicionarMovimentacao = (frotaId: string, frotaNumero: string, acao: Movimentacao['acao'], detalhes: string, rampa?: number, galpao?: number) => {
    const novaMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      frotaId,
      frotaNumero,
      acao,
      detalhes,
      timestamp: new Date(),
      rampa,
      galpao
    };
    
    setMovimentacoes(prev => [novaMovimentacao, ...prev].slice(0, 100)); // Mantém apenas as últimas 100
  };

  const updateConfig = (vaos: number, rampas: number) => {
    // Remove frotas que estão em rampas que não existem mais
    setFrotas(prev => prev.map(frota => {
      if (frota.status === 'rampa' && frota.rampa && frota.galpao) {
        const novaRampa = (frota.galpao - 1) * rampas + (frota.rampa - 1) % rampas + 1;
        if (frota.galpao > vaos || novaRampa > rampas * vaos) {
          const frotaAtualizada = { 
            ...frota, 
            status: 'patio' as const, 
            rampa: undefined, 
            galpao: undefined, 
            carregada: undefined,
            ultimaMovimentacao: new Date()
          };
          adicionarMovimentacao(frota.id, frota.numero, 'removida', 'Removida por reconfiguração de vãos');
          return frotaAtualizada;
        }
      }
      return frota;
    }));

    // Remove bloqueios de rampas que não existem mais
    setRampasBloqueadas(prev => 
      prev.filter(r => r.galpao <= vaos && r.rampa <= rampas * vaos)
    );

    setConfig(prev => ({ ...prev, totalVaos: vaos, rampasPorVao: rampas }));
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
      
      adicionarMovimentacao('', `Rampa ${rampa}`, rampaExistente.bloqueada ? 'desbloqueio' : 'bloqueio', 
        `Rampa ${rampa} (Vão ${galpao}) ${rampaExistente.bloqueada ? 'desbloqueada' : 'bloqueada'}`, rampa, galpao);
      
      toast({
        title: rampaExistente.bloqueada ? "Rampa Desbloqueada" : "Rampa Bloqueada",
        description: `Rampa ${rampa} foi ${rampaExistente.bloqueada ? 'desbloqueada' : 'bloqueada'}`,
      });
    } else {
      setRampasBloqueadas(prev => [...prev, { rampa, galpao, bloqueada: true }]);
      adicionarMovimentacao('', `Rampa ${rampa}`, 'bloqueio', `Rampa ${rampa} (Vão ${galpao}) bloqueada`, rampa, galpao);
      
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
    const agora = new Date();
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'rampa', rampa, galpao, carregada: false, ultimaMovimentacao: agora }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    if (frota) {
      adicionarMovimentacao(frotaId, frota.numero, 'alocada', `Alocada na Rampa ${rampa}, Vão ${galpao}`, rampa, galpao);
    }
    
    toast({
      title: "Frota Alocada",
      description: `${frota?.numero} foi alocada na Rampa ${rampa}, Vão ${galpao}`,
    });
  };

  const removerFrota = (frotaId: string) => {
    const agora = new Date();
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'patio', rampa: undefined, galpao: undefined, carregada: undefined, ultimaMovimentacao: agora }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    if (frota) {
      adicionarMovimentacao(frotaId, frota.numero, 'removida', `Removida da Rampa ${frota.rampa}, retornou ao pátio`);
    }
    
    toast({
      title: "Frota Removida",
      description: `${frota?.numero} retornou ao pátio`,
    });
  };

  const finalizarCarregamento = (frotaId: string) => {
    const frota = frotas.find(f => f.id === frotaId);
    if (!frota) return;

    const agora = new Date();
    const tempoCarregamento = Math.floor((agora.getTime() - frota.ultimaMovimentacao.getTime()) / (1000 * 60));
    
    setFrotas(prev => prev.map(f => 
      f.id === frotaId 
        ? { 
            ...f, 
            status: 'despachada', 
            rampaDespacho: f.rampa,
            galpaoDespacho: f.galpao,
            rampa: undefined, 
            galpao: undefined, 
            carregada: true,
            tempoCarregamento,
            ultimaMovimentacao: agora
          }
        : f
    ));
    
    adicionarMovimentacao(frotaId, frota.numero, 'despachada', 
      `Despachada da Rampa ${frota.rampa}, tempo de carregamento: ${Math.floor(tempoCarregamento / 60)}h ${tempoCarregamento % 60}m`);
    
    toast({
      title: "Carregamento Finalizado",
      description: `${frota.numero} foi despachada e liberou a rampa ${frota.rampa}`,
    });
  };

  const toggleCarregada = (frotaId: string) => {
    const agora = new Date();
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, carregada: !frota.carregada, ultimaMovimentacao: agora }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    const novoStatus = !frota?.carregada;
    
    if (frota) {
      adicionarMovimentacao(frotaId, frota.numero, 'carregada', 
        novoStatus ? 'Marcada como carregada' : 'Carregamento removido');
    }
    
    toast({
      title: novoStatus ? "Frota Carregada" : "Carregamento Removido",
      description: `${frota?.numero} ${novoStatus ? 'foi marcada como carregada' : 'não está mais carregada'}`,
    });
  };

  const adicionarFrota = async () => {
    if (!novaFrota.trim()) return;
    
    setIsLoading(true);
    
    const placaFormatada = formatarPlaca(novaFrota);
    const validacao = validarPlacaBrasileira(placaFormatada);
    
    if (!validacao.valida) {
      toast({
        title: "Placa Inválida",
        description: validacao.erro,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Verificar duplicata
    if (frotas.some(f => f.numero === placaFormatada)) {
      toast({
        title: "Frota Duplicada",
        description: "Esta frota já existe no sistema",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    const agora = new Date();
    const novaFrotaObj: Frota = {
      id: Date.now().toString(),
      numero: placaFormatada,
      status: 'patio',
      prioridade: novaPrioridade,
      criadoEm: agora,
      ultimaMovimentacao: agora
    };
    
    setFrotas(prev => [...prev, novaFrotaObj]);
    adicionarMovimentacao(novaFrotaObj.id, novaFrotaObj.numero, 'criada', 
      `Frota criada com prioridade ${novaPrioridade}`);
    
    setNovaFrota('');
    setNovaPrioridade('normal');
    setIsLoading(false);
    
    toast({
      title: "Frota Adicionada",
      description: `${novaFrotaObj.numero} adicionada ao pátio`,
    });
  };

  const rampaOcupada = (rampa: number, galpao: number) => {
    return frotas.find(f => f.rampa === rampa && f.galpao === galpao);
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroStatus('todos');
    setFiltroPrioridade('todas');
    setFiltroVao('todos');
  };

  // Aplicar filtros
  const frotasFiltradas = frotas.filter(frota => {
    const matchBusca = frota.numero.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || frota.status === filtroStatus;
    const matchPrioridade = filtroPrioridade === 'todas' || frota.prioridade === filtroPrioridade;
    const matchVao = filtroVao === 'todos' || frota.galpao?.toString() === filtroVao;
    
    return matchBusca && matchStatus && matchPrioridade && matchVao;
  });

  const frotasPatio = frotasFiltradas.filter(f => f.status === 'patio');
  const frotasDespachadas = frotasFiltradas.filter(f => f.status === 'despachada')
    .filter(frota => frota.numero.toLowerCase().includes(filtroDespachadas.toLowerCase()));

  const totalRampas = config.totalVaos * config.rampasPorVao;

  // Verificar alertas (frotas há muito tempo no mesmo estado)
  const frotasComAlerta = frotas.filter(frota => {
    const tempoDecorrido = (new Date().getTime() - frota.ultimaMovimentacao.getTime()) / (1000 * 60);
    return tempoDecorrido > config.tempoAlertaMinutos;
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${config.modoEscuro ? 'dark bg-slate-900' : 'bg-slate-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header com modo escuro */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Sistema de Gestão de Frotas
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Controle de cegonheiras no pátio e rampas de carregamento
            </p>
            
            {frotasComAlerta.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ {frotasComAlerta.length} frota(s) há mais de {Math.floor(config.tempoAlertaMinutos / 60)}h no mesmo estado
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleModoEscuro}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {config.modoEscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {config.modoEscuro ? 'Modo Claro' : 'Modo Escuro'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-xs"
              title="Atalhos: Ctrl+N (Nova frota), Ctrl+F (Busca), Ctrl+E (Exportar), Ctrl+D (Modo escuro)"
            >
              <Keyboard className="h-4 w-4" />
              Atalhos
            </Button>
          </div>
        </div>

        {/* Estatísticas Avançadas */}
        <div className="mb-8">
          <EstatisticasAvancadas 
            frotas={frotas} 
            movimentacoes={movimentacoes} 
            totalVaos={config.totalVaos} 
          />
        </div>

        {/* Stats Cards Originais */}
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
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="h-5 w-5 bg-green-600 rounded-full"></div>
              </div>
            }
          />

          <StatsCard
            title="Em Rampas"
            value={frotas.filter(f => f.status === 'rampa').length}
            textColor="text-orange-600"
            icon={
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
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
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Warehouse className="h-5 w-5" strokeWidth={1.5} />
                  Vãos e Rampas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: config.totalVaos }, (_, galpaoIndex) => {
                    const galpao = galpaoIndex + 1;
                    return (
                      <div key={galpao} className="space-y-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                          Vão {galpao}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: config.rampasPorVao }, (_, rampaIndex) => {
                            const rampa = (galpao - 1) * config.rampasPorVao + rampaIndex + 1;
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
                                tempoAlerta={config.tempoAlertaMinutos}
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
            {/* Filtros Avançados */}
            <FiltrosAvancados
              busca={busca}
              setBusca={setBusca}
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
              filtroPrioridade={filtroPrioridade}
              setFiltroPrioridade={setFiltroPrioridade}
              filtroVao={filtroVao}
              setFiltroVao={setFiltroVao}
              onExportar={exportarRelatorio}
              onLimparFiltros={limparFiltros}
              totalVaos={config.totalVaos}
            />

            {/* Gestão de Vãos */}
            <GestaoVaos
              totalVaos={config.totalVaos}
              rampasPorVao={config.rampasPorVao}
              onUpdateConfig={updateConfig}
            />

            {/* Adicionar Frota com Prioridade */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Adicionar Frota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={novaFrotaInputRef}
                    placeholder="Ex: ABC-1234 ou ABC1D23"
                    value={novaFrota}
                    onChange={(e) => setNovaFrota(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarFrota()}
                    className="dark:bg-slate-700 dark:border-slate-600"
                  />
                  
                  <select
                    value={novaPrioridade}
                    onChange={(e) => setNovaPrioridade(e.target.value as 'alta' | 'normal' | 'baixa')}
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="baixa">Prioridade Baixa</option>
                    <option value="normal">Prioridade Normal</option>
                    <option value="alta">Prioridade Alta</option>
                  </select>
                  
                  <Button 
                    onClick={adicionarFrota} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Adicionando...' : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Frota
                      </>
                    )}
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
              rampasPorVao={config.rampasPorVao}
              tempoAlerta={config.tempoAlertaMinutos}
            />

            {/* Histórico de Movimentações */}
            <HistoricoMovimentacoes movimentacoes={movimentacoes} />

            {/* Frotas Despachadas */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <img 
                    src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                    alt="Ícone de cegonheira carregada" 
                    className="h-8 w-8" 
                  />
                  Frotas Despachadas
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    placeholder="Filtrar por número da frota..."
                    value={filtroDespachadas}
                    onChange={(e) => setFiltroDespachadas(e.target.value)}
                    className="h-8 text-sm dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {frotasDespachadas.map(frota => (
                    <div
                      key={frota.id}
                      className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/lovable-uploads/6607a10f-3288-497b-b69b-f01520b3c275.png" 
                            alt="Ícone de cegonheira carregada" 
                            className="h-5 w-5" 
                          />
                          <span className="font-medium text-purple-800 dark:text-purple-200">
                            {frota.numero}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            frota.prioridade === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            frota.prioridade === 'baixa' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {frota.prioridade}
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                          {calcularTempoDecorrido(frota.ultimaMovimentacao)} atrás
                        </span>
                      </div>
                      {frota.rampaDespacho && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Rampa {frota.rampaDespacho} - Vão {frota.galpaoDespacho}
                        </div>
                      )}
                      {frota.tempoCarregamento && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Tempo de carregamento: {Math.floor(frota.tempoCarregamento / 60)}h {frota.tempoCarregamento % 60}m
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {frotasDespachadas.length === 0 && frotas.filter(f => f.status === 'despachada').length > 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      Nenhuma frota encontrada com esse filtro
                    </p>
                  )}
                  
                  {frotas.filter(f => f.status === 'despachada').length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
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
