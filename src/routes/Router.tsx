import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import SignIn from "../pages/signin/SignIn";
import { Student } from "../pages/student/Student";

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
  ]);

  return <RouterProvider router={router} />;
};
