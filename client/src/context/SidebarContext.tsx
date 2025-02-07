import { createContext, ReactNode, useState } from "react";

type valueType = {
  openProfile: boolean;
  openSideBar: boolean;
  sidebarToggler: () => void;
  onOpenProfile: () => void;
};

type childrenPropType = {
  children: ReactNode;
};

const initialState = {
  openProfile: false,
  openSideBar: false,
  sidebarToggler: () => {},
  onOpenProfile: () => {},
};

export const SidebarContext = createContext<valueType>(initialState);

export default function SidebarContextProvider({ children }: childrenPropType) {
  const [openSideBar, setOpenSidebar] = useState<boolean>(false);
  const [openProfile, setOpenProfile] = useState<boolean>(false);

  function sidebarToggler() {
    setOpenSidebar((prev) => !prev);
  }

  function onOpenProfile() {
    setOpenProfile((open) => !open);
  }
  return (
    <SidebarContext.Provider
      value={{ openProfile, openSideBar, sidebarToggler, onOpenProfile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
