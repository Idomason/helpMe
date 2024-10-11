import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import RequestForm from "./components/RequestForm/RequestForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<RequestForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
