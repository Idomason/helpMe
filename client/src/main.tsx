import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import SidebarContextProvider from "./context/SidebarContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SidebarContextProvider>
      <App />
    </SidebarContextProvider>
  </BrowserRouter>,
);
