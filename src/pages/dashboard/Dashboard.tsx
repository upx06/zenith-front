import { Menu } from "../../components/Menu";
import { useTranslation } from "react-i18next";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Dados mockados
const stats = {
  totalStudents: 245,
  totalTeachers: 18,
  activeClasses: 12,
  upcomingLessons: 38,
};

const weeklyLessonsData = [
  { day: "Seg", aulas: 12 },
  { day: "Ter", aulas: 15 },
  { day: "Qua", aulas: 18 },
  { day: "Qui", aulas: 14 },
  { day: "Sex", aulas: 16 },
  { day: "Sáb", aulas: 8 },
];

const studentsByLevelData = [
  { name: "A1", value: 45, color: "#3b82f6" },
  { name: "A2", value: 52, color: "#8b5cf6" },
  { name: "B1", value: 48, color: "#ec4899" },
  { name: "B2", value: 38, color: "#f59e0b" },
  { name: "C1", value: 35, color: "#10b981" },
  { name: "C2", value: 27, color: "#6366f1" },
];

const attendanceData = [
  { week: "Sem 1", taxa: 85 },
  { week: "Sem 2", taxa: 88 },
  { week: "Sem 3", taxa: 82 },
  { week: "Sem 4", taxa: 90 },
  { week: "Sem 5", taxa: 87 },
  { week: "Sem 6", taxa: 92 },
  { week: "Sem 7", taxa: 89 },
  { week: "Sem 8", taxa: 91 },
];

const teacherLessonsData = [
  { name: "Prof. João Silva", aulas: 24 },
  { name: "Prof. Maria Santos", aulas: 22 },
  { name: "Prof. Pedro Costa", aulas: 18 },
  { name: "Prof. Ana Paula", aulas: 16 },
  { name: "Prof. Carlos Souza", aulas: 14 },
];

const performanceByLevelData = [
  { nivel: "A1", media: 8.2 },
  { nivel: "A2", media: 7.8 },
  { nivel: "B1", media: 7.5 },
  { nivel: "B2", media: 8.0 },
  { nivel: "C1", media: 8.4 },
  { nivel: "C2", media: 8.7 },
];

const languageDistributionData = [
  { name: "Inglês", value: 120, color: "#3b82f6" },
  { name: "Espanhol", value: 85, color: "#f59e0b" },
  { name: "Francês", value: 40, color: "#8b5cf6" },
];

export const Dashboard = () => {
  const { t } = useTranslation();

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
                  {t("dashboard.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">
                  {t("dashboard.subtitle")}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total de Alunos */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {t("dashboard.studentTotal")}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {stats.totalStudents}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        +12% este mês
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total de Professores */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {t("common.common.teachers")}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {stats.totalTeachers}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        +2 este mês
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Turmas em Andamento */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {t("dashboard.activeClasses")}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {stats.activeClasses}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        {t("dashboard.onGoing")}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Aulas Agendadas */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {t("dashboard.scheduledClasses")}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">
                      {stats.upcomingLessons}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-600 font-medium">
                        {t("dashboard.nextWeek")}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aulas por Dia da Semana */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.classesPerDay")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyLessonsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="aulas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribuição de Alunos por Nível */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.studentsPerLevel")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={studentsByLevelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {studentsByLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolução da Presença Média */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.averageAttendance")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[70, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="taxa"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Professores com Mais Aulas */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.teachersMoreClasses")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teacherLessonsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="aulas" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rendimento por Nível */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.averageIncomeByLevel")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceByLevelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="nivel" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="media" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribuição por Idioma */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {t("dashboard.studensByLanguage")}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languageDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
