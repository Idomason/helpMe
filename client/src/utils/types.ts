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

// SliderCard PropType
export interface ISliderCard {
  image: string;
  title: string;
  link: string;
}

// RangeSLider PropTypes
export interface IRangeSliderProp {
  className?: string;
  sliderValue: number;
  onSliderValue: (event: unknown) => void;
}

// Current Medical Help Data
export interface IMedical {
  medical: {
    id: number;
    category: string;
    image: string;
    title: string;
    numberOfVotes: number;
    amount: number;
  };
}

// Current Accident Help Data
export interface IAccident {
  accident: {
    id: number;
    category: string;
    image: string;
    title: string;
    numberOfVotes: number;
  };
}

// Current Disaster Help Data
export interface IDisaster {
  disaster: {
    id: number;
    category: string;
    image: string;
    title: string;
    numberOfVotes: number;
  };
}

// Current Agriculture Help Data
export interface IAgriculture {
  agriculture: {
    id: number;
    category: string;
    image: string;
    title: string;
    numberOfVotes: number;
  };
}

// current Help Data Props
export interface ICurrentHelpDataProp
  extends IMedical,
    IAccident,
    IDisaster,
    IAgriculture {
  allCategories: string[];
}
