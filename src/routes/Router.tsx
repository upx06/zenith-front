import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import SignIn from "../pages/signin/SignIn";
import { Student } from "../pages/student/Student";
import { Teacher } from "../pages/teacher/Teacher";
import { Class } from "../pages/class/Class";

export const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <SignIn />,
    },
    {
      path: "/students",
      element: <Student />,
    },
    {
      path: "/teachers",
      element: <Teacher />,
    },
    {
      path: "/classes",
      element: <Class />,
    },
  ]);

  return <RouterProvider router={router} />;
};
