import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserPlus, LogOut } from 'lucide-react';
import { Reception } from './components/Reception';
import { Technician } from './components/Technician';
import { Panel } from './components/Panel';
import { Vehicle, ServiceType, VehicleStatus, PanelState, SystemResponse, PanelAlert } from './types';
import { TABS } from './constants';
import { speak } from './services/ttsService';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(TABS.RECEPTION);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Panel State (The "Output" of the system)
  const [panelState, setPanelState] = useState<PanelState>({
    messageText: '',
    messageVoice: '',
    priority: false,
    lastUpdated: Date.now(),
  });

  // Specific state for the visual Panel Alert logic
  const [currentAlert, setCurrentAlert] = useState<PanelAlert | null>(null);

  // Effect to handle TTS whenever panel state changes
  useEffect(() => {
    if (panelState.messageVoice) {
      // Pass the priority flag to the speech service for voice adjustments
      speak(panelState.messageVoice, panelState.priority);
    }
  }, [panelState.lastUpdated]);

  // --- Logic equivalent to the "Brain" prompt ---

  const handleRegisterVehicle = (name: string, plate: string, service: ServiceType) => {
    const newVehicle: Vehicle = {
      id: generateId(),
      driverName: name,
      plate: plate,
      serviceType: service,
      status: VehicleStatus.AGUARDANDO,
      timestamp: Date.now(),
    };

    setVehicles(prev => [...prev, newVehicle]);
  };

  const handleCallVehicle = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    // Update status locally
    const updatedVehicle = { ...vehicle, status: VehicleStatus.EM_INSPECAO };
    setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));

    // Construct "Brain" Logic
    const isPriority = vehicle.serviceType === ServiceType.CSV;
    const isDecon = vehicle.serviceType === ServiceType.DESCONTAMINACAO;

    let msgText = `${vehicle.driverName} apresente seu veículo para o serviço de ${vehicle.serviceType}.`;
    
    // Default voice message
    let msgVoice = `${vehicle.driverName}, apresente seu veículo à área de inspeção para realizar o ${vehicle.serviceType}.`;

    // Special voice message for Descontaminação
    if (isDecon) {
      msgVoice = `${vehicle.driverName}, apresente o seu veículo à área de descontaminação.`;
    }
    // Special voice message for CSV (Priority)
    else if (isPriority) {
      const nameToSpeak = vehicle.driverName.trim() || "condutor";
      msgVoice = `Prioridade, ${nameToSpeak}, apresente seu veículo à área de inspeção para realizar o CSV.`;
    }

    const response: SystemResponse = {
      acao: "chamar",
      painel_tv: {
        mensagem_texto: msgText,
        mensagem_voz: msgVoice,
        prioridade: isPriority
      },
      dados_salvar: {
        nome: vehicle.driverName,
        servico: vehicle.serviceType,
        status: VehicleStatus.EM_INSPECAO
      }
    };

    updatePanel(response);
    
    // Trigger Visual Alert on Panel
    setCurrentAlert({
      vehicle: updatedVehicle,
      type: 'calling',
      timestamp: Date.now()
    });
  };

  const handleFinishVehicle = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    // Update status
    const updatedVehicle = { ...vehicle, status: VehicleStatus.FINALIZADO };
    setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));

    // Construct "Brain" Logic
    const isDecon = vehicle.serviceType === ServiceType.DESCONTAMINACAO;
    
    let msgText = `${vehicle.driverName} retire seu veículo da área de inspeção.`;
    let msgVoice = `${vehicle.driverName}, retire seu veículo da área de inspeção.`;

    if (isDecon) {
      msgText = `${vehicle.driverName} retire seu veículo da área de descontaminação.`;
      msgVoice = `${vehicle.driverName}, retire seu veículo da área de descontaminação.`;
    }

    const response: SystemResponse = {
      acao: "finalizar",
      painel_tv: {
        mensagem_texto: msgText,
        mensagem_voz: msgVoice,
        prioridade: false
      },
      dados_salvar: {
        nome: vehicle.driverName,
        servico: vehicle.serviceType,
        status: VehicleStatus.FINALIZADO
      }
    };

    updatePanel(response);

    // Trigger Visual Alert on Panel
    setCurrentAlert({
      vehicle: updatedVehicle,
      type: 'finishing',
      timestamp: Date.now()
    });
  };

  const updatePanel = (response: SystemResponse) => {
    setPanelState({
      messageText: response.painel_tv.mensagem_texto,
      messageVoice: response.painel_tv.mensagem_voz,
      priority: response.painel_tv.prioridade,
      lastUpdated: Date.now()
    });
  };

  // --- Render Helpers ---

  const renderContent = () => {
    switch (activeTab) {
      case TABS.RECEPTION:
        return <Reception onRegister={handleRegisterVehicle} />;
      case TABS.TECHNICIAN:
        return (
          <Technician 
            vehicles={vehicles.filter(v => v.status !== VehicleStatus.FINALIZADO)} 
            onCall={handleCallVehicle} 
            onFinish={handleFinishVehicle}
          />
        );
      case TABS.PANEL:
        return <Panel vehicles={vehicles} currentAlert={currentAlert} />;
      default:
        return <Reception onRegister={handleRegisterVehicle} />;
    }
  };

  // If we are in Panel mode, we want a full screen experience without the nav bar
  if (activeTab === TABS.PANEL) {
     return (
        <div className="relative h-screen w-screen bg-black overflow-hidden">
           <Panel vehicles={vehicles} currentAlert={currentAlert} />
           <button 
             onClick={() => setActiveTab(TABS.TECHNICIAN)}
             className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white/50 hover:text-white px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 transition-all flex items-center gap-2 z-50 cursor-pointer text-sm"
           >
             <LogOut className="w-3 h-3" />
             <span>Sair</span>
           </button>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#001540] font-sans">
      {/* Navigation */}
      <nav className="bg-[#002060] shadow-md border-b border-[#0057B8] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#0057B8] tracking-tight">INSPETOR<span className="text-white">PRO</span></span>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setActiveTab(TABS.RECEPTION)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === TABS.RECEPTION 
                    ? 'bg-[#0057B8] text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-[#002870]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Recepção
              </button>
              <button
                onClick={() => setActiveTab(TABS.TECHNICIAN)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === TABS.TECHNICIAN 
                    ? 'bg-[#0057B8] text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-[#002870]'
                }`}
              >
                <Users className="w-4 h-4" />
                Técnico
              </button>
              <button
                onClick={() => setActiveTab(TABS.PANEL)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === TABS.PANEL 
                    ? 'bg-[#0057B8] text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-[#002870]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel TV
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
}