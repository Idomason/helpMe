import CustomCheckbox from "../CustomCheckbox/CustomCheckbox";
import CustomInput from "../CustomInput/CustomInput";
import { ICustomForm, IElement } from "../../utils/types";
import { ChangeEvent } from "react";

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
  function handleCustomInput(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    onFormData(event);
  }

  function renderFormElement(element: IElement) {
    let content = null;

    switch (element.componentType) {
      case formTypes.INPUT:
        content = (
          <CustomInput
            name={element.name}
            type={element.type}
            id={element.id}
            label={element.label}
            value={formData[element.name] as string}
            onChange={handleCustomInput}
            placeholder={element.placeholder}
          />
        );

        break;
      case formTypes.CHECKBOX:
        content = (
          <CustomCheckbox
            name={element.name}
            type={element.type}
            id={element.id}
            label={element.label}
            link={element.link}
            checked={formData[element.name] as boolean}
            onChange={handleCustomInput}
          />
        );
        break;

      default:
        content = (
          <CustomInput
            name={element.name}
            type={element.type}
            id={element.id}
            label={element.label}
            value={formData[element.name] as string}
            onChange={handleCustomInput}
            placeholder={element.placeholder}
          />
        );
        break;
    }

    return content;
  }

  function checkIf() {
    if (buttonText === "Register") {
      if (
        !formData.termsConditions ||
        !formData.name ||
        !formData.email ||
        !formData.password
      )
        return true;
    }
  }
  const checkFlag = checkIf();

  return (
    <form className="reduceWidth" onSubmit={onHandleSubmit}>
      {formControls.map((singleElement) => renderFormElement(singleElement))}

      <div className="reduceWidth flex w-80 items-center justify-center py-6">
        <button
          className={`${className} ${
            checkFlag ? "cursor-not-allowed opacity-50" : ""
          } ${
            !formData.email || !formData.password
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
        >
          {buttonText || "Submit"}
        </button>
      </div>
    </form>
  );
}
