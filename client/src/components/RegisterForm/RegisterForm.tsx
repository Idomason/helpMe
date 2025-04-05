import { Link } from "react-router-dom";
import CustomForm from "../CustomForm/CustomForm";
import { ChangeEvent, FormEvent, useState } from "react";
import { registerFormElements } from "../../constant/constant";
import toast from "react-hot-toast";
import validator from "validator";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type formDataProp = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  termsConditions: boolean;
  role: string;
};

const initialFormData = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  termsConditions: false,
  role: "",
};

export default function RegisterForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormData);
  const btnClass =
    "inline-block w-full rounded bg-[#5d87f0] px-6 py-2 transition-all duration-300 ease-in hover:bg-opacity-70";

  function onFormChange(
    name:
      | string
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    value?: string,
  ) {
    if (typeof name === "string") {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      const { name: fieldName, type, value: fieldValue } = name.target;
      const isCheckbox = type === "checkbox";
      setFormData({
        ...formData,
        [fieldName]: isCheckbox
          ? (name.target as HTMLInputElement).checked
          : fieldValue,
      });
    }
  }

  const { mutate } = useMutation({
    mutationFn: async (formData: formDataProp) => {
      try {
        const response = await fetch("/api/v1/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to register user");

        return data;
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    onError: (error: any) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("User registration successful");
    },
  });

  async function handleSubmit(
    event: FormEvent<HTMLFormElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    event.preventDefault();

    // Validate email address
    const isValidEmail = validator.isEmail(formData.email);

    if (!isValidEmail) throw new Error("Invalid email");

    if (!formData?.termsConditions) {
      throw new Error("Terms & Conditions must checked");
    }

    if (!formData.role) {
      throw new Error("Please select a role to proceed");
    }

    // Send data to DB
    mutate(formData);
    setFormData({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      termsConditions: false,
      role: "",
    });
  }

  return (
    <>
      <div className="absolute left-0 top-0 min-h-screen w-full bg-gradient-to-tr from-helpMe-950 to-black/75"></div>
      <div className="bgImage min-h-screen w-full bg-helpMe-200 px-4 sm:px-6">
        <div className="mx-auto grid min-h-screen w-11/12 justify-center py-2 lg:grid-cols-3 lg:py-1">
          <div className="flex items-center justify-center">
            <div className="z-20 mx-auto max-h-fit rounded bg-[#242323] p-4 py-5 text-white shadow-2xl drop-shadow-2xl lg:w-full xl:px-6">
              <div className="flex w-72 items-center justify-center py-3 lg:w-full">
                <p className="text-[14px] text-[#b6b6b6]/75 lg:px-2 xl:px-4">
                  Request once submitted gets attended to by the appropriate
                  qualified professionals who are ready to willingly render help
                </p>
              </div>
              <div className="flex items-center justify-center">
                <CustomForm
                  formData={formData}
                  onFormData={onFormChange}
                  formControls={registerFormElements}
                  buttonText={"Register"}
                  className={btnClass}
                  onHandleSubmit={handleSubmit}
                />
              </div>
              <div className="flex items-center lg:px-3">
                <hr className="mx-auto my-2 w-1/3 border-t-2 border-[#434141]" />{" "}
                <span className="mx-1 text-xs text-[#b6b6b6]/70">
                  Or Register With
                </span>
                <hr className="mx-auto my-2 w-1/3 border-t-2 border-[#434141]" />
              </div>
              <div className="my-4 flex items-center justify-center space-x-5">
                <button
                  // onClick={() => signInWithGoogle()}
                  className="flex items-center justify-center space-x-3 border border-[#434141] px-6 py-1.5 text-sm tracking-wider transition-all duration-300 ease-in hover:border-white/60"
                >
                  <img
                    className="size-5"
                    src="/images/icons/google.svg"
                    alt="Google Icon"
                  />
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center space-x-3 border border-[#434141] px-6 py-1.5 text-sm tracking-wider transition-all duration-300 ease-in hover:border-white/60">
                  <img
                    className="size-5"
                    src="/images/icons/facebook.svg"
                    alt="Facebook Icon"
                  />
                  <span>Facebook</span>
                </button>
              </div>
              <div className="flex items-center justify-center pb-3.5 pt-2 text-sm">
                <p className="text-[#b6b6b6]/75">
                  Already have an account?{" "}
                  <Link
                    className="text-blue-600 transition-all duration-200 ease-in hover:text-blue-700"
                    to="/login"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
          {/* NOTE */}
          <div className="z-20 col-span-2 flex justify-end px-8">
            <ul className="hidden space-x-4 py-4 lg:flex">
              <li>
                <Link
                  className="text-white transition-colors duration-200 ease-in-out hover:font-semibold hover:text-helpMe-200"
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="text-white transition-colors duration-200 ease-in-out hover:font-semibold hover:text-helpMe-200"
                  to={"/login"}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
