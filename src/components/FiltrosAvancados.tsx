
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, X } from 'lucide-react';

interface FiltrosAvancadosProps {
  busca: string;
  setBusca: (busca: string) => void;
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
  filtroPrioridade: string;
  setFiltroPrioridade: (prioridade: string) => void;
  filtroVao: string;
  setFiltroVao: (vao: string) => void;
  onExportar: () => void;
  onLimparFiltros: () => void;
  totalVaos: number;
}

const FiltrosAvancados = ({
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  filtroPrioridade,
  setFiltroPrioridade,
  filtroVao,
  setFiltroVao,
  onExportar,
  onLimparFiltros,
  totalVaos
}: FiltrosAvancadosProps) => {
  const temFiltrosAtivos = busca || filtroStatus !== 'todos' || filtroPrioridade !== 'todas' || filtroVao !== 'todos';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros e Pesquisa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por número da frota..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="patio">No Pátio</SelectItem>
              <SelectItem value="rampa">Em Rampas</SelectItem>
              <SelectItem value="despachada">Despachadas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroVao} onValueChange={setFiltroVao}>
            <SelectTrigger>
              <SelectValue placeholder="Vão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Vãos</SelectItem>
              {Array.from({ length: totalVaos }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Vão {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={onExportar} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
          
          {temFiltrosAtivos && (
            <Button onClick={onLimparFiltros} variant="outline" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosAvancados;
