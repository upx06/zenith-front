import { LogOut, Menu as MenuIcon } from "lucide-react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Home,
  Calendar1Icon,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";

export const Menu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { id: "home", path: "/home", label: "Início", icon: Home },
    { id: "agenda", path: "/scheduling", label: "Agenda", icon: Calendar1Icon },
    { id: "turmas", path: "/classes", label: "Turmas", icon: BookOpen },
    { id: "alunos", path: "/students", label: "Alunos", icon: GraduationCap },
    { id: "professores", path: "/teachers", label: "Professores", icon: Users },
    { id: "sala", path: "/classroom", label: "Sala de Aula", icon: Home },
  ];

  const handleLogout = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    localStorage.removeItem("token");
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/50 backdrop-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 w-64 xl:w-72 bg-white shadow-lg border-r border-slate-200 flex-col">
        <div className="flex-1">
          <div className="flex items-center justify-center h-24 border-b border-slate-200">
            <img
              src="/logo.jpg"
              alt="REJOY"
              className="h-12 w-auto object-contain"
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
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
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

        <div className="p-3 xl:p-4 border-t border-slate-200">
          <NavLink
            to="/"
            onClick={handleLogout}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm xl:text-base ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`
            }
          >
            <LogOut className="w-4 h-4 xl:w-5 xl:h-5" />
            Desconectar
          </NavLink>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center justify-center h-20 border-b border-slate-200">
            <img
              src="/logo.jpg"
              alt="REJOY"
              className="h-10 w-auto object-contain"
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
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
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

        <div className="p-4 border-t border-slate-200">
          <NavLink
            to="/"
            onClick={handleLogout}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`
            }
          >
            <LogOut className="w-4 h-4 xl:w-5 xl:h-5" />
            Desconectar
          </NavLink>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center flex-1">
            <img
              src="/logo.jpg"
              alt="REJOY"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="w-9"></div>
        </div>
      </div>
    </>
  );
};
