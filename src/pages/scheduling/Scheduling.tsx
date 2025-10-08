import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Menu } from "../../components/Menu";

export const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateDate = (direction: number): void => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 uppercase">
                  Agendamento de Salas
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Gerencie a ocupação das salas por horário
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 md:px-6 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Selecione a Data</span>
                  </div>
                  {isToday(selectedDate) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white">
                      Hoje
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 order-2 md:order-1">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
                      title="Dia anterior"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                    </button>
                    
                    <button
                      onClick={() => navigateDate(1)}
                      className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 transition-all duration-200 group"
                      title="Próximo dia"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
                    </button>
                  </div>

                  <div className="flex-1 text-center order-1 md:order-2">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 capitalize mb-1">
                      {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </div>
                    <div className="text-base md:text-lg text-slate-600 font-medium">
                      {selectedDate.toLocaleDateString('pt-BR', { 
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 order-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={formatDateInput(selectedDate)}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value + 'T12:00:00');
                          setSelectedDate(newDate);
                        }}
                        className="pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 transition-colors cursor-pointer"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <Clock className="h-4 w-4" />
                      Hoje
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};