import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Introduction from "./pages/Introduction";
import Catalogue from "./pages/Catalogue";
import NotFound from "./components/NotFound";
import SharedLayout from "./components/SharedLayout";
import BookLoaning from "./pages/BookLoaning";

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
