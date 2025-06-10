
export const validarPlacaBrasileira = (placa: string): { valida: boolean; erro?: string } => {
  // Remove espaços e converte para maiúsculo
  const placaLimpa = placa.replace(/\s/g, '').toUpperCase();
  
  // Padrão antigo: ABC-1234
  const padraoAntigo = /^[A-Z]{3}-?\d{4}$/;
  
  // Padrão Mercosul: ABC1D23
  const padraoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  if (placaLimpa.length === 0) {
    return { valida: false, erro: 'Placa não pode estar vazia' };
  }
  
  if (!padraoAntigo.test(placaLimpa) && !padraoMercosul.test(placaLimpa)) {
    return { valida: false, erro: 'Formato inválido. Use ABC-1234 ou ABC1D23' };
  }
  
  return { valida: true };
};

export const formatarPlaca = (placa: string): string => {
  const placaLimpa = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Se tem 7 caracteres, pode ser Mercosul
  if (placaLimpa.length === 7 && /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placaLimpa)) {
    return placaLimpa;
  }
  
  // Formato antigo com hífen
  if (placaLimpa.length >= 6) {
    return `${placaLimpa.slice(0, 3)}-${placaLimpa.slice(3, 7)}`;
  }
  
  return placa.toUpperCase();
};
