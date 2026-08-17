import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

import Introduction from "./pages/AuthPage";
import BookLoaning from "./pages/CartPage";
import Catalogue from "./pages/CataloguePage";
import MyLoans from "./pages/MyLoansPage";

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
        path: "cart",
        element: <BookLoaning />,
      },
      {
        path: "my-loans", //
        element: <MyLoans />,
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
