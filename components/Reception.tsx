import React, { useState } from 'react';
import { PlusCircle, Car } from 'lucide-react';
import { ServiceType } from '../types';
import { SERVICE_OPTIONS } from '../constants';

interface ReceptionProps {
  onRegister: (name: string, plate: string, service: ServiceType) => void;
}

export const Reception: React.FC<ReceptionProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [service, setService] = useState<ServiceType>(ServiceType.CIV);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plate.trim()) return;

    onRegister(name, plate, service);
    setSuccessMsg(`Veículo de ${name} (${plate}) registrado com sucesso!`);
    setName('');
    setPlate('');
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-md mx-auto bg-[#002060] p-8 rounded-xl shadow-lg border border-[#0057B8] mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#0057B8] p-3 rounded-full">
          <Car className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Recepção</h2>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-900/50 text-green-200 text-sm rounded-lg border border-green-800">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Condutor</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-[#002870] border border-[#0057B8] rounded-lg focus:ring-2 focus:ring-[#0057B8] focus:border-[#0057B8] outline-none transition-all text-white placeholder-slate-500"
            placeholder="Ex: João da Silva"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Placa do Veículo</label>
          <input
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            className="w-full p-3 bg-[#002870] border border-[#0057B8] rounded-lg focus:ring-2 focus:ring-[#0057B8] focus:border-[#0057B8] outline-none transition-all uppercase text-white placeholder-slate-500"
            placeholder="Ex: ABC-1234"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Serviço</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value as ServiceType)}
            className="w-full p-3 bg-[#002870] border border-[#0057B8] rounded-lg focus:ring-2 focus:ring-[#0057B8] focus:border-[#0057B8] outline-none text-white"
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#002060]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#0057B8] hover:bg-[#004a9e] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Registrar Veículo
        </button>
      </form>
    </div>
  );
};