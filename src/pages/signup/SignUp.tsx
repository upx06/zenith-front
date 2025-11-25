import { Mail, Lock, User, Loader2, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router";
import { CREATE_USER } from "../../graphql/mutations/create/CreateUser";
import toast from "react-hot-toast";
import { ThemeToggle } from "../../components/ThemeToggle";

interface SignUpData {
  createUser: {
    result: {
      id: string;
    };
  };
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [signUp, { loading: loadingSignUp }] =
    useMutation<SignUpData>(CREATE_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirmation
    ) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      const result = await signUp({
        variables: {
          input: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            passwordConfirmation: formData.passwordConfirmation,
          },
        },
      });

      if (result.data?.createUser?.result?.id) {
        toast.success(
          "Conta criada com sucesso! Entre em contato com o administrador para ativação.",
          {
            duration: 6000,
          }
        );
        setTimeout(() => navigate("/"), 1500);
      } else if (result.error) {
        const errorMessage = result.error?.message || "Erro ao criar conta";

        if (
          errorMessage.includes("already exists") ||
          errorMessage.includes("já existe")
        ) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      const errorMessage = error.message || "Erro ao criar conta";

      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("já existe")
      ) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Brand Section */}
        <div className="lg:w-1/2 bg-white dark:bg-slate-800 p-8 lg:p-12 flex flex-col items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 mb-6">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Image Section */}
          <div className="flex-grow flex items-center justify-center w-full">
            <img
              src="/image2.png"
              alt="Instituição"
              className="w-full h-auto object-contain max-h-96"
            />
            {/* Troque para /image1.png se preferir a outra imagem */}
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="lg:w-1/2 bg-white dark:bg-slate-900 p-8 lg:p-12 flex items-center justify-center relative">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Criar Conta
              </h2>
              <p className="text-gray-600 dark:text-slate-300">
                Preencha os campos abaixo para criar sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignUp}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="passwordConfirmation"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Digite a senha novamente"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingSignUp}
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-400 dark:disabled:bg-red-900 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 transition-colors font-medium text-sm shadow-sm dark:shadow-red-900/20"
              >
                {loadingSignUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400">
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 py-2.5 px-4 rounded-md cursor-pointer font-medium transition-colors text-sm"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
