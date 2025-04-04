import Layout from "./components/Layout/Layout";
import { Navigate, Route, Routes } from "react-router-dom";
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
import { BrowserRouter } from "react-router-dom";
import SidebarContextProvider from "./context/SidebarContext.tsx";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Spinner from "./components/Spinner/Spinner.tsx";
import Account from "./pages/Account/Account.tsx";
import GiveawayGrid from "./components/CurrentGiveawaysCard/GiveawayGrid";
import GiveawayDetails from "./components/GiveawayDetails/GiveawayDetails";
import HelpRequestDetails from "./components/HelpRequestDetails/HelpRequestDetails";
import HelpRequestGrid from "./components/HelpRequestGrid/HelpRequestGrid.tsx";

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
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/v1/users/me");

        if (!response.ok) return null;
        const data = await response.json();

        return data;
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    retry: false,
  });

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
              <Route
                path="/giveaways"
                element={
                  authUser ? <GiveawayGrid /> : <Navigate to={"/login"} />
                }
              />
              <Route
                path="/request"
                element={
                  authUser ? <RequestForm /> : <Navigate to={"/login"} />
                }
              />
              <Route
                path="/account"
                element={authUser ? <Account /> : <Navigate to={"/login"} />}
              />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* Helpee Dashboard Routes */}
            <Route path="/dashboard-helpee" element={""} />
            <Route
              path="/dashboard-helpee-request"
              element={
                authUser ? <HelpeeRequest /> : <Navigate to={"/login"} />
              }
            />

            {/* Helper Dashboard Routes */}
            <Route
              path="/dashboard-helper"
              element={authUser ? <HelperHome /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/dashboard-helper-request"
              element={authUser ? <Request /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/dashboard-helper-giveaways"
              element={authUser ? <Giveaways /> : <Navigate to={"/login"} />}
            />
            <Route
              path="/dashboard-helper-finance"
              element={
                authUser ? <HelperFinance /> : <Navigate to={"/login"} />
              }
            />
            <Route
              path="/dashboard-helper-portfolio"
              element={
                authUser ? <HelperPortfolio /> : <Navigate to={"/login"} />
              }
            />
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
