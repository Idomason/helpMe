import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import RequestForm from "./components/RequestForm/RequestForm";
import Layout from "./components/Layout/Layout";
import NotFoundPage from "./components/NotFoundPage/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestForm />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
