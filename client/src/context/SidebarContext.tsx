import { createContext, ReactNode, useState } from "react";

type valueType = {
  openSideBar: boolean;
  sidebarToggler: () => void;
};

type childrenPropType = {
  children: ReactNode;
};

const initialState = {
  openSideBar: false,
  sidebarToggler: () => {},
};

export const SidebarContext = createContext<valueType>(initialState);

export default function SidebarContextProvider({ children }: childrenPropType) {
  const [openSideBar, setOpenSidebar] = useState<boolean>(false);

  function sidebarToggler() {
    setOpenSidebar((prev) => !prev);
  }
  return (
    <SidebarContext.Provider value={{ openSideBar, sidebarToggler }}>
      {children}
    </SidebarContext.Provider>
  );
}
