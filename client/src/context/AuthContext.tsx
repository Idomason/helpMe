import supabase from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { createContext } from "react";

export const AuthContext = createContext(null);

export default function AuthContextProvider({ children }) {
  const navigate = useNavigate();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") navigate("/");
    if (event === "SIGNED_OUT") navigate("/login");
  });
  // Unsubscribe
  subscription?.unsubscribe();

  // Logout
  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error("User logout failed");
  }

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
}
