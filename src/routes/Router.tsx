import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import SignIn from "../pages/signin/SignIn";

export const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <SignIn />,
    },
  ]);

  return <RouterProvider router={router} />;
};
