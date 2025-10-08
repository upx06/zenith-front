import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import SignIn from "../pages/signin/SignIn";
import { Student } from "../pages/student/Student";
import { Teacher } from "../pages/teacher/Teacher";
import { Class } from "../pages/class/Class";
import { Home } from "../pages/home/Home";
import { Scheduling } from "../pages/scheduling/Scheduling";
import { Classroom } from "../pages/classroom/Classroom";

export const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <SignIn />,
    },
    {
      path: "home",
      element: <Home />,
    },
    {
      path: "scheduling",
      element: <Scheduling />,
    },
    {
      path: "classroom",
      element: <Classroom />,
    },
    {
      path: "/teachers",
      element: <Teacher />,
    },
    {
      path: "/students",
      element: <Student />,
    },
    {
      path: "/classes",
      element: <Class />,
    },
  ]);

  return <RouterProvider router={router} />;
};
