import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, PanelAlert, VehicleStatus, ServiceType } from '../types';

interface PanelProps {
  vehicles: Vehicle[];
  currentAlert: PanelAlert | null;
}

// Display order matching the screenshot specifically
const STATS_ORDER = [
  { type: ServiceType.DESCONTAMINACAO, label: 'DESCONTAMINAÇÃO' },
  { type: ServiceType.CIV, label: 'CIV' },
  { type: ServiceType.CSV, label: 'CSV' },
  { type: ServiceType.CIPP, label: 'CIPP' },
  { type: ServiceType.LAUDOS, label: 'LAUDO' },
  { type: ServiceType.LIT, label: 'LIT' },
];

type ViewState = 'ALERT' | 'STATS' | 'WAITING';

export const Panel: React.FC<PanelProps> = ({ vehicles, currentAlert }) => {
  // State Machine: Start with STATS (Step 1 of standard cycle)
  const [view, setView] = useState<ViewState>('STATS');
  const [lastProcessedAlertTime, setLastProcessedAlertTime] = useState<number>(0);

  // --- Logic 1: Interrupt Handler (New Alerts) ---
  useEffect(() => {
    if (currentAlert && currentAlert.timestamp > lastProcessedAlertTime) {
      setLastProcessedAlertTime(currentAlert.timestamp);

      // Rule: "Quando o sistema receber um comando de 'CHAMAR VEÍCULO'"
      // -> "Mostrar APENAS a imagem 'chamar_veiculo'"
      if (currentAlert.type === 'calling') {
        setView('ALERT');
      }
      // Note: We ignore 'finishing' events for visual changes, allowing the cycle to continue.
    }
  }, [currentAlert, lastProcessedAlertTime]);

  // --- Logic 2: Cycle Timer Engine ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (view === 'ALERT') {
      // Rule: "Duração EXATA: 50 segundos"
      // Rule: "Após os 50 segundos, entrar no CICLO PADRÃO... 1 Mostrar 'ultimas_chamadas'"
      timer = setTimeout(() => {
        setView('STATS');
      }, 50000);
    } 
    else if (view === 'STATS') {
      // Rule: "Mostrar 'ultimas_chamadas' por EXATOS 60 segundos"
      // Then go to Step 2 ('proximas_chamadas')
      timer = setTimeout(() => {
        setView('WAITING');
      }, 60000);
    } 
    else if (view === 'WAITING') {
      // Rule: "Mostrar 'proximas_chamadas' por EXATOS 60 segundos"
      // Then go back to Step 1 ('ultimas_chamadas')
      timer = setTimeout(() => {
        setView('STATS');
      }, 60000);
    }

    return () => clearTimeout(timer);
  }, [view]); // Re-runs whenever 'view' changes, effectively creating the loop

  // --- Data Preparation ---

  const waitingVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === VehicleStatus.AGUARDANDO);
  }, [vehicles]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach(v => {
      if (v.status !== VehicleStatus.AGUARDANDO) {
        counts[v.serviceType] = (counts[v.serviceType] || 0) + 1;
      }
    });

    return STATS_ORDER.map(item => ({
      label: item.label,
      value: item.type,
      count: counts[item.type] || 0
    }));
  }, [vehicles]);

  // --- Render based on View State ---

  // 1. Imagem "chamar_veiculo"
  if (view === 'ALERT' && currentAlert) {
    const isPriority = currentAlert.vehicle.serviceType === ServiceType.CSV;

    // Special Layout for CSV (Priority) matching the screenshot layout
    if (isPriority) {
      return (
        <div className="w-full h-full flex flex-col font-sans animate-in fade-in duration-300">
          {/* 1. Header: Black "VEÍCULO" (15%) */}
          <div className="h-[15%] bg-black flex items-center justify-center border-b border-white/10">
            <h1 className="text-[6vh] font-bold text-white uppercase tracking-wider">
              VEÍCULO
            </h1>
          </div>
          
          {/* 2. Plate: Dark Blue (30%) */}
          <div className="h-[30%] bg-[#002060] flex items-center justify-center">
            <h2 className="text-[12vh] font-bold text-white tracking-widest leading-none">
              {currentAlert.vehicle.plate}
            </h2>
          </div>

          {/* 3. Service: Medium Blue (25%) */}
          <div className="h-[25%] bg-[#0057B8] flex items-center justify-center border-y border-white/10">
             <h3 className="text-[10vh] font-bold text-white uppercase">
               {currentAlert.vehicle.serviceType}
             </h3>
          </div>

          {/* 4. Priority: Dark Blue with Red Pill (30%) */}
          <div className="h-[30%] bg-[#002060] flex items-center justify-center">
            <div className="bg-[#D32F2F] text-white px-[8vw] py-[2vh] rounded-full shadow-lg">
              <span className="text-[8vh] font-bold uppercase tracking-wider">
                PRIORIDADE
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Default Layout for Standard Calls
    return (
      <div className="w-full h-full flex flex-col font-sans animate-in fade-in duration-300">
        {/* Header - 15% Height - Black */}
        <div className="h-[15%] bg-black flex items-center justify-center border-b border-white/10">
          <h1 className="text-[6vh] font-bold text-white uppercase tracking-wider">
            VEÍCULO
          </h1>
        </div>
        
        {/* Body - 55% Height - Dark Navy Blue */}
        <div className="h-[55%] bg-[#002060] flex items-center justify-center">
          <h2 className="text-[18vh] font-bold text-white tracking-widest leading-none">
            {currentAlert.vehicle.plate}
          </h2>
        </div>
        
        {/* Footer - 30% Height - Medium Blue */}
        <div className="h-[30%] bg-[#0057B8] flex items-center justify-center border-t border-white/10">
          <h3 className="text-[10vh] font-bold text-white uppercase">
            {currentAlert.vehicle.serviceType}
          </h3>
        </div>
      </div>
    );
  }

  // 2. Imagem "proximas_chamadas" (Waiting List)
  if (view === 'WAITING') {
    // Grid Logic: Ensure exactly 6 rows
    const displayList = [...waitingVehicles];
    while (displayList.length < 6) {
      displayList.push(null as any);
    }
    const fixedList = displayList.slice(0, 6);

    return (
      <div className="w-full h-full flex flex-col bg-white font-sans animate-in fade-in duration-500">
        <div className="bg-black text-white text-center py-6 shadow-md z-10 shrink-0">
          <h1 className="text-[5vh] font-bold uppercase tracking-wide">PRÓXIMAS CHAMADAS</h1>
        </div>
        
        <div className="flex-1 flex flex-col bg-[#002060]">
          {fixedList.map((v, i) => (
            <div 
              key={v ? v.id : `empty-${i}`} 
              className={`flex-1 flex items-center justify-center border-b border-white/20 last:border-b-0 ${
                i % 2 === 0 ? 'bg-[#002060]' : 'bg-[#002870]'
              }`}
            >
              {v ? (
                <span className="text-[6vh] font-bold text-white uppercase truncate px-8">
                  {v.driverName}
                </span>
              ) : (
                <span className="text-white/10 text-4xl font-bold uppercase select-none">-</span>
              )}
            </div>
          ))}
          
          {waitingVehicles.length > 6 && (
            <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-xl font-bold animate-pulse">
              + {waitingVehicles.length - 6} aguardando
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Imagem "ultimas_chamadas" (Statistics)
  // This is the default or 'STATS' view
  return (
    <div className="w-full h-full flex flex-col bg-white font-sans animate-in fade-in duration-500">
      <div className="bg-black text-white text-center py-6 shadow-md z-10 shrink-0">
        <h1 className="text-[5vh] font-bold uppercase tracking-wide">ÚLTIMAS CHAMADAS</h1>
      </div>
      
      <div className="flex-1 flex flex-col bg-[#002060]">
        {stats.map((stat, idx) => (
          <div 
            key={stat.value} 
            className={`flex-1 flex items-center justify-between px-[5vw] border-b border-white/20 last:border-b-0 ${
              idx % 2 === 0 ? 'bg-[#002060]' : 'bg-[#002870]'
            }`}
          >
            <span className="text-[5vh] font-bold text-white uppercase truncate pr-4">
              {stat.label}
            </span>
            <span className="text-[5vh] font-bold text-white tabular-nums">
              {stat.count}
            </span>
          </div>
        ))}
        {/* Fill if < 6 */}
        {stats.length < 6 && Array.from({ length: 6 - stats.length }).map((_, i) => (
           <div 
             key={`empty-stat-${i}`}
             className={`flex-1 bg-[#002060] ${ (stats.length + i) % 2 !== 0 ? 'bg-[#002870]' : '' }`}
           />
        ))}
      </div>
    </div>
  );
};