import { Mail, Lock, User, Loader2, EyeOff, Eye } from "lucide-react";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router";
import { CREATE_USER } from "../../graphql/mutations/create/CreateUser";
import toast from "react-hot-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Brand Section */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col items-center justify-between">
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
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Criar Conta
              </h2>
              <p className="text-gray-600">
                Preencha os campos abaixo para criar sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors outline-none text-sm"
                    disabled={loadingSignUp}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors outline-none text-sm"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors outline-none text-sm"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    placeholder="Digite a senha novamente"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-colors outline-none text-sm"
                    disabled={loadingSignUp}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 transition-colors font-medium text-sm"
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
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500">
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 px-4 rounded-md cursor-pointer font-medium transition-colors text-sm"
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
