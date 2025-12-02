import { ServiceType } from './types';

export const SERVICE_OPTIONS = [
  { value: ServiceType.CIV, label: 'CIV' },
  { value: ServiceType.CSV, label: 'CSV (Prioridade)' },
  { value: ServiceType.CIPP, label: 'CIPP' },
  { value: ServiceType.LIT, label: 'LIT' },
  { value: ServiceType.LAUDOS, label: 'LAUDOS' },
  { value: ServiceType.DESCONTAMINACAO, label: 'DESCONTAMINAÇÃO' },
];

export const TABS = {
  RECEPTION: 'recepcao',
  TECHNICIAN: 'tecnico',
  PANEL: 'painel'
} as const;