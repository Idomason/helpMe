import { ChangeEvent, FormEvent, useState } from "react";
import CustomForm from "../CustomForm/CustomForm";
import { loginFormElements } from "../../constant/constant";
import AuthLayout from "../AuthLayout/AuthLayout";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ILoginProps = { email: string; password: string };

const initialFormData = {
  email: "",
  password: "",
};

export default function LoginForm() {
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
    mutationFn: async ({ email, password }: ILoginProps) => {
      try {
        const response = await fetch("/api/v1/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to login");
        }
      } catch (error: any) {
        console.log(error);
        throw new Error(error.message);
      }
    },
    onError: (error: any) => toast.error(error.message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
      toast.success("Login successful");
    },
  });

  async function handleSubmit(
    event: FormEvent<HTMLFormElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    event.preventDefault();

    mutate(formData);

    setFormData(initialFormData);
  }

  return (
    <AuthLayout>
      <CustomForm
        formData={formData}
        onFormData={onFormChange}
        formControls={loginFormElements}
        buttonText={"Login"}
        className={btnClass}
        onHandleSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
