import { Mail, Lock, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { SIGN_IN } from "../../graphql/queries/SignIn";
import { GET_USER_BY_EMAIL } from "../../graphql/queries/GetUserByEmail";
import { useLazyQuery } from "@apollo/client/react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useTranslation } from "react-i18next";

interface SignInData {
  signIn: {
    token: string;
  };
}

interface GetUserByEmailData {
  getUserByEmail: {
    id: string;
    email: string;
    active: boolean;
  };
}

export default function SignIn() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const [signIn, { loading: loadingSignIn }] =
    useLazyQuery<SignInData>(SIGN_IN);

  const [getUserByEmail, { loading: loadingGetUser }] =
    useLazyQuery<GetUserByEmailData>(GET_USER_BY_EMAIL);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(t("auth.in.toast.fillInFields"));
      return;
    }

    try {
      const userResult = await getUserByEmail({
        variables: {
          email: formData.email.trim(),
        },
      });

      const user = userResult.data?.getUserByEmail;

      if (user && user.active === false) {
        toast.error(t("auth.in.toast.inactiveAccount"));
        return;
      }

      const result = await signIn({
        variables: {
          email: formData.email.trim(),
          password: formData.password,
        },
      });

      if (result.data?.signIn?.token) {
        localStorage.setItem("token", result.data.signIn.token);
        toast.success(t("auth.in.toast.success"));
        navigate("/home");
      } else if (result.error) {
        toast.error(t("auth.in.toast.emailPassInvalid"));
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      const errorsList = error.errors || error.graphQLErrors;

      if (errorsList && errorsList.length > 0) {
        const graphQLError = errorsList[0];
        const errorCode = graphQLError.extensions?.code || graphQLError.code;

        if (
          errorCode === "authentication_failed" ||
          errorCode === "AUTHENTICATION_FAILED"
        ) {
          toast.error(t("auth.in.toast.emailPassInvalid"));
          return;
        }
      }

      const errorMessage = t("auth.in.toast.error");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 sm:hidden z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 overflow-hidden flex flex-col lg:flex-row">
        <div className="lg:w-1/2 bg-slate-50 dark:bg-slate-800 lg:p-12 flex flex-col items-center justify-between">
          <div className="flex-shrink-0 lg:mb-6">
            <img
              src="/logo-light.png"
              alt="Logo"
              className="h-38 lg:h-50 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Logo"
              className="h-38 lg:h-50 w-auto object-contain hidden dark:block"
            />
          </div>

          <div className="flex-grow items-center justify-center w-full hidden sm:block">
            <img
              src="/signin-light-1.png"
              alt="Instituição"
              className="w-full h-auto object-contain max-h-90 dark:hidden"
            />
            <img
              src="/signin-dark-1.png"
              alt="Instituição"
              className="w-full h-auto object-contain max-h-90 hidden dark:block"
            />
          </div>
        </div>

        <div className="lg:w-1/2 bg-white dark:bg-slate-900 p-8 lg:p-12 flex items-center justify-center relative">
          <div className="absolute top-4 right-4 hidden sm:block">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            <div className="mb-8 hidden sm:block">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("auth.in.title")}
              </h2>
              <p className="text-gray-600 dark:text-slate-300">
                {t("auth.in.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  {t("auth.in.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("auth.in.emailPlaceholder")}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignIn || loadingGetUser}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1.5"
                >
                  {t("auth.in.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("auth.in.passwordPlaceholder")}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors outline-none text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    disabled={loadingSignIn || loadingGetUser}
                    autoComplete="off"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingSignIn || loadingGetUser}
                className="w-full border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 py-2.5 px-4 rounded-md cursor-pointer flex items-center justify-center gap-2 transition-colors font-medium text-sm shadow-sm dark:shadow-blue-900/20"
              >
                {loadingSignIn || loadingGetUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.in.signingIn")}
                  </>
                ) : (
                  t("auth.in.signInButton")
                )}
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400">
                    {t("auth.in.noAccount")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/sign-up")}
                className="w-full border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 py-2.5 px-4 rounded-md cursor-pointer font-medium transition-colors text-sm"
              >
                {t("auth.in.createAccount")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
