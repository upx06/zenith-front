import { Construction } from "lucide-react";
import { Menu } from "../../components/Menu";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center p-8 mt-16 lg:mt-0">
          <div className="text-center max-w-md">
            <Construction className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Módulo em Desenvolvimento
            </h2>
            <p className="text-slate-600">
              Este módulo está sendo desenvolvido e em breve estará disponível.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
