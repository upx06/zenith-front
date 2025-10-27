import { Menu } from "../../components/Menu";

export const NewScheduling = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Menu />
      <div
        className="hidden lg:block lg:w-64 xl:w-72 shrink-0"
        aria-hidden="true"
      />
    </div>
  );
};
