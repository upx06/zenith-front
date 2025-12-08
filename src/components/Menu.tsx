import { LogOut, Menu as MenuIcon } from "lucide-react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  Calendar1Icon,
  ClipboardCheck,
  ChartNoAxesCombined,
  ClipboardList,
  BarChart3,
  ClockPlus,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Menu = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { id: "home", path: "/home", label: t("menu.home"), icon: Home },
    {
      id: "dashboard",
      path: "/dashboard",
      label: t("menu.dashboard"),
      icon: ChartNoAxesCombined,
    },
    {
      id: "agenda",
      path: "/scheduling",
      label: t("menu.agenda"),
      icon: Calendar1Icon,
    },
    {
      id: "frequencias",
      path: "/frequencies",
      label: t("menu.frequencies"),
      icon: ClipboardCheck,
    },
    {
      id: "relatorios",
      path: "/reports/class",
      label: t("menu.reports"),
      icon: BarChart3,
    },
    {
      id: "avaliacoes",
      path: "/evaluations",
      label: t("menu.evaluations"),
      icon: ClipboardList,
    },
    {
      id: "turmas",
      path: "/classes",
      label: t("menu.classes"),
      icon: BookOpen,
    },
    {
      id: "alunos",
      path: "/students",
      label: t("menu.students"),
      icon: GraduationCap,
    },
    {
      id: "professores",
      path: "/teachers",
      label: t("menu.teachers"),
      icon: Users,
    },
    { id: "sala", path: "/classroom", label: t("menu.classroom"), icon: Home },
    {
      id: "futureFeatures",
      path: "/future-features",
      label: t("menu.futureFeatures"),
      icon: ClockPlus,
    },
  ];

  const handleLogout = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    localStorage.removeItem("token");
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/50 dark:bg-slate-950/50 backdrop-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 xl:w-72 bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-950/50 border-r border-slate-200 dark:border-slate-700 flex-col">
        <div className="flex-1">
          <div className="flex items-center justify-center h-24 border-b border-slate-200 dark:border-slate-700">
            <img
              src="/logo-light.png"
              alt="Logo"
              className="h-30 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-30 w-auto object-contain hidden dark:block"
            />
          </div>

          <nav className="p-3 xl:p-4">
            <ul className="space-y-1 xl:space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm xl:text-base ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 xl:w-5 xl:h-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-3 xl:p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-end items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <NavLink
              to="/"
              onClick={handleLogout}
              className="p-2.5 rounded-lg transition-all duration-200 bg-transparent hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/30"
              title={t("menu.logout")}
            >
              <LogOut className="w-5 h-5 text-red-700 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300 transition-colors" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 shadow-lg dark:shadow-slate-950/50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-700">
            <img
              src="/logo-light.png"
              alt="Logo"
              className="h-25 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-25 w-auto object-contain hidden dark:block"
            />
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <NavLink
              to="/"
              onClick={handleLogout}
              className="p-2.5 rounded-lg transition-all duration-200 bg-transparent hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/30"
              title={t("menu.logout")}
            >
              <LogOut className="w-5 h-5 text-red-700 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300 transition-colors" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center flex-1">
            <img
              src="/logo-light.png"
              alt="Logo"
              className="h-22 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-22 w-auto object-contain hidden dark:block"
            />
          </div>

          <div className="w-9"></div>
        </div>
      </div>
    </>
  );
};
