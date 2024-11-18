import Layout from "./components/Layout/Layout";
import { Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import Register from "./pages/Register/Register";
import Request from "./pages/dashboard/helperDashboard/Request";
import HelperHome from "./pages/dashboard/helperDashboard/Home";
import Giveaways from "./pages/dashboard/helperDashboard/Giveaways";
import HelperFinance from "./pages/dashboard/helperDashboard/HelperFinance";
import HelperPortfolio from "./pages/dashboard/helperDashboard/HelperPortfolio";
import HelpeeRequest from "./pages/dashboard/helpeeDashboard/HelpeeRequest";
import Login from "./pages/Login/Login";
import Home from "./components/Home/Home";
import RequestForm from "./components/RequestForm/RequestForm";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestForm />} />
          <Route path="*" element={<NotFound />} />

          {/* Helpee Dashboard Routes */}
          <Route path="/dashboard-helpee" element={""} />
          <Route path="/dashboard-helpee-request" element={<HelpeeRequest />} />

          {/* Helper Dashboard Routes */}
          <Route path="/dashboard-helper" element={<HelperHome />} />
          <Route path="/dashboard-helper-request" element={<Request />} />
          <Route path="/dashboard-helper-giveaways" element={<Giveaways />} />
          <Route path="/dashboard-helper-finance" element={<HelperFinance />} />
          <Route
            path="/dashboard-helper-portfolio"
            element={<HelperPortfolio />}
          />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

// What you shall leave behind here is far  more important than what you shall gather here,
// What you are today is far more important than what you would be tomorrow

export default App;
