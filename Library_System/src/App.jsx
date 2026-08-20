import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

import Introduction from "./pages/AuthPage";
import Catalogue from "./pages/CataloguePage";
import AdminPage from "./pages/AdminPage";
import MyBookshelf from "./pages/MyBookShelf";

import NotFound from "./components/common/NotFound";
import SharedLayout from "./components/common/SharedLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Introduction />,
  },

  {
    element: <SharedLayout />,
    children: [
      {
        path: "catalogue",
        element: <Catalogue />,
      },
      {
        path: "bookshelf",
        element: <MyBookshelf />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
