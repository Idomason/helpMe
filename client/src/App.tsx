import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import RequestForm from "./components/RequestForm/RequestForm";
import Layout from "./components/Layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
