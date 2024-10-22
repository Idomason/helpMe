import Home from "./components/Home/Home";
import Request from "./pages/Request/Request";
import Layout from "./components/Layout/Layout";
import { Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import Register from "./pages/Register/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<Request />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

// What you shall leave behind here is far  more important than what you shall gather here,
// What you are today is far more important than what you would be tomorrow

export default App;
