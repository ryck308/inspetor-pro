import React from 'react';
import { Megaphone, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Vehicle, VehicleStatus, ServiceType } from '../types';

interface TechnicianProps {
  vehicles: Vehicle[];
  onCall: (id: string) => void;
  onFinish: (id: string) => void;
}

export const Technician: React.FC<TechnicianProps> = ({ 
  vehicles, 
  onCall, 
  onFinish
}) => {
  const waiting = vehicles.filter(v => v.status === VehicleStatus.AGUARDANDO);
  const inInspection = vehicles.filter(v => v.status === VehicleStatus.EM_INSPECAO);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Waiting List */}
        <div className="bg-[#002060] p-6 rounded-xl shadow-md border border-[#0057B8]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#0057B8] pb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-white">Fila de Espera ({waiting.length})</h2>
          </div>
          
          {waiting.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Nenhum veículo aguardando.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {waiting.map((v) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#002870] rounded-lg border border-[#0057B8] hover:border-[#4080ff] transition-colors">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-bold text-lg text-white">
                      {v.driverName} <span className="text-slate-400 font-normal">({v.plate})</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white bg-green-700 px-2 py-0.5 rounded">
                        {v.serviceType}
                      </span>
                      {v.serviceType === ServiceType.CSV && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-100 bg-red-900/60 px-2 py-0.5 rounded border border-red-800">
                          <AlertTriangle className="w-3 h-3" /> PRIORIDADE
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onCall(v.id)}
                    className="bg-[#0057B8] hover:bg-[#004a9e] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
                  >
                    <Megaphone className="w-4 h-4" />
                    Chamar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In Inspection List - RED THEME */}
        <div className="bg-[#002060] p-6 rounded-xl shadow-md border border-[#0057B8]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#0057B8] pb-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">Em Inspeção ({inInspection.length})</h2>
          </div>

          {inInspection.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Nenhum veículo em inspeção.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {inInspection.map((v) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#2a0a0a] rounded-lg border border-red-900 hover:border-red-700 transition-colors">
                   <div className="mb-3 sm:mb-0">
                    <h3 className="font-bold text-lg text-red-100">
                      {v.driverName} <span className="text-red-300 font-normal">({v.plate})</span>
                    </h3>
                    <span className="text-sm font-medium text-red-100 bg-red-900 px-2 py-0.5 rounded">
                      {v.serviceType}
                    </span>
                  </div>
                  <button
                    onClick={() => onFinish(v.id)}
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Finalizar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}