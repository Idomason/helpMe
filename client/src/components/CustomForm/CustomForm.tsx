import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import CustomInput from "../CustomInput/CustomInput";
import { ICustomForm, IElement } from "../../utils/types";
import { ChangeEvent } from "react";
import clsx from "clsx";
import CustomSelect from "../CustomSelect/CustomSelect";
// import { useForm } from "react-hook-form";

const formTypes = {
  INPUT: "input",
  SELECT: "select",
  TEXTAREA: "textarea",
  CHECKBOX: "checkbox",
};

export default function CustomForm({
  formControls = [],
  formData,
  onFormData,
  onHandleSubmit,
  buttonText,
  className,
}: ICustomForm) {
  // const { register, handleSubmit } = useForm();
  function handleCustomInput(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    onFormData(event);
  }

  function renderFormElement(element: IElement) {
    let content = null;

    const commonProps = {
      name: element.name,
      type: element.type,
      id: element.id,
      label: element.label,
      placeholder: element.placeholder,
      value: element.value,
      onChange: handleCustomInput,
    };

    switch (element.componentType) {
      case formTypes.INPUT:
        content = (
          <CustomInput
            key={commonProps.id || commonProps.name}
            {...commonProps}
            // {...register(commonProps.name)}
          />
        );

        break;
      case formTypes.CHECKBOX:
        content = (
          <CustomCheckbox
            key={commonProps.id || commonProps.name}
            {...commonProps}
            link={element.link}
            checked={formData[commonProps.name] as boolean}
            // {...register(commonProps.name)}
          />
        );
        break;
      case formTypes.SELECT:
        content = (
          <CustomSelect
            key={element.name}
            element={element}
            formData={formData}
            onFormData={onFormData}
          />
        );
        break;

      default:
        content = (
          <CustomInput
            key={commonProps.id || commonProps.name}
            {...commonProps}
            // {...register(commonProps.name)}
          />
        );
        break;
    }

    return content;
  }

  // Determine whether button should be disabled
  const isBtnDisabled =
    buttonText === "Register"
      ? !formData.email ||
        !formData.name ||
        !formData.password ||
        !formData.termsConditions ||
        !formData.role
      : !formData.email || !formData.password;

  return (
    <form className="reduceWidth" onSubmit={onHandleSubmit}>
      {formControls.map((singleElement) => renderFormElement(singleElement))}

      <div className="reduceWidth flex w-80 items-center justify-center py-6">
        <button
          className={clsx(
            className,
            isBtnDisabled && "cursor-not-allowed opacity-50",
          )}
          disabled={isBtnDisabled}
        >
          {buttonText || "Submit"}
        </button>
      </div>
    </form>
  );
}
