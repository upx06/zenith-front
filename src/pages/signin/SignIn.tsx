import { Mail, Lock, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { SIGN_IN } from "../../graphql/queries/SignIn";
import { useLazyQuery } from "@apollo/client/react";
import { useNavigate } from "react-router";

// Interface para os dados retornados pelo GraphQL
interface SignInData {
  signIn: {
    token: string;
  };
}

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [signIn, { loading: loadingSignIn }] =
    useLazyQuery<SignInData>(SIGN_IN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    try {
      const result = await signIn({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      if (result.data?.signIn?.token) {
        localStorage.setItem("token", result.data.signIn.token);
        navigate("/home");
      } else if (result.error) {
        setError(result.error.message || "Erro ao fazer login");
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setError(error.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img
                src="/logo.jpg"
                alt="REJOY"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Entrar na sua conta
            </h1>
            <p className="text-slate-600 mt-2">Bem-vindo de volta!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loadingSignIn}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loadingSignIn}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            >
              {loadingSignIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
