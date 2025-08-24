import { useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/pages/Home";
import Complete from "./components/Complete";
function App() {
  const approute = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
     {
      path: "/complete/profile",
      element: <Complete />,
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
