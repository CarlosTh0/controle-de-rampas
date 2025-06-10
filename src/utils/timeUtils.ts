
export const calcularTempoDecorrido = (inicio: Date): string => {
  const agora = new Date();
  const diferenca = agora.getTime() - inicio.getTime();
  
  const minutos = Math.floor(diferenca / (1000 * 60));
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) {
    return `${dias}d ${horas % 24}h`;
  } else if (horas > 0) {
    return `${horas}h ${minutos % 60}m`;
  } else {
    return `${minutos}m`;
  }
};

export const formatarDuracao = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (horas > 0) {
    return `${horas}h ${mins}m`;
  } else {
    return `${mins}m`;
  }
};
