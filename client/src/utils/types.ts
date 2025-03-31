import { ChangeEvent, FormEvent } from "react";

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
  _id: string;
  name: string;
  image: {
    url: string;
  };
  city: string;
  state: string;
  country: string;
  category: string;
  status: string;
  specificDetails: {
    amount: number;
    deadline: string;
  };
  requestDescription: string;
  createdAt: string;
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
    amount: number;
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
    amount: number;
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
    amount: number;
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

// Questions Data Props
export interface IQuestions {
  question: {
    id: number;
    question: string;
    answer: string;
  };
}

// FormData props
export interface IFormData {
  name?: string;
  email: string;
  password: string;
  termsConditions?: boolean;
  [key: string]: string | undefined | boolean;
}

// CustomForm Props
export type ICustomForm = {
  formControls: IElement[];
  formData: IFormData;
  onFormData: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onHandleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  buttonText: string;
  className: string;
};

// Input Element Props
export interface IElement {
  name: string;
  type: string;
  id: string;
  label?: string;
  link?: string;
  value?: string;
  checked?: boolean;
  onChange?: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onClick?: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  placeholder?: string;
  componentType?: string;
}

export interface IRequest {
  request: {
    id: number;
    item: {
      heading: string;
      detail: string;
    };
    status: string;
    category: string;
    timeline: string;
  };
}

export interface IGiveaway {
  giveaway: {
    id: number;
    item: {
      heading: string;
      detail: string;
    };
    status: string;
    category: string;
    timeline: string;
  };
}

export interface IPayment {
  payment: {
    id: number;
    item: {
      heading: string;
      detail: string;
    };
    status: string;
    category: string;
    timeline: string;
  };
}

// Sidebar data prop
type sidebar = {
  name: string;
  link?: string;
  level?: number;
  icon: React.ReactElement;
};
export type ISidebarDataProp = sidebar[];

// Utility type for MongoDB ObjectId validation
type ObjectId = string & { __objectId?: true }; // Enforces ObjectId format

interface ProfileImage {
  publicId: string | undefined;
  url: string | ArrayBuffer;
}

export interface IUser {
  _id: ObjectId; // Ensures it's a valid MongoDB ObjectId
  name: string;
  email: string;
  role: "helper" | "helpee"; // Restrict to valid roles
  profileImg: ProfileImage;
  helpRequests: ObjectId[]; // Array of valid user IDs (ObjectIds)
  helpsRendered: ObjectId[]; // Array of valid user IDs (ObjectIds)
  createdAt: string | Date; // Can be Date if parsed before use
  updatedAt: string | Date; // Can be Date if parsed before use
  __v: number;
}
