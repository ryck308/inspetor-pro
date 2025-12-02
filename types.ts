export enum ServiceType {
  CIV = 'CIV',
  CSV = 'CSV',
  CIPP = 'CIPP',
  LIT = 'LIT',
  LAUDOS = 'LAUDOS',
  DESCONTAMINACAO = 'DESCONTAMINAÇÃO'
}

export enum VehicleStatus {
  AGUARDANDO = 'aguardando',
  EM_INSPECAO = 'em_inspecao',
  FINALIZADO = 'finalizado'
}

export interface Vehicle {
  id: string;
  driverName: string;
  plate: string;
  serviceType: ServiceType;
  status: VehicleStatus;
  timestamp: number;
}

export interface PanelAlert {
  vehicle: Vehicle;
  type: 'calling' | 'finishing';
  timestamp: number;
}

export interface PanelState {
  messageText: string;
  messageVoice: string;
  priority: boolean;
  lastUpdated: number;
}

export interface SystemResponse {
  acao: string;
  painel_tv: {
    mensagem_texto: string;
    mensagem_voz: string;
    prioridade: boolean;
  };
  dados_salvar: {
    nome: string;
    servico: string;
    status: string;
  };
}