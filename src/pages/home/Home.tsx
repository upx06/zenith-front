import { Menu } from "../../components/Menu";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-4xl w-full text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4">
                Rejoy | Zenith
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                {t("home.title")}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("home.description")}
              </p>
            </div>

            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                {t("home.startButton")}
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold border border-slate-300 transition-colors">
                {t("home.learnMoreButton")}
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
