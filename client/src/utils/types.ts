// Nav-link Types
export interface INavLinks {
  id: number;
  label: string;
  link: string;
}

// MobileNav proptype
export interface IMobileNavProp {
  closeNavbar: () => void;
  isOpen: boolean;
}

// Navbar propType
export interface INavbar {
  openNavbar: () => void;
}

// Feature propType
export interface IFeature {
  feature: {
    id: number;
    title: string;
    body: string;
  };
}
