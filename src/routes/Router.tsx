import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router";
import SignIn from "../pages/signin/SignIn";
import { Student } from "../pages/student/Student";
import { Teacher } from "../pages/teacher/Teacher";
import { Class } from "../pages/class/Class";
import { Home } from "../pages/home/Home";
import { Scheduling } from "../pages/scheduling/Scheduling";
import { Classroom } from "../pages/classroom/Classroom";
import { Frequency } from "../pages/frequency/Frequency";
import { ClassReport } from "../pages/reports/ClassReport";
import SignUp from "../pages/signup/SignUp";
import type { ReactNode } from "react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token") || null;

  return token ? children : <Navigate to="/" replace />;
};

export const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <SignIn />,
    },
    {
      path: "/sign-up",
      element: <SignUp />,
    },
    {
      path: "home",
      element: (
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      ),
    },
    {
      path: "scheduling",
      element: (
        <PrivateRoute>
          <Scheduling />
        </PrivateRoute>
      ),
    },
    {
      path: "classroom",
      element: (
        <PrivateRoute>
          <Classroom />
        </PrivateRoute>
      ),
    },
    {
      path: "teachers",
      element: (
        <PrivateRoute>
          <Teacher />
        </PrivateRoute>
      ),
    },
    {
      path: "students",
      element: (
        <PrivateRoute>
          <Student />
        </PrivateRoute>
      ),
    },
    {
      path: "classes",
      element: (
        <PrivateRoute>
          <Class />
        </PrivateRoute>
      ),
    },
    {
      path: "frequencies",
      element: (
        <PrivateRoute>
          <Frequency />
        </PrivateRoute>
      ),
    },
    {
      path: "reports/class",
      element: (
        <PrivateRoute>
          <ClassReport />
        </PrivateRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};
