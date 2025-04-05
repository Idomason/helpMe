import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import CustomInput from "../CustomInput/CustomInput";
import { ICustomForm, IElement } from "../../utils/types";
import { ChangeEvent, useEffect, useState } from "react";
import clsx from "clsx";
import CustomSelect from "../CustomSelect/CustomSelect";

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
  const [isDisabledBtn, setIsDisabledBtn] = useState(true);

  function handleCustomInput(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    onFormData(event.target.name, event.target.value);
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
          />
        );
        break;
    }

    return content;
  }

  // Determine whether button should be disabled
  useEffect(() => {
    const isValid =
      buttonText === "Register"
        ? !formData.email &&
          !formData.name &&
          !formData.password &&
          !formData.termsConditions &&
          !formData.role
        : !formData.email && !formData.password;

    setIsDisabledBtn(isValid);
  }, [buttonText, formData]);

  return (
    <form className="reduceWidth" onSubmit={onHandleSubmit}>
      {formControls.map((singleElement) => renderFormElement(singleElement))}

      <div className="reduceWidth flex w-80 items-center justify-center py-6">
        <button
          className={clsx(
            className,
            isDisabledBtn && "cursor-not-allowed opacity-50",
          )}
          disabled={isDisabledBtn}
        >
          {buttonText || "Submit"}
        </button>
      </div>
    </form>
  );
}
