import Layout from "./components/Layout/Layout";
import { Navigate, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Home from "./components/Home/Home";
import { BrowserRouter } from "react-router-dom";
import SidebarContextProvider from "./context/SidebarContext.tsx";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner/Spinner.tsx";
import Admin from "./pages/Admin/Admin.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import Portfolio from "./pages/Portfolio/Portfolio.tsx";
import FreeHelp from "./pages/FreeHelp/FreeHelp.tsx";
import GiverBoard from "./pages/GiverBoard/GiverBoard.tsx";
import GiveawayGrid from "./components/CurrentGiveawaysCard/GiveawayGrid";
import GiveawayDetails from "./components/GiveawayDetails/GiveawayDetails";
import HelpRequestDetails from "./components/HelpRequestDetails/HelpRequestDetails";
import HelpRequestGrid from "./components/HelpRequestGrid/HelpRequestGrid.tsx";
import { useAuthUser } from "./hooks/useAuthUser.ts";

const toastOptions = {
  success: {
    duration: 3000,
  },
  error: {
    duration: 5000,
  },
  style: {
    fontSize: "16px",
    maxWidth: "500px",
    padding: "16px 24px",
  },
};

function App() {
  const { data: authUser, isLoading } = useAuthUser();

  if (isLoading)
    return (
      <div className="min-h-screen bg-helpMe-950">
        <div>
          <Spinner />;
        </div>
      </div>
    );

  return (
    <>
      <BrowserRouter>
        <SidebarContextProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/all-help-requests" element={<HelpRequestGrid />} />
              <Route path="/giveaways/:id" element={<GiveawayDetails />} />
              <Route path="/requests/:id" element={<HelpRequestDetails />} />
              <Route path="/giver-board" element={<GiverBoard />} />
              <Route path="/free-help/offers" element={<FreeHelp />} />
              <Route path="/free-help" element={<Navigate to="/giver-board" replace />} />
              <Route path="/u/:name" element={<Portfolio />} />
              <Route
                path="/giveaways"
                element={
                  authUser ? <GiveawayGrid /> : <Navigate to={"/login"} />
                }
              />
              <Route
                path="/request"
                element={
                  !authUser ? (
                    <Navigate to="/login" replace />
                  ) : authUser.role === "admin" ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard?tab=requests&new=1" replace />
                  )
                }
              />
              <Route
                path="/account"
                element={
                  !authUser ? (
                    <Navigate to="/login" replace />
                  ) : authUser.role === "admin" ? (
                    <Navigate to="/admin?tab=account" replace />
                  ) : (
                    <Navigate to="/dashboard?tab=account" replace />
                  )
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin canvas (standalone, no site nav/footer) */}
            <Route
              path="/admin"
              element={
                authUser?.role === "admin" ? <Admin /> : <Navigate to={"/"} />
              }
            />

            {/* Unified Dashboard canvas (helper + helpee) */}
            <Route
              path="/dashboard"
              element={authUser ? <Dashboard /> : <Navigate to="/login" />}
            />
            {/* Redirect legacy dashboard routes to the unified canvas */}
            <Route path="/dashboard-helpee" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helpee-request" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helper" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helper-request" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helper-giveaways" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helper-finance" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard-helper-portfolio" element={<Navigate to="/dashboard" replace />} />
            {/*  */}
            <Route
              path="/register"
              element={!authUser ? <Register /> : <Navigate to={"/"} />}
            />
            <Route
              path="/login"
              element={!authUser ? <Login /> : <Navigate to={"/"} />}
            />
          </Routes>

          <Toaster
            position="bottom-right"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={toastOptions}
          />
        </SidebarContextProvider>
      </BrowserRouter>
    </>
  );
}

// What you shall leave behind here is far  more important than what you shall gather here,
// What you are today is far more important than what you would be tomorrow

export default App;
