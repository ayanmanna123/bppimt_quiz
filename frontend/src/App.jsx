import { useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/pages/Home";
import Complete from "./components/Complete";
import Quiz from "./components/pages/Quiz";
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
     {
      path: "/quiz",
      element: <Quiz/>
    },
  ]);

  return (
    <>
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
