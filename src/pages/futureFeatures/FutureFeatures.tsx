import { Menu } from "../../components/Menu";
import {
  Lightbulb,
  FileText,
  Shield,
  BarChart3,
  FolderArchive,
  Clock,
  CheckCircle2,
  Languages,
} from "lucide-react";

interface Feature {
  id: number;
  title: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  icon: any;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Gerar histórico/relatório de alunos em PDF",
    description:
      "Funcionalidade para exportar o histórico completo e relatórios detalhados dos alunos em formato PDF, facilitando o compartilhamento e arquivamento de informações acadêmicas.",
    status: "planned",
    priority: "high",
    icon: FileText,
  },
  {
    id: 2,
    title: "Níveis de acesso no sistema",
    description:
      "Implementar diferentes níveis de permissão (Admin, Professores, Secretaria) para garantir que cada usuário tenha acesso apenas às funcionalidades relevantes ao seu papel.",
    status: "planned",
    priority: "high",
    icon: Shield,
  },
  {
    id: 3,
    title: "Backend do Dashboard",
    description:
      "Desenvolver e integrar o backend completo do dashboard para substituir os dados mockados por informações reais e dinâmicas do sistema.",
    status: "planned",
    priority: "medium",
    icon: BarChart3,
  },
  {
    id: 4,
    title: "Arquivamento de registros de avaliações",
    description:
      "Sistema para armazenar e gerenciar arquivos físicos das avaliações dos alunos, incluindo provas no papel e áudios de provas de listening.",
    status: "planned",
    priority: "medium",
    icon: FolderArchive,
  },
  {
    id: 5,
    title: "Internacionalização",
    description:
      "Internacionalização do sistema para dar suporte a inúmeros idiomas",
    status: "planned",
    priority: "low",
    icon: Languages,
  },
];

const statusConfig = {
  planned: {
    label: "Planejado",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: Clock,
  },
  "in-progress": {
    label: "Em Desenvolvimento",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    icon: Clock,
  },
  completed: {
    label: "Concluído",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
  },
};

const priorityConfig = {
  high: {
    label: "Alta",
    color: "bg-red-100 text-red-700",
  },
  medium: {
    label: "Média",
    color: "bg-amber-100 text-amber-700",
  },
  low: {
    label: "Baixa",
    color: "bg-slate-100 text-slate-700 dark:text-slate-200",
  },
};

export const FutureFeatures = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-row justify-between gap-4 pt-5 md:pt-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase">
                  Features Futuras
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                  Melhorias e funcionalidades planejadas para o sistema
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Roadmap de Desenvolvimento
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Esta página apresenta as funcionalidades que estão no nosso
                    radar para implementação futura. As prioridades podem ser
                    ajustadas conforme as necessidades da instituição.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                const statusInfo = statusConfig[feature.status];
                const StatusIcon = statusInfo.icon;
                const priorityInfo = priorityConfig[feature.priority];

                return (
                  <div
                    key={feature.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-base md:text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800-100">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${priorityInfo.color}`}
                      >
                        Prioridade: {priorityInfo.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
