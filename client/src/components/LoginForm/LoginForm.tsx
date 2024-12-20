import { ChangeEvent, FormEvent, useState } from "react";
import CustomForm from "../CustomForm/CustomForm";
import { loginFormElements } from "../../constant/constant";
import { Link } from "react-router-dom";

const initialFormData = {
  email: "",
  password: "",
};

export default function LoginForm() {
  const [formData, setFormData] = useState(initialFormData);
  const btnClass =
    "inline-block w-full rounded bg-[#5d87f0] px-6 py-2 transition-all duration-300 ease-in hover:bg-opacity-70";

  function onFormChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, type, value } = event.target;

    // Narrow down the type to handle checkbox specifically
    const isCheckbox = type === "checkbox";

    // If it's a checkbox, we use `checked`, otherwise `value`
    setFormData({
      ...formData,
      [name]: isCheckbox ? (event.target as HTMLInputElement).checked : value,
    });
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    event.preventDefault();
    // Perform validation or API submission here
    // if (validateForm(formData)) {
    //   submitForm(formData); // Call the API or submit handler
    // } else {
    //   console.error("Validation failed");
    // }

    // // Example validation function
    // function validateForm(data: typeof initialFormData) {
    //   // Basic validation (e.g., checking required fields)
    //   return data.name && data.email && data.password && data.termsConditions;
    // }

    // Consider implementing client-side validation before
    // submitting. This could be useful for checking required
    // fields, email format, and password strength.
    // A basic example would be using the validateForm
    // function, as shown above.

    console.log(formData);
    // Do API and Database operations

    setFormData(initialFormData);
  }
  return (
    <>
      <div className="absolute left-0 top-0 min-h-screen w-full bg-gradient-to-tr from-helpMe-950 to-black/75"></div>
      <div className="bgImage min-h-screen w-full bg-helpMe-200 px-4 sm:px-6">
        <div className="mx-auto grid min-h-screen w-11/12 justify-center py-2 lg:grid-cols-3 lg:py-1">
          <div className="flex items-center justify-center">
            <div className="z-20 mx-auto max-h-fit rounded bg-[#242323] p-4 py-10 text-white shadow-2xl drop-shadow-2xl lg:w-full xl:px-6">
              <div className="flex w-72 items-center justify-center py-3 lg:w-full">
                <p className="text-[14px] text-[#b6b6b6]/75 lg:px-2 xl:px-4">
                  Login to see the latest happenings in your dashboard and
                  helpMe app in general
                </p>
              </div>
              <div className="flex items-center justify-center">
                <CustomForm
                  formData={formData}
                  onFormData={onFormChange}
                  formControls={loginFormElements}
                  buttonText={"Login"}
                  className={btnClass}
                  onHandleSubmit={handleSubmit}
                />
              </div>
              <div className="flex items-center lg:px-3">
                <hr className="mx-auto my-2 w-1/3 border-t-2 border-[#434141]" />{" "}
                <span className="mx-1 text-xs text-[#b6b6b6]/70">
                  Or Login With
                </span>
                <hr className="mx-auto my-2 w-1/3 border-t-2 border-[#434141]" />
              </div>
              <div className="my-4 flex items-center justify-center space-x-5">
                <button className="flex items-center justify-center space-x-3 border border-[#434141] px-6 py-1.5 text-sm tracking-wider transition-all duration-300 ease-in hover:border-white/60">
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
              <div className="flex items-center justify-center pt-2 text-sm">
                <p className="text-[#b6b6b6]/75">
                  Don't have an account yet?{" "}
                  <Link
                    className="pl-1 text-blue-600 transition-all duration-200 ease-in hover:text-blue-700"
                    to="/register"
                  >
                    Register
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
                  to={"/register"}
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
