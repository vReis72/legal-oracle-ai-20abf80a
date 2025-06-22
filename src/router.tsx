
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import Documentos from "./pages/Documentos";
import PecasJuridicas from "./pages/PecasJuridicas";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "documentos",
        element: <Documentos />,
      },
      {
        path: "pecas",
        element: <PecasJuridicas />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
