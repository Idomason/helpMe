import AuthLayout from "../AuthLayout/AuthLayout";
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
};

const initialFormData = {
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  termsConditions: false,
};

export default function RegisterForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialFormData);
  const btnClass = "auth-submit";

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

    // Send data to DB
    mutate(formData);
    setFormData({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      termsConditions: false,
    });
  }

  return (
    <AuthLayout register>
      <CustomForm
        formData={formData}
        onFormData={onFormChange}
        formControls={registerFormElements}
        buttonText={"Register"}
        className={btnClass}
        onHandleSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
