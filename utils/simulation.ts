import { Vehicle, ServiceType, VehicleStatus } from '../types';

const NAMES = [
  "Carlos Oliveira", "Ana Souza", "Marcos Silva", "Fernanda Lima", "Roberto Santos",
  "Julia Pereira", "Pedro Costa", "Larissa Alves", "Bruno Rocha", "Camila Martins",
  "Rafael Dias", "Patricia Gomes", "Lucas Ferreira", "Mariana Barbosa", "Gustavo Pinto",
  "Amanda Carvalho", "Rodrigo Azevedo", "Beatriz Melo", "Diego Cunha", "Juliana Ribeiro",
  "Felipe Mora", "Renata Teixeira", "Thiago Correia", "Vanessa Lopes", "João Mendes",
  "Gabriela Cardoso", "Paulo Freitas", "Daniela Nogueira", "Eduardo Martins", "Clarissa Dantas"
];

const PLATES_PREFIX = ["ABC", "XYZ", "LMN", "OJL", "KZY", "BRA", "RIO", "SPX"];

const generatePlate = () => {
  const prefix = PLATES_PREFIX[Math.floor(Math.random() * PLATES_PREFIX.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
};

const getRandomService = () => {
  const services = Object.values(ServiceType);
  // Weight CSV slightly higher for testing priority
  if (Math.random() > 0.7) return ServiceType.CSV;
  return services[Math.floor(Math.random() * services.length)];
};

export const generateSimulationData = (): Vehicle[] => {
  return NAMES.map((name, index) => ({
    id: `sim-${Date.now()}-${index}`,
    driverName: name,
    plate: generatePlate(),
    serviceType: getRandomService(),
    status: VehicleStatus.AGUARDANDO,
    timestamp: Date.now() + index * 1000 // Stagger timestamps slightly
  }));
};